  // ---------------- compare settings ----------------
  // camera setups to compare; the dual one takes its row's side offset
  const SETTINGS = [["Centred 0°", "0"], ["Centred +25°", "25"], ["Centred −25°", "-25"], ["Dual ±25°", "dual"]];
  [$("cmp-a"), $("cmp-b")].forEach((s) => SETTINGS.forEach(([n], i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; if (i === 3) o.selected = true; s.append(o); }));
  [["cmp-a", "cmp-sa"], ["cmp-b", "cmp-sb"]].forEach(([sel, side]) => {
    const show = () => { $(side + "-out").textContent = "±" + $(side).value + " mm"; $(side).disabled = SETTINGS[+$(sel).value][1] !== "dual"; };
    $(side).addEventListener("input", show); $(sel).addEventListener("change", show); show();
  });
  [$("cmp-ga"), $("cmp-gb")].forEach((s, j) => GAP_CHOICES.forEach((g) => { const o = document.createElement("option"); o.value = g; o.textContent = g + " mm"; if (g === (j ? 100 : 350)) o.selected = true; s.append(o); }));
  function fillDamages() { const t = TYPES.find((x) => x.id === cmpType.value); $("cmp-dmg").innerHTML = t.damages.map((d, i) => '<option value="' + i + '">' + d[0] + "</option>").join(""); }
  cmpType.addEventListener("change", fillDamages); fillDamages();
  const DIFF_LEVEL = 30;   // summed RGB difference (0-765) above which a pixel counts as changed
  // Line camera cam's image of pallet p at rest, 200 mm beyond its ends; the lines lie symmetrically about the pallet's
  // centre, so turned end over end the image lines up with one of the pallet turned round (runFlipCompare).
  function renderPass(p, cam, o, g, pit) {
    pit = pit || pitch;
    const rows = Math.ceil((2 * p.reach + 400) / pit), cv = document.createElement("canvas"); cv.width = cam.PX; cv.height = rows;
    const ctx = cv.getContext("2d"), s0 = -(rows - 1) * pit / 2;
    uploadScene([p], g);
    const step = o.indirect ? MAXROWS / 8 : MAXROWS;   // indirect light is slow: smaller draws keep the GPU responsive
    for (let r = 0; r < rows; r += step) {
      const n = Math.min(step, rows - r);
      traceLines(cam, s0 + r * pit, pit, n, Object.assign({ noise: 0, seed: 7, rowBase: r }, o));
      ctx.drawImage(glc, 0, 0, cam.PX, n, 0, r, cam.PX, n);
    }
    sceneKey = "";
    return cv;
  }
  // Image b with the pixels that differ from image a (same size) by more than DIFF_LEVEL in red, the rest in grey;
  // how many differ, and the mean difference per channel (0-255).
  function diffImage(a, b) {
    const A = a.getContext("2d").getImageData(0, 0, a.width, a.height).data, bctx = b.getContext("2d"), B = bctx.getImageData(0, 0, b.width, b.height).data;
    const D = bctx.createImageData(b.width, b.height);
    let changed = 0, sum = 0;
    for (let i = 0; i < A.length; i += 4) {
      const df = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
      sum += df;
      if (df > DIFF_LEVEL) { D.data[i] = 255; D.data[i + 1] = 40; D.data[i + 2] = 30; changed++; } else { D.data[i] = D.data[i + 1] = D.data[i + 2] = (B[i] + B[i + 1] + B[i + 2]) / 6; }
      D.data[i + 3] = 255;
    }
    const canvas = document.createElement("canvas"); canvas.width = b.width; canvas.height = b.height; canvas.getContext("2d").putImageData(D, 0, 0);
    return { canvas: canvas, changed: changed, mean: sum / (A.length / 4 * 3) };
  }
  // The selected pallet upside down as each top line-scan camera sees it, against the same pallet upright as the bottom
  // camera it copies sees it, with the current settings: what one learned model for both has to bridge. The top image
  // is turned end over end, as the flipped pallet passes the other way round (see TOP_LINE).
  function runFlipCompare() {
    if (!topLineCams.length) { $("cmp-status").textContent = "Choose top line-scan cameras first (Bottom cameras tab; they need the LED bar under the gap)."; return; }
    markEvent("analysis");
    const type = TYPES.find((t) => t.id === cmpType.value), dmg = type.damages[+$("cmp-dmg").value];
    $("cmp-status").textContent = "Tracing…";
    setTimeout(() => {
      const t0 = performance.now(), out = $("cmp-out"); out.innerHTML = "";
      const upright = analysisPallet(type, dmg), flipped = Object.assign({}, upright, { uid: -(++uidN), motion: staticMotion(0, 0, upright.H, Math.PI) });
      const o = opts(), ro = Object.assign({ fnum: o.fnum, dirt: o.dirt, rect: o.rect, lights: lightsFor(lineCams(), "line"), indirect: o.indirect }, lineExposure(o));
      const endOverEnd = (cv) => { const t = document.createElement("canvas"); t.width = cv.width; t.height = cv.height; const x = t.getContext("2d"); x.translate(0, cv.height); x.scale(1, -1); x.drawImage(cv, 0, 0); return t; };
      cams.forEach((cam, k) => {
        const a = renderPass(upright, cam, ro, gap), b = endOverEnd(renderPass(flipped, topLineCams[k], ro, gap)), d = diffImage(a, b);
        const fig = document.createElement("figure"), cap = document.createElement("figcaption"), pair = document.createElement("div");
        cap.className = "cap"; pair.className = "pair";
        [a, b, d.canvas].forEach((c) => { c.style.aspectRatio = (cam.PX * cam.mmPerPx).toFixed(0) + " / " + (c.height * pitch).toFixed(0); pair.append(c); });
        cap.innerHTML = '<span class="cap-type">' + camLabel(cam) + ": upright from below · flipped from above (" + TOP_LINE[topLineCams[k].how].name + ") · difference</span><span>" +
          (100 * d.changed / (a.width * a.height)).toFixed(1) + "% of pixels differ, mean difference " + d.mean.toFixed(1) + " of 255</span>" +
          (upright.H !== 2 * TOP_MIRROR_Y ? '<span class="cap-dim">deck at ' + upright.H + " mm; the top cameras are set for " + 2 * TOP_MIRROR_Y + " mm</span>" : "");
        fig.append(cap, pair); out.append(fig);
      });
      $("cmp-status").textContent = "Done in " + Math.round(performance.now() - t0) + " ms · " + type.name + ", " + dmg[0] + " · gap " + gap + " mm" + ($("opt-plates").checked ? " · black plates" : "") + " · noise off.";
    }, 30);
  }
  $("cmp-flip").addEventListener("click", runFlipCompare);
  function runCompare() {
    markEvent("analysis");
    const type = TYPES.find((t) => t.id === cmpType.value), dmg = type.damages[+$("cmp-dmg").value];
    $("cmp-status").textContent = "Tracing…";
    setTimeout(() => {
      const t0 = performance.now(), out = $("cmp-out"); out.innerHTML = "";
      const intact = analysisPallet(type), damaged = analysisPallet(type, dmg), o = opts();
      [[$("cmp-a"), $("cmp-ga"), $("cmp-sa")], [$("cmp-b"), $("cmp-gb"), $("cmp-sb")]].forEach(([sel, gsel, ssel]) => {
        const [label, key] = SETTINGS[+sel.value], g = +gsel.value, side = +ssel.value;
        const name = key === "dual" ? label + ", sides ±" + side + " mm" : label;
        const sp = key === "dual" ? [{ tilt: 25, z: -side }, { tilt: -25, z: side }] : [{ tilt: Number(key), z: 0 }];
        const cs = sp.map((s) => bottomCam(s, PX, Object.assign({}, o, { anyZero: sp.some((x) => x.tilt === 0) })));
        const fig = document.createElement("figure"), cap = document.createElement("figcaption"), pair = document.createElement("div");
        cap.className = "cap"; pair.className = "pair"; let changed = 0;
        cs.forEach((cam) => {
          const ro = Object.assign({ fnum: o.fnum, dirt: o.dirt, rect: o.rect, lights: lightsFor(cs, "line"), cams: cs, indirect: o.indirect }, lineExposure(o));
          const b = renderPass(damaged, cam, ro, g), d = diffImage(renderPass(intact, cam, ro, g), b);
          changed += d.changed;
          [b, d.canvas].forEach((c) => { c.style.aspectRatio = (cam.PX * cam.mmPerPx).toFixed(0) + " / " + (c.height * pitch).toFixed(0); pair.append(c); });
        });
        const cm2 = changed * cs[0].mmPerPx * pitch / 100;
        const gr = gapReport(g, cs, o.fnum);
        cap.innerHTML = '<span class="cap-type">' + name + ", gap " + g + " mm</span><span>" + dmg[0] + ": " + changed.toLocaleString() + " px changed (~" + Math.round(cm2) + " cm² on the belt plane)</span><span class=\"cap-dim\">per camera: damaged image, then difference vs intact · light reaches " + (gr.lit >= 300 ? "the full height" : gr.lit + " mm up") + (gr.rays < 0 ? " · rollers cut the view" : "") + "</span>";
        fig.append(cap, pair); out.append(fig);
      });
      $("cmp-status").textContent = "Done in " + Math.round(performance.now() - t0) + " ms · noise off, same pallet, " + PX + " px.";
    }, 30);
  }
  $("cmp-run").addEventListener("click", runCompare);

