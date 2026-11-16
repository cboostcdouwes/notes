  // ---------------- main loop ----------------
  let fpsDrawn = 0;
  const nowEl = $("now"); let lastT = performance.now(), fpsN = 0, fpsT = lastT, lastNow = "", lineWin = [], fps = 0;
  function frame() {
    requestAnimationFrame(frame);
    const t = performance.now(), dt = Math.min(0.1, (t - lastT) / 1000); frameMs = 0.8 * frameMs + 0.2 * (t - lastT);
    frameLog.push([t, t - lastT]); lastT = t;
    if (t - fpsDrawn > 250) { fpsDrawn = t; drawFps(); }
    fpsN++; if (t - fpsT > 1000) { fps = Math.round(fpsN * 1000 / (t - fpsT)); $("st-fps").textContent = fps + " fps"; fpsN = 0; fpsT = t; }
    let lines = 0;
    const photoOnly = photoJob && !photoJob.live;   // a one-off render pauses the feed; the live render runs beside it
    if (photoOnly) stepPhoto();
    else if (!paused && !visMode) {
      const target = sBelt + dt * scanSpeed() * speed;
      let n = Math.floor((target - lastLine) / truePitch());
      // lines per frame steered by frame time; when capped, the belt slows instead of the frame rate
      const cap = Math.max(1, Math.min(MAXROWS, Math.round(lineCap)));
      const limited = n > cap; if (limited) n = cap;
      // hold about 30 fps: trace more lines only while frames are fast, fewer as soon as they slow; the belt gives way
      if (limited && frameMs < 28) lineCap = Math.min(MAXROWS, lineCap * 1.1 + 1);
      if (frameMs > 36) lineCap = Math.max(1, lineCap * 0.85);
      if (frameMs > 90 && lineCap <= 1.5 && pixelRatio > 0.4) { pixelRatio *= 0.75; renderer.setPixelRatio(pixelRatio); resize(); frameMs = 60; }   // no GPU: render the 3D view coarser
      if (n > 0) { traceBatch(n); lines = n; }
      topCamera(lastLine);
      sBelt = limited ? lastLine : target;   // the tracer sets the pace when it can't keep up
      stationSnapshots(lastLine);
      finishPallets(lastLine);
      spawn();
    }
    if (!photoOnly) liveRender();
    lineWin.push([t, lines]); while (lineWin.length && t - lineWin[0][0] > 1000) lineWin.shift();
    const lps = lineWin.reduce((a, b) => a + b[1], 0), mps = lps * pitch / 1000;
    $("st-rate").textContent = paused ? "–" : (lps * linesPerImage(opts())).toLocaleString() + " lines/s";   // the camera's lines: twice the image's when the lights alternate
    $("st-speed").textContent = paused ? "paused" : mps.toFixed(mps < 0.1 ? 3 : 2) + " m/s" + (speed > 0.3 && mps < scanSpeed() / 1000 * speed * 0.9 ? (softGL ? " (no GPU: slowed)" : " (GPU-limited)") : "");
    let current = null;
    feed.forEach((p) => {
      const q = pose(p, sBelt), x = q.x;
      p.mesh.position.set(x / 1000, q.dy / 1000, q.z / 1000); p.mesh.rotation.set(0, q.yaw, q.pitch);
      if (!visMode) p.mesh.visible = Math.abs(x) < 4600;
      if (Math.abs(x) < p.reach + 60) current = p;
    });
    if ($("opt-follow").checked && current && !visMode) {
      const dx = (palletX(current, sBelt) / 1000 - controls.target.x) * 0.1, dz = (pose(current, sBelt).z / 1000 - controls.target.z) * 0.1;
      controls.target.x += dx; controls.target.z += dz; cam3.position.x += dx; cam3.position.z += dz;
    }
    if (scanLine) scanLine.visible = speed < 0.2 || $("opt-fans").checked;
    const text = visMode ? "<b>Visibility map:</b> parts coloured by how well the selected cameras see them" :
      current ? "<b>Over the gap:</b> " + current.type.name + " · " + (current.damages.length ? '<span style="color:var(--bad)">' + current.damages.map((d) => d[0]).join(", ") + "</span>" : "intact") + (speed < 0.2 ? " · line " + lineCounter.toLocaleString() : "")
      : "<b>Over the gap:</b> nothing";
    if (text !== lastNow) { nowEl.innerHTML = text; lastNow = text; }
    flushCopies();
    stepCards();
    doHover();
    stepTour(t);
    controls.update(); renderer.render(scene3, cam3);
  }

  function resize() { const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h, false); cam3.aspect = w / h; cam3.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(view);
  function applyTheme() { renderer.setClearColor(new THREE.Color(css("--scene"))); buildBench(); buildRig(); buildStationRig(); }
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.__scanner = { tracker: () => ({ tracks: tracks.length, errs: trigErrs.slice(), merged: mergedN }), stats: () => ({ fps: fps, rate: $("st-rate").textContent, speed: $("st-speed").textContent, count: scanned, floatOK: floatOK }), runVisibility: runVisibility, runCompare: runCompare, runPhoto: runPhoto, photoBusy: () => !!photoJob, setGap: (g) => { $("gap").value = g; $("gap").dispatchEvent(new Event("change")); } };
  resize(); restart(); applyTheme();
  if (/#s=pbs1\./.test(location.hash)) { try { applySettings(location.hash); setMsg("Settings from the link applied."); } catch (e) { setMsg("The link's settings were not applied: " + e.message + "."); } }
  frame();
