  // ---------------- camera models ----------------
  function bottomCam(spec, px, o) {
    const t = spec.tilt * Math.PI / 180, sx = Math.sin(t), cyy = Math.cos(t);
    const C = [-WD * sx, -WD * cyy, spec.z];
    const dl = Math.hypot(C[0], C[1], C[2]), d0 = [-C[0] / dl, -C[1] / dl, -C[2] / dl];
    const nl = Math.hypot(C[1], C[0]), nv = [C[1] / nl, -C[0] / nl, 0];
    const e = [d0[1] * nv[2] - d0[2] * nv[1], d0[2] * nv[0] - d0[0] * nv[2], d0[0] * nv[1] - d0[1] * nv[0]];
    const angleTo = (z) => { const v = [-C[0], -C[1], z - C[2]]; return Math.atan2(v[0] * e[0] + v[1] * e[1] + v[2] * e[2], v[0] * d0[0] + v[1] * d0[1] + v[2] * d0[2]); };
    const dirAt = (phi) => [0, 1, 2].map((i) => Math.cos(phi) * d0[i] + Math.sin(phi) * e[i]);
    const beltZ = (phi) => { const d = dirAt(phi); return C[2] + (-C[1] / d[1]) * d[2]; };
    let p0 = -HALF_FOV, p1 = HALF_FOV;
    if (o.fit) { const a1 = angleTo(-BELT_W / 2), a2 = angleTo(BELT_W / 2), m = (a2 - a1) * 0.01; p0 = a1 - m; p1 = a2 + m; }
    const dphi = (p1 - p0) / (px - 1), axisPhi = (p0 + p1) / 2, axis = dirAt(axisPhi);
    const z0 = beltZ(p0), z1 = beltZ(p1);
    const focus = dl * Math.cos(angleTo(0) - axisPhi);          // focus plane through the belt centre
    const focal = (px * PIXEL_UM / 1000 / 2) / Math.tan((p1 - p0) / 2);   // mm, for this sensor width
    const lightPos = o.sharedLight ? [o.anyZero ? -80 : 0, -250] : [-350 * sx + (spec.tilt === 0 ? -80 : 0), -350 * cyy];
    const lights = bar(lightPos[0], lightPos[1], -450, 450, 4, Math.hypot(lightPos[0], lightPos[1]));
    return { kind: "line", spec: spec, C: C, d0: d0, e: e, phi0: p0, phi1: p1, dphi: dphi, axisPhi: axisPhi, axis: axis, z0: z0, z1: z1,
      mmPerPx: (z1 - z0) / (px - 1), nearMm: Math.abs(beltZ(p0 + dphi) - z0), farMm: Math.abs(z1 - beltZ(p1 - dphi)),
      focus: focus, focal: focal, lights: lights, lightPos: lightPos, PX: px };
  }
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
  // Station area cameras (pinhole + thin lens), triggered by pallet position.
  const STATION_LIGHTS = STATION_LAMPS.map((l) => [l[0], l[1], l[2], 0.75 * 2.42 / 10 * 1300 * 1300]);
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
  function daylight(t) {
    const kind = $("daylight").value;
    if (kind === "overcast") return 1.5;
    if (kind === "clouds") return 1 + 4 * Math.min(1, Math.max(0, 0.5 + 0.8 * Math.sin(t / 9) * Math.sin(t / 23 + 1)));
    return 0;
  }
  // Every view is lit by everything that is on: the bottom cameras' LED bars (one, or one per camera) and the
  // station lamps above, which also reach the bottom view through gaps in the pallet. Units: the area cameras' 1 ms
  // reference exposure. A line camera's exposure k already holds its shorter time and the bar's power, so its view
  // divides every light by the bar's gain. Also returns what the tracer needs for the bars' optics and the air.
  function lightsFor(camList, kind) {
    const bars = [], age = service.lightFactor(), o = opts(), barGain = BAR_VS_LAMPS * o.light / 100, toView = kind === "line" ? 1 / barGain : 1;
    camList.forEach((c) => c.lights.forEach((l) => { if (!bars.some((b) => b[0] === l[0] && b[1] === l[1] && b[2] === l[2])) bars.push(l); }));
    const barScale = service.barOut ? 0 : age * barGain * toView, dust = service.barDust();
    const [kBar, kLamp] = LIGHT_COLOURS[$("lightcol").value], barCol = KELVIN[kBar], lampCol = KELVIN[kLamp];
    return { lights: bars.map((l, i) => [l[0], l[1], l[2], l[3] * barScale * (1 - dust * BAR_DUST_SPREAD[i % BAR_DUST_SPREAD.length])])
      .concat(STATION_LIGHTS.map((l, i) => [l[0], l[1], l[2], service.lampOut && i === 0 ? 0 : l[3] * age * toView])),
      nBars: bars.length, barFace: barScale * (1 - dust), lampFace: age * toView, hall: toView,
      barCol: barCol, lampCol: lampCol, wb: (kind === "line" ? barCol : lampCol).map((v) => 1 / v),   // each camera is white-balanced to its own light
      driver: DRIVERS[$("driver").value], day: daylight(lastLine / scanSpeed()),
      louvreTan: o.louvre ? Math.tan(o.louvre * Math.PI / 180) : 0, dust: o.dust * DUST_SIGMA };
  }
  // Share of the bar's light that the louvre passes to the scan line at the belt centre, for the budget. The same
  // per-point weighting as barWeight in the tracer.
  function louvrePass(deg) {
    if (!deg) return 1;
    const c = cams[0], w = -c.lightPos[1] * Math.tan(deg * Math.PI / 180), h = BAR_SEGMENT_HALF;
    const triCum = (x) => { x = Math.max(-w, Math.min(w, x)); return x < 0 ? (x + w) * (x + w) / (2 * w) : w - (w - x) * (w - x) / (2 * w); };
    let bare = 0, cut = 0;
    c.lights.forEach((l) => {
      const dy = -l[1], d2 = dy * dy + l[2] * l[2], cosT = dy / Math.sqrt(d2);
      bare += cosT / d2; cut += cosT * (triCum(l[2] + h) - triCum(l[2] - h)) / (2 * h) / d2;
    });
    return cut / bare;
  }
  function areaCam(name, C, target, fovDeg, w, h, trigger, tip, aperture, upHint) {
    const F = norm3(sub3(target, C)); const upH = upHint || (Math.abs(F[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0]);
    const R = norm3(cross3(F, upH)), U = cross3(R, F);
    return { kind: "area", name: name, C: C, F: F, R: R, U: U, fx: (w / 2) / Math.tan(fovDeg * Math.PI / 360), w: w, h: h, trigger: trigger, tip: tip,
      focus: Math.hypot(...sub3(target, C)), aperture: aperture || 1.5 };
  }
  // trigger(p, cx) is a signed distance to the trigger point; the snapshot fires when it crosses zero
  const AREA_CAMS = [
    areaCam("Top", [0, 1700, 0], [0, 0, 0], 76, 640, 340, (p, cx) => cx, "Top camera, 1.7 m above the belt, seeing 2.6 m of travel: runs live for the pallet detector that triggers every other camera, and takes the deck snapshot.", 1.5, [0, 0, -1]),
    areaCam("Left side", [0, 260, -1250], [0, 70, 0], 58, 480, 240, (p, cx) => cx, "Left side camera: block faces, burnt EPAL marks, labels, missing outer blocks."),
    areaCam("Right side", [0, 260, 1250], [0, 70, 0], 58, 480, 240, (p, cx) => cx, "Right side camera: the other long side."),
    areaCam("Front end", [1650, 300, 0], [0, 70, 0], 44, 400, 240, (p, cx) => cx + p.reach - 380, "Downstream end camera: the leading face, cross boards and fork openings."),
    areaCam("Rear end", [-1650, 300, 0], [0, 70, 0], 44, 400, 240, (p, cx) => cx - p.reach + 380, "Upstream end camera: the trailing face as the pallet leaves."),
    areaCam("Fork opening, oblique", [-780, 75, -900], [-60, 60, 0], 26, 320, 240, (p, cx) => cx, "Angled camera into the left fork opening, aimed at the hidden centre block.")
  ];
  // The live feed of the top camera, at a lower resolution than its snapshots.
  const TOP_LIVE = areaCam("Top", [0, 1700, 0], [0, 0, 0], 76, softGL ? 320 : 480, softGL ? 170 : 255, null, "", 1.5, [0, 0, -1]);
  // The photo render of the 3D view: a photographer's camera, not a machine camera (filmic tone curve, little noise,
  // a lens aperture of PHOTO_APERTURE mm focused on the orbit target), at most PHOTO_W × PHOTO_H pixels.
  const PHOTO_W = 1280, PHOTO_H = 800, PHOTO_APERTURE = 6;
  function viewCamera() {
    const aspect = cam3.aspect, w = Math.round(Math.min(PHOTO_W, PHOTO_H * aspect)), h = Math.round(w / aspect);
    const hfov = 2 * Math.atan(Math.tan(cam3.fov * Math.PI / 360) * aspect) * 180 / Math.PI;
    const toMm = (v) => v.toArray().map((x) => x * 1000), up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam3.quaternion).toArray();
    const c = areaCam("Current 3D view", toMm(cam3.position), toMm(controls.target), hfov, w, h, null, "", PHOTO_APERTURE, up);
    c.photo = true;
    return c;
  }

