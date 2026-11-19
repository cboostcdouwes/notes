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

  // Light setups for the bottom cameras (assumed geometry):
  // - gap: the LED bar under the gap, one for all cameras or one per camera along its view.
  // - beside: each camera's own bar BESIDE_MM from its lens, on the side away from the belt, behind a window of its own
  //   at the window angle, turned toward the scan line. It is the same bar as the shared one under the gap (its power
  //   set for BAR_REF_MM), so from further away it gives less light.
  // - spot: compact LED lights where the bar beside would be, at their camera's place across the belt, behind a small
  //   window of their own like the bar's, with one bar's LED power per camera in their beams, from a face SPOT.faceR in
  //   radius. The beam (SPOT_BEAMS) is one stripe across the belt (a line lens), or a row of narrower units, each aimed
  //   at its own stretch of the line so that together they reach the belt's edges (SPOT.marginDeg beyond them),
  //   overlapping by SPOT.overlap of a unit's width.
  // - side: a compact LED light at each belt side, SIDE_LIGHT below the side frame on the gap line, its face aimed
  //   along the gap at the belt centre; each emits as much light as the whole bar.
  // - alternate: the bar under the gap and the side lights, on during alternate lines; the cameras run at twice the
  //   line rate, so each light gives an image at the usual pitch.
  const BAR_REF_MM = 250, BESIDE_MM = 80, SIDE_LIGHT = { y: -130, z: BELT_W / 2 + 70 };
  const SPOT = { marginDeg: 2, overlap: 0.2, faceR: 20 };
  // Spot beams: half-angles across travel and along the line (along null: as wide as the belt needs), and the shape
  // (rect: a rectangular stripe; ellipse: an elliptical cone).
  const SPOT_BEAMS = {
    line: { across: 2, along: null, shape: "rect", name: "line lens, ±2° across" },
    oval: { across: 5, along: 25, shape: "ellipse", name: "10° × 50° oval spots" },
    round: { across: 5, along: 5, shape: "ellipse", name: "10° round spots" } };
  const BAR_I = 0.75 * 2.42 * BAR_REF_MM * BAR_REF_MM;   // the whole bar's intensity, as bar() spreads it over its points
  const sideLights = () => [-1, 1].map((s) => [0, SIDE_LIGHT.y, s * SIDE_LIGHT.z, BAR_I]);
  const linesPerImage = (o) => (o.lightSetup === "alternate" ? 2 : 1);   // camera lines per image line
  const besideCamera = (setup) => setup === "beside" || setup === "spot";   // the bottom light sits beside its camera
  // Where camera spec (lens at C) has its bottom light in the travel/height plane, or null for side lights only.
  function barPosition(spec, C, o) {
    const t = spec.tilt * Math.PI / 180, sx = Math.sin(t), cyy = Math.cos(t);
    if (o.lightSetup === "side") return null;
    if (besideCamera(o.lightSetup)) { const s = Math.sign(spec.tilt) || 1; return [C[0] + s * BESIDE_MM * cyy, C[1] - s * BESIDE_MM * sx]; }
    return o.sharedLight ? [o.anyZero ? -80 : 0, -250] : [-350 * sx + (spec.tilt === 0 ? -80 : 0), -350 * cyy];
  }
  // The spots at P, kind SPOT_BEAMS[kind]: the axis between the belt's edges on the scan line and the direction along
  // it; n units, aimed step radians apart along the line around the axis; each unit's half-angle tangents across and
  // along, its shape, and its intensity inside its beam (its share of one bar's light, pi times the bar's intensity for
  // a flat diffuse face, over the unit's solid angle).
  function spotBeam(P, kind) {
    const b = SPOT_BEAMS[kind], rad = Math.PI / 180;
    const ends = [-1, 1].map((s) => norm3(sub3([0, 0, s * BELT_W / 2], P)));
    const axis = norm3(ends[0].map((v, i) => v + ends[1][i])), toEnd = sub3(ends[1], ends[0]);
    const along = norm3(toEnd.map((v, i) => v - dot3(toEnd, axis) * axis[i]));
    const need = Math.acos(dot3(ends[0], ends[1])) / 2 + SPOT.marginDeg * rad;   // half the fan the units must fill
    const a = b.across * rad, h = b.along ? b.along * rad : need;
    const n = b.along ? Math.ceil(2 * need / (2 * h * (1 - SPOT.overlap))) : 1;
    const solid = b.shape === "rect" ? 4 * Math.asin(Math.sin(a) * Math.sin(h)) : Math.PI * Math.sin(a) * Math.sin(h);
    return { pos: P, axis: axis, along: along, n: n, step: n > 1 ? (2 * need - 2 * h) / (n - 1) : 0, tan: [Math.tan(a), Math.tan(h)],
      ellipse: b.shape === "ellipse", I: Math.PI * BAR_I / n / solid };
  }
  // Unit i of spot sp: its axis and its direction along the line.
  function spotUnit(sp, i) {
    const th = (i - (sp.n - 1) / 2) * sp.step, c = Math.cos(th), s = Math.sin(th);
    return { axis: sp.axis.map((v, k) => c * v + s * sp.along[k]), along: sp.along.map((v, k) => c * v - s * sp.axis[k]) };
  }
  // How many of spot sp's units send light along direction u (unit, away from the spot): 0 outside the beam.
  function beamShare(sp, u) {
    let count = 0;
    for (let i = 0; i < sp.n; i++) {
      const un = spotUnit(sp, i), f = dot3(u, un.axis);
      if (f <= 0) continue;
      const x = Math.abs(dot3(u, cross3(un.axis, un.along))) / (sp.tan[0] * f), y = Math.abs(dot3(u, un.along)) / (sp.tan[1] * f);
      if (sp.ellipse ? x * x + y * y <= 1 : x <= 1 && y <= 1) count++;
    }
    return count;
  }
  // The bottom lights of image which (as lightsFor picks them, see there) for cameras camList, at full power, for
  // lineLightAt.
  function bottomLights(which, camList) {
    const o = opts(), w = which || (o.lightSetup === "side" ? "side" : "bar"), cs = camList || cams;
    const bars = w === "bar" ? uniqueBars(cs) : [], side = w === "side" ? sideLights() : [];
    const spots = w === "bar" ? cs.map((c) => c.spot).filter(Boolean) : [];
    return { lights: bars.concat(side, spots.map((sp) => sp.pos.concat(sp.I))), nBars: bars.length, nSide: side.length, spots: spots,
      lightWin: besideCamera(o.lightSetup) ? service.winAngle * Math.PI / 180 : -1 };
  }
  const uniqueBars = (camList) => {
    const out = [];
    camList.forEach((c) => c.lights.forEach((l) => { if (!out.some((b) => b[0] === l[0] && b[1] === l[1] && b[2] === l[2])) out.push(l); }));
    return out;
  };
  // The reference exposure's light: the shared bar under the gap.
  const REF_LIGHTS = { lights: bar(0, -BAR_REF_MM, -450, 450, 4, BAR_REF_MM), nBars: 4, nSide: 0, spots: [], lightWin: -1 };
  // Irradiance on a bottom face (facing down) at (x, y, z) on the scan plane, from bottom lights L, without shadows; as
  // lightShare in the tracer.
  function lightAt(L, p) {
    let e = 0;
    L.lights.forEach((l, i) => {
      const v = sub3(p, l), d = Math.hypot(...v), u = v.map((x) => x / d);   // from the light to the point
      const kind = i < L.nBars ? "bar" : i < L.nBars + L.nSide ? "side" : "spot";
      e += l[3] * lightShareAt(l, u, kind, L.lightWin, L.spots[i - L.nBars - L.nSide]) * Math.max(0, u[1]) / (d * d);   // the face looks down
    });
    return e;
  }
  const lineLightAt = (L, z) => lightAt(L, [0, 0, z]);   // on the scan line at the belt plane
  // Light on the scan line at the belt centre for image which (cameras camList, default all), relative to the
  // reference: 1 for the bar under the gap (the reference holds it, one bar or one per camera alike).
  function setupLight(o, which, camList) {
    const L = bottomLights(which, camList);
    return L.nBars && o.lightSetup !== "beside" ? 1 : lineLightAt(L, 0) / lineLightAt(REF_LIGHTS, 0);
  }
  // Share of light l's intensity sent along u (unit, away from it): a bar's upward face (by its cosine), a side light's
  // face aimed at the belt centre, or a spot's beam (sp). A light beside its camera also passes its own window, at
  // angle lightWin, turned toward the scan line.
  function lightShareAt(l, u, kind, lightWin, sp) {
    if (kind === "side") { const d = Math.hypot(l[0], l[1], l[2]); return Math.max(0, -(u[0] * l[0] + u[1] * l[1] + u[2] * l[2]) / d); }
    const share = kind === "spot" ? beamShare(sp, u) : Math.max(0, u[1]);
    if (!share || lightWin < 0) return share;
    const s = l[0] > 0 ? -1 : 1;
    return share * glassPass(u[0] * s * Math.sin(lightWin) + u[1] * Math.cos(lightWin), GLASS.n).T;
  }
  // How high above the belt camera cam's spot still lights the bottom face where the camera looks (on its scan plane at
  // the belt centre): 0 when it misses the scan line even at the belt plane.
  const SPOT_REACH_MAX = 300;   // mm, above the tallest pallet's bottom faces
  function spotReach(cam) {
    let h = 0;
    while (h < SPOT_REACH_MAX && beamShare(cam.spot, norm3(sub3([h * cam.C[0] / cam.C[1], h, 0], cam.spot.pos))) > 0) h += 2;
    return h;
  }
  // Share of the bar's light that the louvre passes to the scan line at the belt centre, for the budget: onto a bottom
  // face (facing the bar), so each point's light counts with the face's cosine too. The same per-point weighting as
  // barWeight in the tracer.
  function louvrePass(deg) {
    if (!deg || !cams[0].lights.length) return 1;
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
  // The bottom cameras' window: plain glass (BK7-like; index n for green light, nRB for red and blue, which only the
  // colour-fringe estimate uses), thickMm thick. It crosses the lens axis WINDOW_MM in front of the lens and stands at
  // the window angle from horizontal, its outer face turned the way the camera looks (assumed).
  const GLASS = { thickMm: 4, n: 1.5185, nRB: [1.5157, 1.524] };
  // The purge air in front of the window (assumed): coolK colder than the hall after expanding, in a layer layerMm wide
  // that the rays cross over pathMm. Air's index changes by AIR_DN_DT per kelvin.
  const PURGE_AIR = { coolK: 5, layerMm: 5, pathMm: 20 }, AIR_DN_DT = 9.3e-7;
  // Camera cam's window: outward normal n, the point o where the lens axis crosses it, and the direction a in its plane
  // along the scan line (debris positions are along a and across it, from o).
  function windowFor(cam) {
    const ang = service.winAngle * Math.PI / 180, side = Math.sign(cam.spec.tilt) || 1;
    const bottomN = [side * Math.sin(ang), Math.cos(ang), 0], n = cam.top ? cam.mapDir(bottomN) : bottomN;   // a top camera's: its bottom camera's, carried over
    const o = cam.C.map((c, i) => c + WINDOW_MM * cam.axis[i]);
    const en = cam.e[0] * n[0] + cam.e[1] * n[1] + cam.e[2] * n[2];
    return { n: n, o: o, a: norm3(cam.e.map((v, i) => v - en * n[i])) };
  }
  // A ray meeting the glass at cosI to its normal, glass index nG: the share of the light it lets through (both faces
  // reflect, by Fresnel for each polarisation, and the light bouncing between them comes out too), and how far it
  // shifts the ray sideways, mm. As throughWindow in the tracer.
  function glassPass(cosI, nG) {
    if (cosI <= 0) return { T: 0, shift: 0 };
    const sinI = Math.sqrt(1 - cosI * cosI), sinT = sinI / nG, cosT = Math.sqrt(1 - sinT * sinT);
    const rs = ((cosI - nG * cosT) / (cosI + nG * cosT)) ** 2, rp = ((nG * cosI - cosT) / (nG * cosI + cosT)) ** 2;
    return { T: 0.5 * ((1 - rs) / (1 + rs) + (1 - rp) / (1 + rp)), shift: GLASS.thickMm * (sinI * cosT - cosI * sinT) / cosT };
  }
  const camRay = (cam, phi) => [0, 1, 2].map((i) => Math.cos(phi) * cam.d0[i] + Math.sin(phi) * cam.e[i]);
  // The window along camera cam's line, at WINDOW_SAMPLES pixel rays: per ray its cosine to the window's normal and
  // where it crosses the window (u along the line, v across it, mm from o).
  const WINDOW_SAMPLES = 64;
  function windowRays(cam, win) {
    const b = cross3(win.n, win.a), out = [];
    for (let i = 0; i < WINDOW_SAMPLES; i++) {
      const d = camRay(cam, cam.phi0 + (cam.phi1 - cam.phi0) * i / (WINDOW_SAMPLES - 1)), c = dot3(d, win.n);
      if (c <= 0) { out.push({ c: c }); continue; }
      const t = dot3(sub3(win.o, cam.C), win.n) / c, x = sub3(cam.C.map((v, k) => v + t * d[k]), win.o);
      out.push({ c: c, u: dot3(x, win.a), v: dot3(x, b) });
    }
    return out;
  }
  // Debris on a bottom camera's window (assumed): grit settles over the months since service, and a splinter
  // can lie on the first camera's window. Each: position along the sensor line and across it, radius (mm), opacity.
  // A top camera's window faces down: nothing settles on it.
  function debrisFor(cam) {
    const data = new Float32Array(64);   // up to 16: a splinter is 5, specks at most 10
    if (cam.top) return { data: data, n: 0 };
    let n = 0, seed = (Math.round(cam.spec.tilt * 31 + cam.spec.z) >>> 0) + 7;
    const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const add = (u, v, rad, op) => data.set([u, v, rad, op], 4 * n++);
    if (opts().splinter && !service.gritSlides() && cam.spec.z <= 0) for (let k = 0; k < 5; k++) add(-6 + k * 1.6, -0.8 + k * 0.4, 0.9, 0.95);
    for (let k = service.specks(); k > 0; k--) add((r() - 0.5) * 30, (r() - 0.5) * 4, 0.15 + 0.35 * r(), 0.6 + 0.4 * r());
    return { data: data, n: n };
  }
  // What camera cam's window does along its line, for the Timing & data tab: the share of the line that ends on the
  // housing (the window too steep for this camera), the light let through at the steepest and the most head-on ray,
  // how much the sideways shift varies along the line (a distortion that calibration removes), the glass needed (along
  // and across the line, with the aperture's disc around every ray), and two effects too small to trace, in pixels on
  // the belt: the colour fringe from the glass's dispersion and the purge air bending the rays.
  function windowOptics(cam, fnum) {
    const rays = windowRays(cam, windowFor(cam)), through = rays.filter((r) => r.c > 0), apR = apertureR(cam, fnum);
    if (!through.length) return { housed: 1 };
    const cs = through.map((r) => r.c), cLo = Math.min(...cs), cHi = Math.max(...cs), shifts = cs.map((c) => glassPass(c, GLASS.n).shift);
    const fringe = Math.abs(glassPass(cLo, GLASS.nRB[1]).shift - glassPass(cLo, GLASS.nRB[0]).shift);
    const bend = PURGE_AIR.coolK * AIR_DN_DT / PURGE_AIR.layerMm * PURGE_AIR.pathMm;   // radians
    const span = (k) => Math.max(...through.map((r) => r[k])) - Math.min(...through.map((r) => r[k]));
    return { housed: 1 - through.length / rays.length, tLo: glassPass(cLo, GLASS.n).T, tHi: glassPass(cHi, GLASS.n).T,
      shiftSpan: Math.max(...shifts) - Math.min(...shifts), sizeU: span("u") + 2 * apR / cLo, sizeV: span("v") + 2 * apR / cLo,
      fringePx: fringe / cam.mmPerPx, bendPx: bend * cam.focus / cam.mmPerPx };
  }
  // Light the windows let through toward the belt centre, averaged over the cameras (for the light budget).
  const windowPass = () => cams.reduce((sum, c) => sum + glassPass(dot3(c.axis, windowFor(c).n), GLASS.n).T, 0) / cams.length;
  // Share of the light that gets past the debris on camera cam's window along pixel ray d (as windowT in the post
  // shader): the ray's light crosses the window as a disc the size of the aperture (radius apR) around the ray; each
  // item, seen along the ray, is foreshortened to a disc of equal area, and blocks as much of the disc as it covers.
  function windowT(cam, win, db, apR, d) {
    const c = dot3(d, win.n);
    if (c <= 0) return 1;
    const t = dot3(sub3(win.o, cam.C), win.n) / c, x = cam.C.map((v, k) => v + t * d[k]), b = cross3(win.n, win.a);
    let blocked = 0;
    for (let i = 0; i < db.n; i++) {
      const [u, v, r, op] = db.data.subarray(4 * i, 4 * i + 4), q = win.o.map((w, k) => w + u * win.a[k] + v * b[k]);
      const off = sub3(q, x), along = dot3(off, d), across = Math.hypot(...off.map((w, k) => w - along * d[k]));
      blocked += op * circOverlap(across, apR, r * Math.sqrt(c));
    }
    return Math.max(0, 1 - blocked / (Math.PI * apR * apR));
  }
  function circOverlap(d, r1, r2) {   // area where two circles (centres d apart) overlap, as in the post shader
    if (d >= r1 + r2) return 0;
    if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
    return r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)) + r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
      - 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  }
  const apertureR = (cam, fnum) => (fnum > 0 ? cam.focal / fnum / 2 : PINHOLE_MM / 2);
  // Share of the bottom images' light that debris on the windows blocks, averaged over the pixels and the cameras.
  function debrisShare(o) {
    let sum = 0;
    cams.forEach((cam) => {
      const db = debrisFor(cam), win = windowFor(cam), apR = apertureR(cam, o.fnum);
      for (let i = 0; i < WINDOW_SAMPLES; i++) sum += 1 - windowT(cam, win, db, apR, camRay(cam, cam.phi0 + (cam.phi1 - cam.phi0) * i / (WINDOW_SAMPLES - 1)));
    });
    return sum / (WINDOW_SAMPLES * cams.length);
  }
