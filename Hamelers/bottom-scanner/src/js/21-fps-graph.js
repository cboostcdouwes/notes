  // ---------------- frame-rate graph ----------------
  const FPS_WIN = 60000, FPS_BUCKET = 250;   // ms shown; ms per plotted point
  const frameLog = [], eventLog = [];          // [time, frame ms]; [time, kind]
  const fpsCv = $("fpsgraph"), fpsTip = $("fpstip");
  let fpsBuckets = [], fpsHover = null;
  const markEvent = (kind) => eventLog.push([performance.now(), kind]);
  function fpsBucketsAt(now) {
    while (frameLog.length && now - frameLog[0][0] > FPS_WIN) frameLog.shift();
    while (eventLog.length && now - eventLog[0][0] > FPS_WIN) eventLog.shift();
    const n = FPS_WIN / FPS_BUCKET, out = Array.from({ length: n }, () => ({ sum: 0, n: 0, worst: 0, events: [] }));
    const idx = (t) => n - 1 - Math.floor((now - t) / FPS_BUCKET);
    frameLog.forEach(([t, ms]) => { const b = out[idx(t)]; if (!b) return; b.sum += ms; b.n++; b.worst = Math.max(b.worst, ms); });
    eventLog.forEach(([t, k]) => { const b = out[idx(t)]; if (b && !b.events.includes(k)) b.events.push(k); });
    return out.map((b) => ({ avg: b.n ? 1000 * b.n / b.sum : null, low: b.n ? 1000 / b.worst : null, events: b.events }));
  }
  function drawFps() {
    const dpr = window.devicePixelRatio || 1, W = fpsCv.clientWidth, H = fpsCv.clientHeight;
    if (!W) return;
    if (fpsCv.width !== Math.round(W * dpr)) { fpsCv.width = Math.round(W * dpr); fpsCv.height = Math.round(H * dpr); }
    const ctx = fpsCv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const now = performance.now(); fpsBuckets = fpsBucketsAt(now);
    const L = 26, R = 4, T = 6, B = 14, top = 60, n = fpsBuckets.length;
    const x = (i) => L + (W - L - R) * (i + 0.5) / n, y = (f) => T + (H - T - B) * (1 - Math.min(f, top) / top);
    ctx.font = "10px " + css("--font-data"); ctx.textBaseline = "middle"; ctx.fillStyle = css("--muted"); ctx.textAlign = "right";
    [0, 20, 30, 60].forEach((f) => {   // recessive grid; 20 and 30 fps are the thresholds that matter here
      ctx.strokeStyle = css("--rule"); ctx.lineWidth = 1; ctx.setLineDash(f === 20 || f === 30 ? [3, 3] : []);
      ctx.beginPath(); ctx.moveTo(L, Math.round(y(f)) + 0.5); ctx.lineTo(W - R, Math.round(y(f)) + 0.5); ctx.stroke();
      ctx.fillText(String(f), L - 4, y(f));
    });
    ctx.setLineDash([]); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillText("−60 s", L, H - 2); ctx.textAlign = "right"; ctx.fillText("now", W - R, H - 2);
    const line = css("--cam");
    ctx.fillStyle = line; ctx.globalAlpha = 0.18;   // band from the slowest frame up to the average
    fpsBuckets.forEach((b, i) => { if (b.avg === null) return; const w = (W - L - R) / n; ctx.fillRect(x(i) - w / 2, y(b.avg), w, y(b.low) - y(b.avg)); });
    ctx.globalAlpha = 1; ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
    let pen = false;
    fpsBuckets.forEach((b, i) => { if (b.avg === null) { pen = false; return; } if (pen) ctx.lineTo(x(i), y(b.avg)); else ctx.moveTo(x(i), y(b.avg)); pen = true; });
    ctx.stroke();
    ctx.fillStyle = css("--muted"); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = "9px sans-serif";
    fpsBuckets.forEach((b, i) => { if (b.events.length) ctx.fillText(b.events.map((k) => (k === "pallet" ? "▲" : "◆")).join(""), x(i), H - B + 1); });
    if (fpsHover !== null && fpsBuckets[fpsHover]) {   // crosshair
      ctx.strokeStyle = css("--muted"); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.round(x(fpsHover)) + 0.5, T); ctx.lineTo(Math.round(x(fpsHover)) + 0.5, H - B); ctx.stroke();
    }
    const vals = fpsBuckets.filter((b) => b.avg !== null), lows = frameLog.map(([, ms]) => ms).sort((a, b) => b - a);
    const p99 = lows.length ? 1000 / lows[Math.floor(lows.length * 0.01)] : 0, under20 = frameLog.filter(([, ms]) => ms > 50).length;
    $("fps-sum").textContent = vals.length ? "average " + Math.round(vals.reduce((a, b) => a + b.avg, 0) / vals.length) + " fps · 1% low " + Math.round(p99) + " fps · " + under20 + " frames slower than 20 fps" : "–";
    return { x: x, n: n };
  }
  fpsCv.addEventListener("pointermove", (e) => {
    const r = fpsCv.getBoundingClientRect(), L = 26, R = 4, n = FPS_WIN / FPS_BUCKET;
    const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left - L) / (r.width - L - R) * n)));
    fpsHover = i; const b = fpsBuckets[i];
    if (!b || b.avg === null) { fpsTip.hidden = true; return; }
    const ago = ((n - 1 - i) * FPS_BUCKET / 1000).toFixed(1);
    fpsTip.innerHTML = "<b>" + ago + " s ago</b><br>average " + Math.round(b.avg) + " fps, slowest frame " + Math.round(b.low) + " fps" +
      (b.events.length ? "<br>" + b.events.map((k) => (k === "pallet" ? "a pallet finished (gallery card)" : "analysis or photo run")).join(", ") : "");
    fpsTip.hidden = false;
    fpsTip.style.left = Math.max(0, Math.min(e.clientX - r.left + 12, r.width - 220)) + "px"; fpsTip.style.top = "-6px";
  });
  fpsCv.addEventListener("pointerleave", () => { fpsHover = null; fpsTip.hidden = true; });

