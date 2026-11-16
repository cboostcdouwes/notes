  // ---------------- conditions: light optics, drivers, colours, air, daylight, lens and window flaws ----------------
  // Optics and air (assumed). The LED bar fills a line exposure of 100 µs as the lamps fill an area exposure of 1 ms
  // (see SENSOR), so with similar lenses and pixels the bar is BAR_VS_LAMPS times as bright as the lamps.
  const BAR_VS_LAMPS = 10;
  const GLARE = { veil: 0.03, ghost: 0.002 };   // share of the light the lens spreads over the frame; one ghost reflection
  const DUST_SIGMA = 5e-7;   // scattering per mm for 1 mg/m³ of coarse wood dust (~0.5 m²/g)
  const BAR_DUST_SPREAD = [1.3, 0.5, 0.9, 1.3];   // dust on the bar along its length, relative to the mean
  // Linear RGB of white LEDs by colour temperature, at luminance 1; 6500 K is the cameras' default white.
  const KELVIN = { 6500: [1, 1, 1], 5000: [1.231, 0.955, 0.76], 4000: [1.439, 0.917, 0.527], 3000: [1.82, 0.83, 0.27] };
  const LIGHT_COLOURS = { matched: [6500, 6500], mixed: [6500, 4000], warm: [5000, 3000] };   // [LED bar, station lamps]
  // Light drivers (assumed): mode 0 steady, 1 PWM on/off (p: duty), 2 ripple on the rectified mains (p: depth).
  const DRIVERS = { dc: { mode: 0, f: 0, p: 0 }, pwm: { mode: 1, f: 1000, p: 0.5 }, ripple: { mode: 2, f: 100, p: 0.3 } };
  // Light output averaged over an exposure of T s from t s, relative to the mean (as flicker() in the post shader).
  function flickerAvg(dr, t, T) {
    if (!dr.mode) return 1;
    const a = t * dr.f, b = (t + T) * dr.f;
    if (dr.mode === 1) { const G = (x) => Math.floor(x) * dr.p + Math.min(x - Math.floor(x), dr.p); return (G(b) - G(a)) / (dr.p * (b - a)); }
    return 1 + dr.p * (Math.sin(2 * Math.PI * b) - Math.sin(2 * Math.PI * a)) / (2 * Math.PI * (b - a));
  }
  // largest difference in brightness between exposures of T s taken at any moment
  function flickerSpread(dr, T) {
    if (!dr.mode) return 0;
    let lo = Infinity, hi = 0;
    for (let i = 0; i < 200; i++) { const v = flickerAvg(dr, i / 200 / dr.f, T); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    return hi - lo;
  }
  // Daylight in the hall (assumed), as a share d of the hall's lamp-lit brightness added: overcast a steady 1.5,
  // sun with passing clouds between 1 and 5 over tens of seconds. It brightens the hall seen through gaps and the fill.
  const DAYLIGHT = { overcast: 1.5, cloudLow: 1, cloudHigh: 5 };
  function daylight(t) {
    const kind = $("daylight").value, D = DAYLIGHT;
    if (kind === "overcast") return D.overcast;
    if (kind === "clouds") return D.cloudLow + (D.cloudHigh - D.cloudLow) * Math.min(1, Math.max(0, 0.5 + 0.8 * Math.sin(t / 9) * Math.sin(t / 23 + 1)));
    return 0;
  }

  // Share of the bar's light that the louvre passes to the scan line at the belt centre, for the budget: onto a bottom
  // face (facing the bar), so each point's light counts with the face's cosine too. The same per-point weighting as
  // barWeight in the tracer.
  function louvrePass(deg) {
    if (!deg) return 1;
    const c = cams[0], w = -c.lightPos[1] * Math.tan(deg * Math.PI / 180), h = BAR_SEGMENT_HALF;
    const triCum = (x) => { x = Math.max(-w, Math.min(w, x)); return x < 0 ? (x + w) * (x + w) / (2 * w) : w - (w - x) * (w - x) / (2 * w); };
    let bare = 0, cut = 0;
    c.lights.forEach((l) => {
      const dy = -l[1], d2 = dy * dy + l[2] * l[2], cosT = dy / Math.sqrt(d2);
      const onFace = cosT * cosT / d2;   // emitted at the bar's cosine, received at the face's
      bare += onFace; cut += onFace * (triCum(l[2] + h) - triCum(l[2] - h)) / (2 * h);
    });
    return cut / bare;
  }
  // Lens and sensor flaws that calibration removes, and the bottom cameras' window (assumed):
  const LENS_DISTORTION = 0.03;   // barrel distortion, ~1% at 35° off axis
  const ROLLING_S = 0.02;         // rolling-shutter readout, first row to last
  const WINDOW_MM = 25, PINHOLE_MM = 0.3;   // window in front of the bottom cameras' lens; aperture for the pinhole lens
  // Debris on a bottom camera's window (assumed): grit settles over the months since service, and a splinter
  // can lie on the first camera's window. Each: position along the sensor line and across it, radius (mm), opacity.
  function debrisFor(cam) {
    const data = new Float32Array(64);   // up to 16: a splinter is 5, specks at most 10
    let n = 0, seed = (Math.round(cam.spec.tilt * 31 + cam.spec.z) >>> 0) + 7;
    const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const add = (u, v, rad, op) => data.set([u, v, rad, op], 4 * n++);
    if (opts().splinter && service.protect > PROTECTION.airknife && cam.spec.z <= 0) for (let k = 0; k < 5; k++) add(-6 + k * 1.6, -0.8 + k * 0.4, 0.9, 0.95);
    for (let k = service.specks(); k > 0; k--) add((r() - 0.5) * 30, (r() - 0.5) * 4, 0.15 + 0.35 * r(), 0.6 + 0.4 * r());
    return { data: data, n: n };
  }
  // Share of the bottom images' columns that debris on the windows darkens, averaged over the cameras. Estimate of
  // windowT in the post shader: each item darkens a band as wide as the aperture disc plus the item, as far as it
  // covers the disc, if it lies on the disc's path across the window.
  function debrisShare(o) {
    let sum = 0;
    cams.forEach((cam) => {
      const db = debrisFor(cam), apR = o.fnum > 0 ? cam.focal / o.fnum / 2 : PINHOLE_MM / 2, span = 2 * WINDOW_MM * Math.tan((cam.phi1 - cam.phi0) / 2);
      let s = 0;
      for (let i = 0; i < db.n; i++) {
        const [, v, r, op] = db.data.subarray(4 * i, 4 * i + 4);
        if (Math.abs(v) < apR + r) s += op * Math.min(1, (r / apR) * (r / apR)) * 2 * (apR + r) / span;
      }
      sum += Math.min(1, s);
    });
    return sum / cams.length;
  }
