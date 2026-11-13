  // ---------------- top camera, simulated detector, tracker ----------------
  // The detector is simulated: boxes come from the true geometry projected into the top image, with edge jitter,
  // misses, and touching pallets merged into one box. Everything downstream (positions, triggers) uses only the boxes.
  const TOP_FPS = 10, DETECT_S = 0.08;   // top camera frame rate; detector inference latency, s
  const FRAME_MM = () => scanSpeed() / TOP_FPS, LAT_MM = () => scanSpeed() * DETECT_S;   // the same, in belt travel
  const H_ASSUMED = 140;    // pallet height the box-to-belt conversion assumes; real types are 120-156 mm
  const TRACK_START = -400; // new tracks start only for pallets entering upstream
  let tracks = [], trackN = 0, lastDets = [], nextTopS = 0, mergedN = 0, topJob = null;
  const pending = [], trigErrs = [];
  let ds = 7; const drnd = () => { ds = (ds * 1664525 + 1013904223) >>> 0; return ds / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(1 - drnd())) * Math.cos(6.2831853 * drnd());
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const toImage = (cam, P) => { const v = sub3(P, cam.C), z = dot3(v, cam.F); return [cam.w / 2 + dot3(v, cam.R) / z * cam.fx, cam.h / 2 - dot3(v, cam.U) / z * cam.fx]; };
  function beltXAt(cam, u, y) {   // travel position where the ray through image column u meets height y
    const d = [0, 1, 2].map((i) => cam.F[i] + (u - cam.w / 2) / cam.fx * cam.R[i]);
    return cam.C[0] + (y - cam.C[1]) / d[1] * d[0];
  }
  function palletBox(cam, p, q) {
    const b = p.bb, c = Math.cos(q.yaw), s = Math.sin(q.yaw), cp = Math.cos(q.pitch), sp = Math.sin(q.pitch), box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const x of [b[0], b[3]]) for (const y of [b[1], b[4]]) for (const z of [b[2], b[5]]) {
      const X = c * x + s * z, Z = -s * x + c * z;   // yaw, then pitch about the across-belt axis (as the shader)
      const [u, v] = toImage(cam, [cp * X - sp * y + q.x, sp * X + cp * y + q.dy, Z + q.z]);
      box[0] = Math.min(box[0], u); box[1] = Math.min(box[1], v); box[2] = Math.max(box[2], u); box[3] = Math.max(box[3], v);
    }
    return box;
  }
  function detect(sF) {
    const cam = TOP_LIVE, seen = [];
    feed.forEach((p) => {
      const b = palletBox(cam, p, pose(p, sF)), cb = [Math.max(0, b[0]), Math.max(0, b[1]), Math.min(cam.w, b[2]), Math.min(cam.h, b[3])];
      if (cb[2] <= cb[0] || cb[3] <= cb[1]) return;
      seen.push({ box: cb, frac: (cb[2] - cb[0]) * (cb[3] - cb[1]) / ((b[2] - b[0]) * (b[3] - b[1])), gt: [p], merged: false });
    });
    for (let i = 0; i + 1 < seen.length; i++) {   // feed order: downstream first
      const a = seen[i], b = seen[i + 1];
      if (!b.gt[0].touching || !b.gt[0].mergeProne) continue;
      if (palletX(a.gt[a.gt.length - 1], sF) - a.gt[a.gt.length - 1].reach - palletX(b.gt[0], sF) - b.gt[0].reach > 20) continue;   // separated by now
      a.box = [Math.min(a.box[0], b.box[0]), Math.min(a.box[1], b.box[1]), Math.max(a.box[2], b.box[2]), Math.max(a.box[3], b.box[3])];
      a.gt = a.gt.concat(b.gt); a.merged = true; a.frac = Math.min(a.frac, b.frac); seen.splice(i + 1, 1);
    }
    return seen.filter((d) => d.frac > 0.15 && drnd() > 0.02).map((d) => {
      const w = d.box[2] - d.box[0], h = d.box[3] - d.box[1];
      const box = [d.box[0] + gauss() * 0.008 * w, d.box[1] + gauss() * 0.008 * h, d.box[2] + gauss() * 0.008 * w, d.box[3] + gauss() * 0.008 * h];
      return { box: box, gt: d.gt, merged: d.merged, clipL: d.box[0] <= 1, clipR: d.box[2] >= cam.w - 1,
        conf: Math.min(0.99, (0.9 + 0.08 * d.frac - 0.04 * drnd()) * (d.merged ? 0.85 : 1)) };
    });
  }
  // Track state: lead and trail edge at encoder position t.s, and belt-to-pallet rate v (below 1 when the pallet slips).
  const trackAt = (t, s) => { const d = t.v * (s - t.s); return { lead: t.lead + d, trail: t.trail + d }; };
  function updateTracks(dets, sF) {
    const used = new Set(), cam = TOP_LIVE;
    dets.forEach((d) => {
      const lead = d.clipR ? null : beltXAt(cam, d.box[2], H_ASSUMED), trail = d.clipL ? null : beltXAt(cam, d.box[0], H_ASSUMED);
      if (lead === null && trail === null) return;
      let best = null;
      tracks.forEach((t) => {
        if (used.has(t)) return;
        const pr = trackAt(t, sF), e = lead !== null ? Math.abs(pr.lead - lead) : Math.abs(pr.trail - trail);
        if (e < 300 && (!best || e < best.e)) best = { t: t, e: e, pr: pr };
      });
      if (!best) {
        if (lead === null || lead > TRACK_START) return;
        const t = { id: ++trackN, s: sF, v: 1, lead: lead, trail: trail !== null ? trail : lead - 1250, trailKnown: trail !== null,
          gt: d.gt, conf: d.conf, merged: d.merged, caps: null, snaps: {}, trig: {}, lastTrig: {}, done: false };
        tracks.push(t); used.add(t); d.track = t;
        return;
      }
      const t = best.t, pr = best.pr, dsF = Math.max(1, sF - t.s);
      const rl = lead !== null ? lead - pr.lead : null, rt = trail !== null ? trail - pr.trail : null;
      t.lead = pr.lead + (rl !== null ? 0.5 * rl : 0);
      // a jump in the trail edge is a length change (trail first seen, or a merge), not motion
      if (rt !== null && (!t.trailKnown || Math.abs(rt) > 150)) { t.trail = trail; t.trailKnown = true; }
      else t.trail = pr.trail + (rt !== null ? 0.5 * rt : 0);
      const rv = rl !== null ? rl : (rt !== null && Math.abs(rt) <= 150 ? rt : null);
      if (rv !== null) t.v = Math.min(1.05, Math.max(0.9, t.v + 0.08 * rv / dsF));
      if (d.merged && !t.merged) mergedN++;
      t.s = sF; t.gt = d.gt.length > t.gt.length ? d.gt : t.gt; t.conf = d.conf; t.merged = t.merged || d.merged;
      used.add(t); d.track = t;
    });
  }
  const topCv = $("topcam"), topCtx = topCv.getContext("2d"), topImg = document.createElement("canvas");
  topImg.width = TOP_LIVE.w; topImg.height = TOP_LIVE.h; const topImgCtx = topImg.getContext("2d");
  // Every frame is detected; the display image is traced in strips over several animation frames (the scene is
  // frozen at the frame's encoder position), skipping frames while one is still being traced.
  function topCamera(sNow) {
    if (sNow >= nextTopS) {
      pending.push({ ready: sNow + LAT_MM(), s: sNow, dets: detect(sNow) });
      nextTopS = sNow + FRAME_MM();
      if (!topJob) topJob = { s: sNow, row: 0 };
    }
    if (topJob) {
      const cam = TOP_LIVE, rows = Math.max(8, Math.min(cam.h - topJob.row, Math.round(lineCap * PX / cam.w * 0.5)));
      uploadScene(activePallets(topJob.s));
      traceArea(cam, topJob.s, Object.assign({ fnum: 0, noise: 1, seed: seedN, rowStart: topJob.row, rows: rows, outRow: OUT_TOP }, areaExposure(opts())));
      const last = topJob.row + rows >= cam.h, y0 = last ? 0 : topJob.row, n = last ? cam.h : rows;   // the last strip post-processes the whole image (lens glare)
      queueCopy(0, OUT_TOP + y0, cam.w, n, () => topImgCtx, 0, y0, cam.w, n);
      topJob.row += rows;
      if (topJob.row >= cam.h) { topJob = null; afterCopy.push(() => drawTop(sNow)); }
    }
    while (pending.length && pending[0].ready <= sNow) { const f = pending.shift(); updateTracks(f.dets, f.s); lastDets = f.dets; drawTop(sNow); }
  }
  function drawTop(sNow) {
    const cam = TOP_LIVE, k = topCv.width / cam.w, ctx = topCtx;
    ctx.drawImage(topImg, 0, 0, topCv.width, topCv.height);
    ctx.lineWidth = 2; ctx.font = "12px ui-monospace, monospace"; ctx.textBaseline = "bottom";
    const scanU = toImage(cam, [0, 0, 0])[0] * k;
    ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(255,210,60,0.8)"; ctx.beginPath(); ctx.moveTo(scanU, 0); ctx.lineTo(scanU, topCv.height); ctx.stroke();
    ctx.fillStyle = "rgba(255,210,60,0.9)"; ctx.fillText("scan line", scanU + 4, topCv.height - 4);
    tracks.forEach((t) => {   // prediction for now
      if (t.done && trackAt(t, sNow).trail > 1600) return;
      const e = trackAt(t, sNow), u0 = toImage(cam, [e.trail, H_ASSUMED, 0])[0] * k, u1 = toImage(cam, [e.lead, H_ASSUMED, 0])[0] * k;
      ctx.strokeStyle = "rgba(90,200,255,0.9)"; ctx.strokeRect(u0, 6, u1 - u0, topCv.height - 12);
    });
    ctx.setLineDash([]);
    lastDets.forEach((d) => {
      const [x0, y0, x1, y1] = d.box.map((v) => v * k);
      ctx.strokeStyle = d.merged ? "#ff9f1a" : "#3ddc84"; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      const label = (d.merged ? "pallet? " : "pallet ") + d.conf.toFixed(2) + (d.track ? " · #" + d.track.id : "");
      const tw = ctx.measureText(label).width + 8, ly = Math.max(16, y0);
      ctx.fillStyle = d.merged ? "#ff9f1a" : "#3ddc84"; ctx.fillRect(x0, ly - 16, tw, 16);
      ctx.fillStyle = "#08130c"; ctx.fillText(label, x0 + 4, ly - 2);
    });
    $("trk-n").textContent = String(tracks.filter((t) => !t.done).length); $("trk-merged").textContent = String(mergedN);
  }

