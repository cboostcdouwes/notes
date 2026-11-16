// Builds the page, serves it locally and checks what a viewer sees, in headless Chromium (and optionally Firefox).
// Usage: node tests/run.mjs [--gpu=vulkan|gl|swiftshader] [--firefox]
// Needs puppeteer: set PUPPETEER to its module path if it is not the mermaid-cli copy below; CHROMIUM / FIREFOX to the
// browsers if they are not in /usr/bin.
import { execFileSync } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PUPPETEER = process.env.PUPPETEER || "/usr/lib/node_modules/@mermaid-js/mermaid-cli/node_modules/puppeteer/lib/puppeteer/puppeteer.js";
if (!fs.existsSync(PUPPETEER)) { console.error("puppeteer not found at " + PUPPETEER + ": install it (npm i -g puppeteer) and set PUPPETEER to its module path"); process.exit(2); }
const puppeteer = (await import(PUPPETEER)).default;
const arg = (name, dflt) => (process.argv.find((a) => a.startsWith("--" + name + "=")) || "").split("=")[1] || dflt;
const GPU = arg("gpu", "vulkan"), FIREFOX = process.argv.includes("--firefox");

execFileSync("python3", [path.join(ROOT, "build.py")], { stdio: "inherit" });
const page = fs.readFileSync(path.join(ROOT, "index.html"));
// the page, and an empty answer for anything else the browser asks for (the favicon)
const server = http.createServer((req, res) => { if (req.url.split("?")[0] === "/") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(page); } else { res.writeHead(204); res.end(); } });
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const URL_ = "http://127.0.0.1:" + server.address().port + "/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
async function check(name, fn) {
  try { await fn(); results.push(["ok", name]); console.log("ok    " + name); }
  catch (e) { results.push(["FAIL", name, e.message]); console.log("FAIL  " + name + ": " + e.message); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

async function open(browser, hash) {
  const p = await browser.newPage(); await p.setViewport({ width: 1500, height: 1300 });
  p.errors = []; p.on("pageerror", (e) => p.errors.push(e.message)); p.on("console", (m) => { if (m.type() === "error") p.errors.push(m.text()); });
  await p.goto(URL_ + (hash || ""), { waitUntil: "load", timeout: 60000 });
  await p.waitForFunction(() => window.__scanner, { timeout: 30000 });
  return p;
}
// Set controls as a viewer would (value, then input and change events).
const setControls = (p, o) => p.evaluate((o) => {
  for (const [id, v] of Object.entries(o)) { const e = document.getElementById(id); if (e.type === "checkbox") e.checked = v; else e.value = v; e.dispatchEvent(new Event("input")); e.dispatchEvent(new Event("change")); }
}, o);
// The controls the checks below change, at their defaults, so each check starts from the same state.
const DEFAULTS = { "f-splinter": false, "f-fog": false, driver: "dc", vib: "0.1", "f-uncal": false, lightcol: "matched", shutter: "global",
  daylight: "none", "win-angle": "0", "win-purge": false, "f-bar": false, "side-h": "260", "side-x": "0", louvre: "0", "opt-indirect": false, months: "0" };
// Photo render of a view with the feed paused; keeps each image's pixels in the page under tag.
async function render(p, tag, view, settings) {
  await setControls(p, Object.assign({}, DEFAULTS, settings || {}, { "ph-view": view, "ph-n": "16" }));
  await p.evaluate(() => { document.getElementById("tab-photo").click(); document.getElementById("ph-status").textContent = ""; document.getElementById("ph-run").click(); });
  await p.waitForFunction(() => /^Done/.test(document.getElementById("ph-status").textContent), { timeout: 120000 });
  return p.evaluate((tag) => {
    window.__imgs = window.__imgs || {};
    window.__imgs[tag] = [...document.querySelectorAll("#ph-out canvas")].map((c) => c.getContext("2d").getImageData(0, 0, c.width, c.height));
    return window.__imgs[tag].length;
  }, tag);
}
// mean absolute difference per channel (0-255) between two renders' image i
const diff = (p, a, b, i) => p.evaluate((a, b, i) => {
  const A = window.__imgs[a][i].data, B = window.__imgs[b][i].data; let s = 0;
  for (let k = 0; k < A.length; k += 4) s += Math.abs(A[k] - B[k]) + Math.abs(A[k + 1] - B[k + 1]) + Math.abs(A[k + 2] - B[k + 2]);
  return s / (A.length / 4 * 3);
}, a, b, i || 0);
// pixels that clip in all three channels in render tag, image i, inside the box [x0, y0, w, h]
const clippedIn = (p, tag, i, box) => p.evaluate((tag, i, [x0, y0, w, h]) => {
  const img = window.__imgs[tag][i], D = img.data; let n = 0;
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const k = 4 * (y * img.width + x); if (D[k] > 250 && D[k + 1] > 250 && D[k + 2] > 250) n++; }
  return n;
}, tag, i, box);
// Linear light (sRGB decoded, mean of the channels) of render tag image i, as rows of pixels; for the checks below.
const LINEAR = `(img) => { const L = new Float32Array(img.width * img.height), D = img.data, lin = (v) => (v /= 255) <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  for (let k = 0; k < L.length; k++) L[k] = (lin(D[4 * k]) + lin(D[4 * k + 1]) + lin(D[4 * k + 2])) / 3; return L; }`;
// Light in render b relative to render a, over the pixels moderately lit in a (neither dark nor near clipping when brighter):
// per row (rows), per column (cols), overall (all), or over the brightest tenth of those pixels in a (bright).
// span: [first, last) share of the image width to use (default all).
const ratios = (p, a, b, i, span) => p.evaluate((a, b, i, LINEAR, span) => {
  const lin = eval(LINEAR), A = window.__imgs[a][i], w = A.width, h = A.height, LA = lin(A), LB = lin(window.__imgs[b][i]);
  const rs = new Float64Array(h), ra = new Float64Array(h), cs = new Float64Array(w), ca = new Float64Array(w), pairs = []; let sa = 0, sb = 0;
  const x0 = Math.floor(span[0] * w), x1 = Math.ceil(span[1] * w);
  for (let y = 0; y < h; y++) for (let x = x0; x < x1; x++) {
    const k = y * w + x, va = LA[k], vb = LB[k];
    if (va < 0.03 || va > 0.6) continue;
    ra[y] += va; rs[y] += vb; ca[x] += va; cs[x] += vb; sa += va; sb += vb; pairs.push([va, vb]);
  }
  const rows = [], cols = [];
  for (let y = 0; y < h; y++) if (ra[y] > 1) rows.push(rs[y] / ra[y]);
  for (let x = 0; x < w; x++) if (ca[x] > 1) cols.push(cs[x] / ca[x]);
  const top = pairs.sort((u, v) => v[0] - u[0]).slice(0, Math.ceil(pairs.length / 10));
  return { rows: rows, cols: cols, all: sb / sa, bright: top.reduce((s, q) => s + q[1], 0) / top.reduce((s, q) => s + q[0], 0) };
}, a, b, i, LINEAR, span || [0, 1]);
// a number from the Timing & data tab: the first match of re in the row whose text matches row
const budgetNumber = (p, row, re) => p.evaluate((row, re) => {
  const r = [...document.querySelectorAll("#budget tr")].map((t) => t.textContent).find((t) => new RegExp(row, "i").test(t));
  const m = r && new RegExp(re).exec(r); return m ? +m[1] / 100 : null;
}, row, re);
const mean = (p, tag, i) => p.evaluate((tag, i) => { const D = window.__imgs[tag][i].data; let s = 0; for (let k = 0; k < D.length; k += 4) s += D[k] + D[k + 1] + D[k + 2]; return s / (D.length / 4 * 3); }, tag, i || 0);
// the Batch tab's last row: { condLab, condWrong, ... } in %
async function batch(p, settings) {
  await setControls(p, Object.assign({}, DEFAULTS, settings || {}, { "batch-n": "300" }));
  const before = await p.evaluate(() => document.querySelectorAll("#batch-table tbody tr td.num").length);
  await p.evaluate(() => { document.getElementById("tab-batch").click(); document.getElementById("batch-run").click(); });
  await p.waitForFunction((n) => document.querySelectorAll("#batch-table tbody tr td.num").length > n && /^Done/.test(document.getElementById("batch-status").textContent), { timeout: 120000 }, before);
  return p.evaluate(() => {
    const cells = [...document.querySelectorAll("#batch-table tbody tr")].pop().querySelectorAll("td.num"), pct = (i) => parseFloat(cells[i].textContent);
    return { typeLab: pct(1), typeWrong: pct(2), condLab: pct(3), condWrong: pct(4) };
  });
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", headless: true,
  args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=" + GPU, "--enable-unsafe-swiftshader"] });
const downloads = fs.mkdtempSync(path.join(os.tmpdir(), "scanner-dl-"));
let p;
try {
  await check("the page loads, compiles the tracer and scans pallets without errors", async () => {
    p = await open(browser);
    await p.waitForFunction(() => +document.getElementById("st-count").textContent > 0, { timeout: 60000 });
    const err = await p.evaluate(() => (document.querySelector(".err") || {}).textContent || "");
    expect(!err, "error shown: " + err);
    expect(!p.errors.length, p.errors.join("; "));
  });
  await p.evaluate(() => document.getElementById("pause").click());   // one frozen pallet for every render below

  await check("the same settings render the same image", async () => {
    await render(p, "base", "bottom"); await render(p, "base2", "bottom");
    expect(await diff(p, "base", "base2") < 0.5, "renders differ by " + (await diff(p, "base", "base2")).toFixed(2));
  });
  for (const [name, s] of [["a splinter on the window", { "f-splinter": true }], ["fogged windows", { "f-fog": true }], ["PWM-dimmed lights", { driver: "pwm" }],
    ["vibration", { vib: "1" }], ["uncalibrated lenses and sensors", { "f-uncal": true }]]) {
    await check(name + " changes the bottom image", async () => {
      await render(p, name, "bottom", s);
      const d = await diff(p, "base", name);
      expect(d > 1, "mean difference only " + d.toFixed(2));
    });
  }
  await check("a splinter darkens the bottom image", async () => {
    expect(await mean(p, "a splinter on the window") < await mean(p, "base") - 1, "not darker");
  });
  await check("a splinter slides off a steep window", async () => {
    await render(p, "steep", "bottom", { "win-angle": "40" }); await render(p, "steep, splinter", "bottom", { "win-angle": "40", "f-splinter": true });
    expect(await diff(p, "steep", "steep, splinter") < 0.5, "differs from the clean window by " + (await diff(p, "steep", "steep, splinter")).toFixed(2));
  });
  await check("an air purge keeps the windows from fogging", async () => {
    await render(p, "purged", "bottom", { "win-purge": true }); await render(p, "purged, fog", "bottom", { "win-purge": true, "f-fog": true });
    expect(await diff(p, "purged", "purged, fog") < 0.5, "differs from the clear window by " + (await diff(p, "purged", "purged, fog")).toFixed(2));
  });
  await check("a vertical window costs the ±25° cameras light, most at the ends of the line", async () => {
    await render(p, "vertical", "bottom", { "win-angle": "90" });
    for (const i of [0, 1]) {
      const mid = (await ratios(p, "base", "vertical", i, [0.4, 0.6])).all;
      const ends = ((await ratios(p, "base", "vertical", i, [0, 0.1])).all + (await ratios(p, "base", "vertical", i, [0.9, 1])).all) / 2;
      expect(mid < 0.95, "camera " + i + ": the middle keeps " + mid.toFixed(2) + " of its light");
      expect(ends < mid - 0.02, "camera " + i + ": the ends keep " + ends.toFixed(2) + ", the middle " + mid.toFixed(2));
    }
  });
  // The budget and the stand-in classifier use script copies of three shader formulas (flicker, louvre, window
  // debris); each check compares the copy's number in the Timing & data tab with the same quantity in the image.
  await check("the flicker in the Timing & data tab matches the bottom image", async () => {
    await render(p, "ripple", "bottom", { driver: "ripple" });
    const want = await budgetNumber(p, "flicker between lines", "differs up to (\\d+)%"), rows = (await ratios(p, "base", "ripple", 0)).rows.sort((x, y) => x - y);
    const got = rows[Math.floor(rows.length * 0.98)] - rows[Math.floor(rows.length * 0.02)];
    expect(want !== null && Math.abs(got - want) < 0.1, "tab says " + want + ", image spread " + got.toFixed(2));
  });
  // The tab's share is for the bottom faces (the surfaces nearest the bar, so the brightest) at the belt centre: the
  // middle columns. Higher surfaces get relatively more light through the louvre, and so do faces right above one of
  // the bar's light points. The light that is not the bar's (lamps through gaps, bounced light) is measured with the
  // bar off and taken out.
  await check("the louvre's light share in the Timing & data tab matches the bottom faces at the belt centre", async () => {
    await render(p, "louvre", "bottom", { louvre: "30" });
    const want = await budgetNumber(p, "louvre", "passes (\\d+)%");
    await render(p, "bar-off", "bottom", { "f-bar": true });
    const MID = [0.47, 0.53], other = (await ratios(p, "base", "bar-off", 0, MID)).bright, r = (await ratios(p, "base", "louvre", 0, MID)).bright;
    const got = (r - other) / (1 - other);
    expect(want !== null && Math.abs(got - want) < 0.1, "tab says " + want + ", image " + got.toFixed(2));
  });
  await check("the debris estimate in the Timing & data tab matches the bottom images", async () => {
    await setControls(p, Object.assign({}, DEFAULTS, { "f-splinter": true }));
    const want = await budgetNumber(p, "Debris on the bottom windows", "about (\\d+)%");
    let loss = 0;
    for (const i of [0, 1]) { const cols = (await ratios(p, "base", "a splinter on the window", i)).cols; loss += cols.reduce((s, r) => s + Math.max(0, 1 - r), 0) / cols.length / 2; }
    expect(want !== null && loss > want / 2 && loss < want * 2, "tab says " + want + ", images lose " + loss.toFixed(3) + " on average");
  });
  await check("warm station lamps change the station images", async () => {
    await render(p, "st-base", "station"); await render(p, "st-warm", "station", { lightcol: "warm" });
    expect(await diff(p, "st-base", "st-warm", 1) > 1, "no change");
  });
  // The left side camera (image 1) at the scan line looks down the gap at the LED bar: a clipped strip at the bottom
  // centre of its image. 150 mm along the belt, the rollers hide it.
  await check("moving the side cameras along the belt hides the LED bar from them", async () => {
    await render(p, "st-moved", "station", { "side-x": "150" });
    const GAP_BOX = [200, 180, 80, 60], at = await clippedIn(p, "st-base", 1, GAP_BOX), moved = await clippedIn(p, "st-moved", 1, GAP_BOX);
    expect(at > 300 && moved < at / 3, "clipped pixels under the gap at the scan line: " + at + ", moved 150 mm: " + moved);
  });
  await check("the photo of the current 3D view renders", async () => {
    await render(p, "view", "view");
    expect(await mean(p, "view") > 10, "image is black");
  });
  await check("Save PNG downloads the render when the page is not on claude.ai", async () => {
    const cdp = await p.target().createCDPSession();
    await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
    await p.evaluate(() => document.querySelector("#ph-out figcaption button").click());
    for (let i = 0; i < 40 && !fs.readdirSync(downloads).some((f) => f.endsWith(".png")); i++) await sleep(250);
    const f = fs.readdirSync(downloads).find((x) => x.endsWith(".png"));
    expect(f, "no file downloaded");
    expect(fs.readFileSync(path.join(downloads, f)).subarray(1, 4).toString() === "PNG", f + " is not a PNG");
  });
  await check("the Timing & data tab flags a louvre and PWM drivers", async () => {
    await setControls(p, Object.assign({}, DEFAULTS, { louvre: "30", driver: "pwm" }));
    const rows = await p.evaluate(() => [...document.querySelectorAll("#budget tr")].map((r) => r.textContent));
    expect(rows.some((r) => /louvre/i.test(r) && /short/.test(r)), "no louvre row marked short");
    expect(rows.some((r) => /flicker between lines/i.test(r) && /short/.test(r)), "no flicker row marked short");
  });
  // Poorer images make the stand-in miss damage, so more condition labels are wrong.
  await check("debris, flicker and fog make the stand-in classifier's condition labels worse", async () => {
    const clean = await batch(p), poor = await batch(p, { "f-splinter": true, driver: "pwm", "f-fog": true });
    expect(poor.condWrong > clean.condWrong + 5, "condition wrong " + clean.condWrong + "% clean vs " + poor.condWrong + "% with them");
  });
  await check("an air purge keeps the windows clean enough for better condition labels after a year", async () => {
    const flat = await batch(p, { months: "12" }), purged = await batch(p, { months: "12", "win-purge": true });
    expect(flat.condWrong > purged.condWrong + 5, "condition wrong " + flat.condWrong + "% flat vs " + purged.condWrong + "% purged");
  });
  await check("Compare runs with indirect light", async () => {
    await setControls(p, Object.assign({}, DEFAULTS, { "opt-indirect": true }));
    await p.evaluate(() => { document.getElementById("tab-cmp").click(); document.getElementById("cmp-out").innerHTML = ""; document.getElementById("cmp-run").click(); });
    await p.waitForFunction(() => document.querySelectorAll("#cmp-out figure").length >= 2, { timeout: 180000 });
    expect(!p.errors.length, p.errors.join("; "));
  });
  await check("the Assumptions tab lists every assumption with a value", async () => {
    await p.evaluate(() => document.getElementById("tab-assume").click());
    const rows = await p.evaluate(() => [...document.querySelectorAll("#assume-table tbody tr")].filter((r) => r.children.length === 4).map((r) => r.children[1].textContent));
    expect(rows.length >= 40, "only " + rows.length + " rows");
    const bad = rows.filter((v) => !v || /NaN|undefined/.test(v));
    expect(!bad.length, "rows without a proper value: " + bad.join(" | "));
  });
  // Renders each damage of each type against the intact pallet in the Compare tab (dual cameras, 100 mm gap) and lists
  // the ones the bottom cameras do not see at all: those need the station cameras.
  await check("every damage of every pallet type builds and renders", async () => {
    await setControls(p, DEFAULTS);
    await p.evaluate(() => { document.getElementById("tab-cmp").click(); document.getElementById("cmp-a").value = "3"; document.getElementById("cmp-b").value = "3"; });
    const types = await p.evaluate(() => [...document.getElementById("cmp-type").options].map((o) => o.value));
    const unseen = [];
    for (const t of types) {
      const n = await p.evaluate((t) => { const s = document.getElementById("cmp-type"); s.value = t; s.dispatchEvent(new Event("change")); return document.getElementById("cmp-dmg").options.length; }, t);
      for (let i = 0; i < n; i++) {
        const [name, px] = await p.evaluate(async (i) => {
          const d = document.getElementById("cmp-dmg"); d.value = String(i); document.getElementById("cmp-out").innerHTML = ""; document.getElementById("cmp-run").click();
          for (let k = 0; k < 600 && document.querySelectorAll("#cmp-out figure").length < 2; k++) await new Promise((r) => setTimeout(r, 50));
          const cap = (document.querySelector("#cmp-out figcaption") || {}).textContent || "", m = /([\d,]+) px changed/.exec(cap);
          return [d.selectedOptions[0].textContent, m ? +m[1].replace(/,/g, "") : -1];
        }, i);
        expect(px >= 0, t + ": " + name + " did not render");
        if (px === 0) unseen.push(t + ": " + name);
      }
    }
    console.log("      not seen by the bottom cameras: " + (unseen.join("; ") || "none"));
    expect(!p.errors.length, p.errors.join("; "));
  });
  await check("a vertical window blinds the 0° camera, and the Timing & data tab says so", async () => {
    const q = await open(browser);
    await q.evaluate(() => { document.querySelector('#presets button[data-cams="0"]').click(); document.getElementById("pause").click(); });
    await render(q, "0° flat", "bottom"); await render(q, "0° vertical", "bottom", { "win-angle": "90" });
    const flat = await mean(q, "0° flat"), vertical = await mean(q, "0° vertical");
    const rows = await q.evaluate(() => [...document.querySelectorAll("#budget tr")].map((r) => r.textContent));
    await q.close();
    // only the sensor's noise is left, lifted by the gain that makes up for the missing light
    expect(vertical < 0.2 * flat, "mean " + vertical.toFixed(1) + " behind the vertical window vs " + flat.toFixed(1) + " behind the flat one");
    expect(rows.some((r) => /window optics/i.test(r) && /short/.test(r)), "no window optics row marked short");
  });
  await check("a settings code restores the controls", async () => {
    const want = { gap: "150", louvre: "30", driver: "pwm", "side-h": "100", "f-fog": true, "opt-indirect": true, "win-angle": "60", "win-purge": true };
    await setControls(p, want);
    await p.evaluate(() => document.getElementById("set-copy").click());
    const code = await p.evaluate(() => document.getElementById("set-code").value);
    const q = await open(browser, "#s=" + code);
    const got = await q.evaluate((ids) => Object.fromEntries(ids.map((id) => { const e = document.getElementById(id); return [id, e.type === "checkbox" ? e.checked : e.value]; })), Object.keys(want));
    await q.close();
    for (const [k, v] of Object.entries(want)) expect(got[k] === v, k + " came back as " + got[k] + ", not " + v);
  });
  await check("no errors during the checks", async () => { expect(!p.errors.length, p.errors.join("; ")); });
} finally {
  await browser.close();
}

if (FIREFOX) {
  const ff = await puppeteer.launch({ browser: "firefox", executablePath: process.env.FIREFOX || "/usr/bin/firefox", headless: true, extraPrefsFirefox: { "webgl.force-enabled": true } });
  try {
    await check("Firefox: the page loads and scans pallets without errors", async () => {
      const q = await open(ff);
      await q.waitForFunction(() => +document.getElementById("st-count").textContent > 0, { timeout: 90000 });
      expect(!q.errors.length, q.errors.join("; "));
    });
  } finally { await ff.close(); }
}
server.close();
fs.rmSync(downloads, { recursive: true, force: true });
const failed = results.filter((r) => r[0] === "FAIL");
console.log("\n" + (results.length - failed.length) + " of " + results.length + " checks passed");
process.exit(failed.length ? 1 : 0);
