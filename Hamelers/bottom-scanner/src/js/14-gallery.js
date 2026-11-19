  // ---------------- captures and gallery ----------------
  const fullRes = [];
  function finishPallets(sNow) {
    tracks.forEach((p) => {
      if (p.done || !p.caps || trackAt(p, sNow).trail <= MARGIN + 2 * pitch) return;
      p.done = true; scanned++; $("st-count").textContent = String(scanned);
      cardQueue.push({ t: p, stage: 0, card: null });
    });
    feed = feed.filter((p) => { if (palletX(p, sNow) > p.reach + 4500) { disposeMesh(p.mesh); return false; } return true; });
    tracks = tracks.filter((t) => {   // keep tracks that are capturing or still in or near the top view
      const capturing = t.caps && !t.done, nearby = trackAt(t, sNow).trail < 1600 && sNow - t.s < 2500;
      return capturing || nearby;
    });
  }
  const signedMm = (v) => { const r = Math.round(v); return (r > 0 ? "+" : r < 0 ? "−" : "") + Math.abs(r) + " mm"; };
  // A finished pallet's card is built in stages, one per frame and after the frame's canvas copies (classifying may
  // trace): classify, scale the bottom images, then the snapshots and caption. No single frame takes all of it.
  const cardQueue = [];
  function stepCards() {
    const job = cardQueue[0];
    if (!job) return;
    const p = job.t;
    if (job.stage === 0) p.cls = classify(p);
    else if (job.stage === 1) {
      const card = job.card = document.createElement("button"), imgs = document.createElement("div");
      card.type = "button"; card.className = "card"; imgs.className = "imgs";
      const lc = lineCams();
      p.caps.forEach((c, k) => {
        if (!c.cv) return;
        const tw = 300, th = Math.max(1, Math.round(c.rows * pitch / ((lc[k].z1 - lc[k].z0) / tw)));
        const t = document.createElement("canvas"); t.width = tw; t.height = th;
        t.getContext("2d").drawImage(c.cv, 0, 0, c.cv.width, Math.max(1, c.rows), 0, 0, tw, th); imgs.append(t);
      });
      card.append(imgs);
    } else {
      const card = job.card, snaps = AREA_CAMS.map((c, i) => p.snaps[i]).filter(isSnap);
      if (snaps.length) {
        const a = document.createElement("div"); a.className = "area";
        snaps.forEach((s) => { const t = document.createElement("canvas"); t.width = 160; t.height = Math.round(160 * s.height / s.width); t.getContext("2d").drawImage(s, 0, 0, t.width, t.height); a.append(t); });
        card.append(a);
      }
      const cap = document.createElement("div"); cap.className = "cap"; cap.innerHTML = trackCaption(p); card.append(cap);
      card.addEventListener("click", () => openZoom(p));
      markEvent("pallet");
      const empty = gallery.querySelector(".empty"); if (empty) empty.remove();
      gallery.prepend(card); while (gallery.children.length > KEEP_CARDS) gallery.lastChild.remove();
      fullRes.unshift(p);
      while (fullRes.length > (PX >= 4096 ? 1 : KEEP_FULLRES)) { const q = fullRes.pop(); if (q.caps) q.caps.forEach((c) => { c.cv = null; c.ctx = null; }); }
      cardQueue.shift();
      return;
    }
    job.stage++;
  }
  function trackCaption(t) {
    const fire = t.trig[0];
    return caption(t.gt[0]) +
      (t.gt.length > 1 ? '<span style="color:var(--bad)">The detector merged it with the touching pallet behind: one capture holds both.</span>' : "") +
      (t.cls ? clsCaption(t.cls) : "") +
      '<span class="cap-dim">track ' + t.id + (fire !== undefined ? " · top trigger error " + signedMm(fire) : "") + "</span>";
  }
  function caption(p) {
    const chip = p.verdict === "usable" ? '<span class="chip ok">intact</span>' : '<span class="chip ' + (p.verdict === "borderline" || p.verdict === "flag" ? "warn" : "bad") + '">' + p.verdict + "</span>";
    const tr = [];
    if (p.slip > 0.002) tr.push("slip " + (p.slip * 100).toFixed(1) + "%");
    if (p.ripple > 1) tr.push("speed ripple ±" + p.ripple.toFixed(0) + " mm");
    if (p.touching) tr.push("touching the pallet ahead");
    const m = p.motion;
    if (m && m.catches.length) tr.push("stuck at the gap " + m.catches.length + "× (" + m.catches.map((c) => c.stall.toFixed(0)).join(", ") + " mm, turned " +
      m.catches.reduce((a, c) => a + c.kickDeg, 0).toFixed(1).replace("-", "−") + "°)");
    if (m && m.hesitations) tr.push("hesitated " + m.hesitations + "×");
    return "<span>" + chip + '<span class="cap-type">' + p.type.name + "</span></span>" +
      "<span>" + (p.damages.length ? p.damages.map((d) => d[0]).join("; ") : "no damage") + "</span>" +
      '<span class="cap-dim">' + (p.wear.length ? "wear: " + p.wear.join(", ") + " · " : "") + p.type.material + "</span>" +
      '<span class="cap-dim">placed ' + (p.zoff >= 0 ? "+" : "−") + Math.abs(p.zoff).toFixed(0) + " mm, " + (p.yaw >= 0 ? "+" : "−") + Math.abs(p.yaw * 180 / Math.PI).toFixed(1) + "°" + (tr.length ? " · " + tr.join(", ") : "") + "</span>";
  }
  const zoom = $("zoom");
  function openZoom(p) {
    zoom._p = p;
    $("zoom-title").textContent = p.gt[0].type.name; $("zoom-cap").innerHTML = trackCaption(p);
    const holder = $("zoom-imgs"); holder.innerHTML = "";
    const sc = +$("zoom-scale").value;
    (p.caps || []).forEach((c) => {
      if (!c.cv) { const n = document.createElement("p"); n.className = "empty"; n.style.color = "#bbb"; n.textContent = "Full resolution is kept for the most recent pallets only."; holder.append(n); return; }
      const t = document.createElement("canvas"); t.width = PX; t.height = Math.max(1, c.rows); t.getContext("2d").drawImage(c.cv, 0, 0);
      t.style.width = Math.round(PX * sc) + "px"; t.style.height = Math.round(c.rows * sc) + "px"; holder.append(t);
    });
    AREA_CAMS.forEach((c, i) => { const s = p.snaps && p.snaps[i]; if (!isSnap(s)) return; const t = document.createElement("canvas"); t.width = s.width; t.height = s.height; t.getContext("2d").drawImage(s, 0, 0); t.title = c.name; t.style.width = Math.round(s.width * Math.max(1, sc)) + "px"; holder.append(t); });
    if (!zoom.open) zoom.showModal();
  }
  $("zoom-close").addEventListener("click", () => zoom.close());
  $("zoom-scale").addEventListener("change", () => { if (zoom._p) openZoom(zoom._p); });

