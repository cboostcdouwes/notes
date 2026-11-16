  // ---------------- batch runs of the stand-in classifier ----------------
  // Draws pallets the way the live feed does and runs each through decide(). Touching pairs that the detector would
  // see as one box (the middle section opens less than MERGE_GAP_MM between them) give one label for two pallets.
  // Not included: tracking and trigger errors, sticking at the gap; these affect the live run only.
  const MERGE_GAP_MM = 20, BATCH_CHUNK = 25;   // the detector's merge distance (as in detect()); pallets per step
  const batchRuns = [];
  let batchBusy = false;
  function setupSummary() {
    const o = opts(), cam = presetKey === "dual" ? "dual ±25° at ±" + sideOffset + " mm" : (+presetKey > 0 ? "+" : "") + presetKey + "° centred";
    const faults = [service.barOut && "LED bar out", service.lampOut && "lamp out", service.encErr && "encoder 8% short",
      o.louvre && "louvre ±" + o.louvre + "°", $("protect").value !== "none" && $("protect").selectedOptions[0].textContent, o.splinter && "splinter on a window",
      o.fog && "fogged windows", $("driver").value !== "dc" && $("driver").selectedOptions[0].textContent, o.vib > 0 && "vibration " + o.vib.toFixed(2) + " mm",
      o.uncal && "uncalibrated", o.indirect && "indirect light"].filter(Boolean);
    return [cam, "gap " + gap + " mm", PX / 1024 + "k px", o.fnum ? "f/" + o.fnum : "pinhole", Math.round(o.expUs) + " µs", "LED " + o.light + "%",
      "dirt " + Math.round(o.dirt * 100) + "%", service.months + " mo", (beltSpeed / 1000).toFixed(2) + " m/s", sectionText(sectionFactor)].concat(faults).join(", ");
  }
  const share = (k, n) => ({ p: n ? k / n : 0, half: n ? 1.96 * Math.sqrt((k / n) * (1 - k / n) / n) : 0, n: n });   // 95% normal range
  const fmtShare = (s) => (s.n ? Math.round(s.p * 100) + "% ±" + Math.round(s.half * 100) : "–");
  function runBatch() {
    if (batchBusy) return;
    if (!TYPES.some((t) => enabled.has(t.id))) { $("batch-status").textContent = "Tick at least one pallet type."; return; }
    batchBusy = true; markEvent("analysis");
    const total = +$("batch-n").value, stats = { n: 0, typeLab: 0, typeWrong: 0, condLab: 0, condWrong: 0 }, found = { discard: [0, 0], repair: [0, 0], usable: [0, 0] };
    const transport = opts().transport, setup = setupSummary(), t0 = performance.now();
    let drawn = 0, prev = null, batchRs = 777 + batchRuns.length;
    const step = () => {
      const liveRs = rs; rs = batchRs;   // the batch has its own draws, so the live feed's sequence is untouched
      for (let i = 0; i < BATCH_CHUNK && drawn < total; i++, drawn++) {
        const g = makePallet(weightedType(), rnd() < damageShare), touching = transport && prev && rnd() < FEED.touching, mergeProne = touching && rnd() < FEED.mergeProne;
        if (mergeProne && (sectionFactor - 1) * prev.L < MERGE_GAP_MM) { stats.n++; prev = g; continue; }   // hidden behind the pallet ahead
        const res = decide(g);
        tally(stats, res, 1);
        const truth = g.verdict === "borderline" ? null : g.verdict === "flag" ? null : g.verdict;
        if (truth) { found[truth][1]++; if (truth === "usable" ? res.cond !== "usable" && res.cond !== "undecided" : res.cond === truth) found[truth][0]++; }
        prev = g;
      }
      batchRs = rs; rs = liveRs;
      $("batch-status").textContent = "Running: " + drawn + " of " + total + " pallets…";
      if (drawn < total) { setTimeout(step, 0); return; }
      batchBusy = false; sceneKey = "";
      batchRuns.push({ setup: setup, n: stats.n, typeLab: share(stats.typeLab, stats.n), typeWrong: share(stats.typeWrong, stats.typeLab),
        condLab: share(stats.condLab, stats.n), condWrong: share(stats.condWrong, stats.condLab),
        discard: share(found.discard[0], found.discard[1]), repair: share(found.repair[0], found.repair[1]), falseAlarm: share(found.usable[0], found.usable[1]) });
      renderBatch();
      $("batch-status").textContent = "Done: " + total + " pallets in " + ((performance.now() - t0) / 1000).toFixed(1) + " s. Change a setting and run again to compare; ± is a 95% range.";
    };
    step();
  }
  function renderBatch() {
    const body = $("batch-table").querySelector("tbody");
    if (!batchRuns.length) { body.innerHTML = '<tr><td colspan="10" class="cap-dim">No runs yet.</td></tr>'; return; }
    const mark = (s, ok) => fmtShare(s) + (s.n ? (ok ? ' <span class="chip ok">ok</span>' : ' <span class="chip bad">short</span>') : "");
    body.innerHTML = batchRuns.map((r, i) => "<tr><td>" + (i + 1) + '</td><td style="white-space:normal;min-width:220px">' + r.setup + '</td><td class="num">' + r.n + "</td>" +
      '<td class="num">' + mark(r.typeLab, r.typeLab.p * 100 >= CLS.labelTarget) + '</td><td class="num">' + mark(r.typeWrong, r.typeWrong.p * 100 <= CLS.wrongLimit) + "</td>" +
      '<td class="num">' + mark(r.condLab, r.condLab.p * 100 >= CLS.labelTarget) + '</td><td class="num">' + mark(r.condWrong, r.condWrong.p * 100 <= CLS.wrongLimit) + "</td>" +
      '<td class="num">' + fmtShare(r.discard) + '</td><td class="num">' + fmtShare(r.repair) + '</td><td class="num">' + fmtShare(r.falseAlarm) + "</td></tr>").join("");
  }
  function batchCsv() {
    const cols = ["typeLab", "typeWrong", "condLab", "condWrong", "discard", "repair", "falseAlarm"];
    const head = ["run", "setup", "pallets"].concat(cols.flatMap((c) => [c + "_pct", c + "_pm95"])).join(",");
    return [head].concat(batchRuns.map((r, i) => [i + 1, '"' + r.setup.replace(/"/g, "'") + '"', r.n].concat(cols.flatMap((c) => [(r[c].p * 100).toFixed(1), (r[c].half * 100).toFixed(1)])).join(","))).join("\n");
  }
  $("batch-run").addEventListener("click", runBatch);
  $("batch-clear").addEventListener("click", () => { batchRuns.length = 0; renderBatch(); });
  $("batch-csv").addEventListener("click", () => {
    if (!batchRuns.length) { $("batch-status").textContent = "Nothing to copy yet."; return; }
    const csv = batchCsv();
    (navigator.clipboard ? navigator.clipboard.writeText(csv) : Promise.reject(new Error("no clipboard")))
      .then(() => { $("batch-status").textContent = "CSV copied (" + batchRuns.length + " runs)."; },
        () => { $("batch-status").textContent = "The clipboard is blocked here; select and copy the CSV below."; $("batch-status").insertAdjacentHTML("beforeend", '<textarea readonly style="width:100%;height:120px;font:0.72rem var(--font-data)">' + csv + "</textarea>"); });
  });
