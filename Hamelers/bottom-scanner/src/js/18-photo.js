  // ---------------- photo render ----------------
  // Rendered as a running average over many passes, with the feed paused: the current 3D view as it is now (the pallets
  // nearest the view's target; the tracer holds MAXPAL), or the pallet nearest the gap, centred over it, as the bottom
  // line-scan or the station cameras see it.
  const HALL_SKY = [0.32, 0.33, 0.35];
  let photoJob = null, photoPasses = 2;
  function runPhoto() {
    markEvent("analysis");
    const view = $("ph-view").value, out = $("ph-out");
    const add = (w, h, label, aspect) => {
      const f = document.createElement("figure"), cv = document.createElement("canvas"), cap = document.createElement("figcaption");
      f.style.margin = "0"; cv.width = w; cv.height = h; cv.style.width = "100%"; if (aspect) cv.style.aspectRatio = aspect;
      cap.className = "cap-dim"; cap.style.fontSize = "0.76rem"; cap.textContent = label + " ";
      const save = document.createElement("button"); save.type = "button"; save.className = "btn"; save.textContent = "Save PNG";
      save.addEventListener("click", () => saveCanvas(cv, label, $("ph-status"))); cap.append(save);
      f.append(cv, cap); out.append(f);
      return cv.getContext("2d");
    };
    const tiles = [];
    if (view === "view") {
      const c = viewCamera(), tx = controls.target.x * 1000;
      const pals = feed.slice().sort((a, b) => Math.abs(palletX(a, sBelt) - tx) - Math.abs(palletX(b, sBelt) - tx)).slice(0, MAXPAL);
      out.innerHTML = "";
      tiles.push({ cam: c, ctx: add(c.w, c.h, "Current 3D view · " + pals.length + (pals.length === 1 ? " pallet" : " pallets")), s: sBelt });
      photoJob = { pals: pals, what: "the current 3D view", tiles: tiles, ti: 0, pass: 0, N: +$("ph-n").value, t0: performance.now() };
      return;
    }
    let near = null;
    feed.forEach((q) => { if (!near || Math.abs(palletX(q, sBelt)) < Math.abs(palletX(near, sBelt))) near = q; });
    if (!near) { $("ph-status").textContent = "No pallet in the feed: tick at least one pallet type."; return; }
    const q = pose(near, sBelt), p = Object.assign({}, near, { uid: -(++uidN), off: 0 });
    p.motion = staticMotion(q.z, q.yaw, q.dy, q.pitch);   // frozen as it is now, centred over the gap
    out.innerHTML = "";
    const areaTile = (c, label) => tiles.push({ cam: c, ctx: add(c.w, c.h, label), s: -c.trigger(p, 0) });   // triggers are cx + constant
    if (view === "station") AREA_CAMS.forEach((c) => areaTile(c, c.name));
    if (view === "bottom") cams.forEach((cam) => {
      const rows = Math.ceil((2 * p.reach + 400) / pitch);
      const ctx = add(cam.PX, rows, camLabel(cam), (cam.PX * cam.mmPerPx).toFixed(0) + " / " + (rows * pitch).toFixed(0));
      for (let r = 0; r < rows; r += MAXROWS) tiles.push({ cam: cam, ctx: ctx, r: r, n: Math.min(MAXROWS, rows - r), s0: -p.reach - 200 + r * pitch });
    });
    const what = p.type.name + ": " + (p.damages.length ? p.damages.map((d) => d[0]).join(", ") : "intact");
    photoJob = { pals: [p], what: what, tiles: tiles, ti: 0, pass: 0, N: +$("ph-n").value, t0: performance.now() };
  }
  function stepPhoto() {
    const j = photoJob, o = opts();
    uploadScene(j.pals);
    for (let k = 0; k < photoPasses && j.ti < j.tiles.length; k++) {
      const t = j.tiles[j.ti], show = j.pass === j.N - 1 || k === photoPasses - 1;
      const po = { still: true, pass: j.pass, noPost: !show, seed: 1 + j.pass * 1.618, fnum: o.fnum };
      if (t.cam.kind === "line") {
        traceLines(t.cam, t.s0, pitch, t.n, Object.assign(po, lineExposure(o), { rect: o.rect, dirt: o.dirt, noise: 1, rowBase: t.r, sky: HALL_SKY, lightJit: [40, 15, 120] }));
        if (show) t.ctx.drawImage(glc, 0, 0, t.cam.PX, t.n, 0, t.r, t.cam.PX, t.n);
      } else {
        const ov = !!t.cam.photo;
        traceArea(t.cam, t.s, Object.assign(po, ov ? {} : areaExposure(o), { noise: ov ? 0.25 : 1, tone: ov, exposure: ov ? 1.5 : 1.2, sky: HALL_SKY, lightJit: [40, 15, 120], fnum: ov ? 1 : o.fnum }));
        if (show) t.ctx.drawImage(glc, 0, 0, t.cam.w, t.cam.h, 0, 0, t.cam.w, t.cam.h);
      }
      if (++j.pass >= j.N) { j.pass = 0; j.ti++; }
    }
    if (frameMs < 45) photoPasses = Math.min(64, photoPasses + 1); else if (frameMs > 75) photoPasses = Math.max(1, Math.floor(photoPasses * 0.7));
    const sec = ((performance.now() - j.t0) / 1000).toFixed(1);
    if (j.ti < j.tiles.length) { $("ph-status").textContent = "Rendering " + (j.ti + 1) + " of " + j.tiles.length + ", pass " + (j.pass + 1) + " of " + j.N + " · " + sec + " s"; return; }
    $("ph-status").textContent = "Done in " + sec + " s · " + j.N + " passes · " + j.what + " · gap " + gap + " mm.";
    photoJob = null; sceneKey = "";
  }
  $("ph-run").addEventListener("click", runPhoto);
  const photoButtonText = () => { $("ph-run").textContent = $("ph-view").value === "view" ? "Render the current 3D view" : "Render the pallet over the gap"; };
  $("ph-view").addEventListener("change", photoButtonText);
  photoButtonText();

