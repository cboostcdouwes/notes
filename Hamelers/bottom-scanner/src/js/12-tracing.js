  // ---------------- per-frame tracing ----------------
  function activePallets(s) {
    return feed.filter((p) => Math.abs(palletX(p, s)) < p.reach + 2600).sort((a, b) => Math.abs(palletX(a, s)) - Math.abs(palletX(b, s))).slice(0, MAXPAL);
  }
  // A track owns the line-scan rows while its estimated extent, plus a margin, covers the scan line.
  const MARGIN = 160;
  const ownsLine = (t, s) => { const e = trackAt(t, s); return !t.done && e.lead >= -MARGIN && e.trail <= MARGIN; };
  function ensureCaps(p) {
    if (p.caps) return;
    const rows = Math.ceil((p.lead - p.trail + 2 * MARGIN) * 1.15 / pitch) + 40;
    p.caps = cams.map(() => { const c = document.createElement("canvas"); c.width = PX; c.height = rows; const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, PX, rows); return { cv: c, ctx: x, rows: 0 }; });
  }
  function growCap(c, need) {
    const cv = document.createElement("canvas"); cv.width = c.cv.width; cv.height = Math.ceil(need * 1.4);
    const ctx = cv.getContext("2d"); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(c.cv, 0, 0);
    c.cv = cv; c.ctx = ctx;
  }
  // real travel per recorded line: more than the nominal pitch when the encoder under-counts
  const truePitch = () => pitch * (1 + service.encErr);
  // Scroll live waterfall L by n new rows (true proportions, newest at the bottom) and queue them from canvas row out.
  function scrollLive(L, out, cam, n) {
    const ctx = L.ctx, cv = ctx.canvas, h = n * pitch / L.mm; L.acc += h; const shift = Math.floor(L.acc); L.acc -= shift;
    if (shift > 0) ctx.drawImage(cv, 0, -shift);
    queueCopy(0, out, cam.PX, n, () => ctx, 0, cv.height - h, cv.width, h);
  }
  function traceBatch(n) {
    const o = opts(), tp = truePitch(), s0 = lastLine + tp;
    uploadScene(activePallets(s0 + n * tp / 2));
    const owners = [];
    for (let r = 0; r < n; r++) { const s = s0 + r * tp; owners.push(tracks.find((t) => ownsLine(t, s)) || null); }
    cams.forEach((cam, k) => {
      const out = k * MAXROWS;
      traceLines(cam, s0, tp, n, Object.assign({ fnum: o.fnum, dirt: o.dirt, rect: o.rect, noise: 1, seed: seedN, rowBase: lineCounter, outRow: out }, lineExposure(o)));
      scrollLive(live[k], out, cam, n);
      if (liveRaking[k]) {   // the side lights' lines fall between the bar's
        traceLines(cam, s0 + tp / 2, tp, n, Object.assign({ fnum: o.fnum, dirt: o.dirt, rect: o.rect, noise: 1, seed: seedN + 0.5, rowBase: lineCounter, outRow: OUT_RAKING + k * MAXROWS,
          lights: lightsFor(cams, "line", "side"), which: "side" }, lineExposure(o)));
        scrollLive(liveRaking[k], OUT_RAKING + k * MAXROWS, cam, n);
      }
      let r = 0;
      while (r < n) {   // captures: contiguous rows that belong to one pallet
        const p = owners[r]; let e = r; while (e < n && owners[e] === p) e++;
        if (p) {
          ensureCaps(p); const c = p.caps[k];
          if (c.cv && c.rows + (e - r) > c.cv.height) growCap(c, c.rows + (e - r));   // the track grew (merge, late trail)
          if (c.cv) { queueCopy(0, out + r, cam.PX, e - r, () => c.ctx, 0, c.rows, cam.PX, e - r); c.rows += e - r; }
        }
        r = e;
      }
    });
    lastLine += n * tp; lineCounter += n; seedN = (seedN * 1.37 + 0.71) % 997;
  }
  const snapsEl = $("snaps");
  // A snapshot is queued when the pallet crosses a camera's trigger point and rendered at that exact position,
  // at most two per frame so frame times stay even.
  const snapQueue = []; let snapJob = null;
  function stationSnapshots(sNow) {
    if (!$("opt-station").checked) return;
    tracks.forEach((t) => AREA_CAMS.forEach((c, ci) => {
      if (t.snaps[ci] !== undefined) return;
      // compare with the value seen last frame, so a jump in the estimate (a correction) still fires the camera
      const e = trackAt(t, sNow), b = c.trigger({ reach: (e.lead - e.trail) / 2 }, (e.lead + e.trail) / 2), a = t.lastTrig[ci];
      t.lastTrig[ci] = b;
      if (a === undefined) { if (b >= 0) t.snaps[ci] = null; return; }   // tracked only after its trigger point
      if (a < 0 && b >= 0) {
        t.snaps[ci] = "pending"; snapQueue.push([t, ci, sNow]);
        const g = t.gt[0], err = c.trigger(g, palletX(g, sNow));   // where the pallet really is when the camera fires
        t.trig[ci] = err; trigErrs.push(Math.abs(err)); if (trigErrs.length > 50) trigErrs.shift();
        $("trk-last").textContent = signedMm(err) + " (" + c.name + ")";
        $("trk-mean").textContent = (trigErrs.reduce((x, y) => x + y, 0) / trigErrs.length).toFixed(1) + " mm";
      }
    }));
    // one snapshot at a time, a strip of rows per frame sized to ~12 ms of tracing
    if (!snapJob && snapQueue.length) {
      const [p, ci, s] = snapQueue.shift(), c = AREA_CAMS[ci];
      const cv = document.createElement("canvas"); cv.width = c.w; cv.height = c.h;
      snapJob = { p: p, ci: ci, s: s, c: c, cv: cv, ctx: cv.getContext("2d"), row: 0 };
    }
    if (!snapJob) return;
    const j = snapJob, c = j.c, rows = Math.max(4, Math.min(c.h - j.row, Math.round(lineCap * PX / c.w * 0.3)));
    uploadScene(activePallets(j.s));
    traceArea(c, j.s, Object.assign({ fnum: opts().fnum, noise: 1, seed: seedN, rowStart: j.row, rows: rows, outRow: OUT_SNAP() }, areaExposure(opts())));
    const last = j.row + rows >= c.h, y0 = last ? 0 : j.row, n = last ? c.h : rows;   // the last strip post-processes the whole image (lens glare)
    queueCopy(0, OUT_SNAP() + y0, c.w, n, () => j.ctx, 0, y0, c.w, n);
    j.row += rows;
    if (j.row >= c.h) { j.p.snaps[j.ci] = j.cv; afterCopy.push(() => showSnap(j.ci, j.cv, j.p)); snapJob = null; }
  }
  const isSnap = (s) => s instanceof HTMLCanvasElement;
  function showSnap(ci, cv, p) {
    if (snapsEl.querySelector(".empty")) {
      snapsEl.innerHTML = "";
      AREA_CAMS.forEach((c) => { const f = document.createElement("figure"); const k = document.createElement("canvas"); k.width = c.w; k.height = c.h; const cap = document.createElement("figcaption"); cap.textContent = c.name; f.append(k, cap); snapsEl.append(f); });
    }
    const f = snapsEl.children[ci]; f.querySelector("canvas").getContext("2d").drawImage(cv, 0, 0);
    f.querySelector("figcaption").textContent = AREA_CAMS[ci].name + " · " + p.gt[0].type.name + " · track " + p.id;
  }

