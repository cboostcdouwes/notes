  // ---------------- stand-in classifier ----------------
  // Not a trained model: a rough stand-in that turns image evidence into labels, so a setting can be checked against
  // the project targets: at least 80% of pallets labelled, at most 20% of labelled pallets wrong (type and condition
  // counted separately). A damage is found with a probability that grows with how much of the bottom image it changes
  // (traced at low resolution for the current cameras, gap and light) and with image quality; close calls are left
  // undecided. All probabilities and thresholds are assumptions.
  const CLS = { findCm2: 15, borderCm2: 40, closeCall: 0.1, falseAlarm: 0.03, labelTarget: 80, wrongLimit: 20 };
  // how reliably the type is told apart from the underside, per type: one-way and EUR share a size (assumed)
  const TYPE_EASE = { eur: 0.95, oneway: 0.88, ind: 0.93, chep: 0.98, half: 0.97, plastic3: 0.95, nest: 0.93, gma: 0.96, moulded: 0.95 };
  let crs = 13; const crnd = () => { crs = (crs * 1664525 + 1013904223) >>> 0; return crs / 4294967296; };
  const clsStats = { n: 0, typeLab: 0, typeWrong: 0, condLab: 0, condWrong: 0 };
  const evCache = new Map();
  function diffCount(a, b) {
    const A = a.getContext("2d").getImageData(0, 0, a.width, a.height).data, B = b.getContext("2d").getImageData(0, 0, b.width, b.height).data;
    let n = 0;
    for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > DIFF_LEVEL) n++;
    return n;
  }
  // cm² of belt-plane image that a damage changes, best bottom camera, for the current setup (cached)
  function damageEvidence(type, label) {
    const o = opts(), key = [type.id, label, gap, rigKey(cams), o.rect].join("|");
    if (evCache.has(key)) return evCache.get(key);
    const dmg = type.damages.find((d) => d[0] === label);
    let cm2 = 0;
    if (dmg) {
      const intact = analysisPallet(type), damaged = analysisPallet(type, dmg), ro = { fnum: 0, dirt: 0, rect: o.rect, lights: lightsFor(cams, "line") };
      cams.forEach((c) => {
        const cam = bottomCam(c.spec, 256, Object.assign({}, o, { anyZero: specs.some((s) => s.tilt === 0) })), pit = cam.mmPerPx;
        cm2 = Math.max(cm2, diffCount(renderPass(intact, cam, ro, gap, pit), renderPass(damaged, cam, ro, gap, pit)) * cam.mmPerPx * pit / 100);
      });
    }
    evCache.set(key, cm2);
    return cm2;
  }
  // 0..1 for the condition and the type: signal-to-noise, clipping, window dirt; a compressed image misjudges size
  function imageQuality() {
    const o = opts(), k = lineExposure(o).k * service.lightFactor() * (service.barOut ? 0.1 : 1), s = sensorAt(k);
    const snr = Math.min(1, Math.max(0, (s.db - 14) / 20)), clip = k > 2 ? Math.max(0.2, 1 - (k - 2) / 4) : 1, q = snr * clip * (1 - 0.5 * o.dirt);
    return { cond: q, type: q * Math.max(0, 1 - 4 * service.encErr) };
  }
  // The stand-in's decision for one pallet g: condition and type labels, and whether they match the ground truth.
  function decide(g) {
    const q = imageQuality(), wear = g.wear.join(" "), found = [];
    let unsure = false;
    g.damages.forEach(([label, sev]) => {
      const pd = sev === "flag" ? 0.9 * q.cond : q.cond * (1 - Math.exp(-damageEvidence(g.type, label) / (sev === "borderline" ? CLS.borderCm2 : CLS.findCm2)));
      const r = crnd();
      if (Math.abs(r - pd) < CLS.closeCall) unsure = true;
      if (r < pd) found.push(sev);
    });
    const lookalikes = ["snow", "ice", "mud", "wet"].filter((w) => wear.includes(w)).length;   // dirt that looks like damage
    if (!found.length && crnd() < CLS.falseAlarm + 0.03 * lookalikes + 0.1 * (1 - q.cond)) found.push("repair");
    const cond = unsure ? "undecided" : ["discard", "repair", "flag"].find((v) => found.includes(v)) || (found.includes("borderline") ? "repair" : "usable");
    const condOk = cond === g.verdict || (g.verdict === "borderline" && (cond === "usable" || cond === "repair"));
    let pt = (TYPE_EASE[g.type.id] || 0.9) * q.type;
    if (g.orient.pitch) pt *= 0.6;   // upside down: the bottom cameras see the deck
    if (g.damages.some((d) => /stacked/.test(d[0]))) pt *= 0.8;
    if (/snow|ice/.test(wear) || g.damages.some((d) => /cardboard/.test(d[0]))) pt *= 0.85;
    const type = crnd() < pt ? "right" : crnd() < 0.5 ? "undecided" : "wrong";
    return { cond: cond, condOk: condOk, type: type };
  }
  // pallets: how many this result stands for (a merged capture hides the pallets behind; they get no label)
  function tally(stats, res, pallets) {
    stats.n += pallets;
    if (res.type !== "undecided") { stats.typeLab++; if (res.type === "wrong") stats.typeWrong++; }
    if (res.cond !== "undecided") { stats.condLab++; if (!res.condOk) stats.condWrong++; }
  }
  function classify(t) {
    const res = decide(t.gt[0]);
    res.hidden = t.gt.length - 1;
    tally(clsStats, res, t.gt.length);
    updateClsSummary();
    return res;
  }
  function clsCaption(c) {
    const mark = (ok) => (ok ? ' <span style="color:var(--ok)">✓</span>' : ' <span style="color:var(--bad)">✗</span>');
    return "<span>Classifier: type " + (c.type === "undecided" ? "undecided" : c.type === "right" ? "right" + mark(true) : "wrong" + mark(false)) +
      " · " + (c.cond === "undecided" ? "condition undecided" : c.cond + mark(c.condOk)) + (c.hidden ? " · " + c.hidden + " hidden pallet unlabelled" : "") + "</span>";
  }
  function updateClsSummary() {
    const s = clsStats, pct = (a, b) => (b ? Math.round(100 * a / b) : 0), chip = (ok) => '<span class="chip ' + (ok ? "ok" : "bad") + '">' + (ok ? "ok" : "short") + "</span>";
    const part = (name, lab, wrong) => { const l = pct(lab, s.n), w = pct(wrong, lab); return "<span>" + name + ": labelled " + l + "% " + chip(l >= CLS.labelTarget) + " · wrong " + w + "% " + chip(w <= CLS.wrongLimit) + "</span>"; };
    $("cls-sum").innerHTML = s.n ? "<strong>Stand-in classifier, " + s.n + " pallets</strong>" + part("Type", s.typeLab, s.typeWrong) + part("Condition", s.condLab, s.condWrong) +
      "<span>project targets: ≥ 80% labelled, ≤ 20% of those wrong · rough stand-in, not a trained model</span>" : "<span>Stand-in classifier: results appear as pallets finish.</span>";
  }
  function resetClassifier() { Object.assign(clsStats, { n: 0, typeLab: 0, typeWrong: 0, condLab: 0, condWrong: 0 }); updateClsSummary(); }
