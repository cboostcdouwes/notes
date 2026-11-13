  // ---------------- static world: conveyor frames, station posts, beams, lamps, floor ----------------
  // Station lamps (assumed LED panels): six 1.25 m up along both sides, four low ones facing in from the ends.
  // Each point light sits just outside its fixture's emitting face.
  const STATION_LAMPS = [].concat(
    [-300, 0, 300].map((x) => [x, 1250, -850]), [-300, 0, 300].map((x) => [x, 1250, 850]),   // inside the ±25° scan planes (x ≈ ±580 mm at this height)
    [[-1100, 700, -300], [-1100, 700, 300], [1100, 700, -300], [1100, 700, 300]]);
  // A lamp's emitting face carries its radiance as its colour: the light's intensity over the face's area (Lambertian).
  const faceRadiance = (intensity, area) => { const L = intensity / area; return [L, L, L]; };
  function lampParts() {
    const out = [], I = STATION_LIGHTS[0][3];
    [-1, 1].forEach((s) => out.push(part("lamp beam", [-1230, 1300, s * 930 - 50], [1230, 1360, s * 930 + 50], "steel", 0, { col: [0.3, 0.31, 0.33] })));
    [-1, 1].forEach((s) => out.push(part("lamp beam", [s * 1200 - 30, 760, -980], [s * 1200 + 30, 820, 980], "steel", 2, { col: [0.3, 0.31, 0.33] })));
    STATION_LAMPS.forEach(([x, y, z]) => out.push(y > 1000
      ? part("station lamp", [x - 150, y + 3, z - 60], [x + 150, 1300, z + 60], "lamp", 0, { col: faceRadiance(I, 300 * 120) })
      : part("station lamp", x < 0 ? [x - 65, y - 50, z - 90] : [x + 3, y - 50, z - 90], x < 0 ? [x - 3, 760, z + 90] : [x + 65, 760, z + 90], "lamp", 0, { col: faceRadiance(I, 110 * 180) })));
    return out;
  }
  function worldParts(g) {
    const out = [], e = g / 2 + ROLL_R;
    [[-4000, -e], [e, 4000]].forEach(([a, b]) => [-1, 1].forEach((s) => out.push(part("conveyor side frame", [a, -90, s * (BELT_W / 2 + 25) - 25], [b, 0, s * (BELT_W / 2 + 25) + 25], "steel", 0, { col: [0.16, 0.17, 0.18] }))));
    [-1200, 1200].forEach((x) => [-950, 950].forEach((z) => out.push(part("station post", [x - 30, -600, z - 30], [x + 30, 2200, z + 30], "steel", 1, { col: [0.3, 0.31, 0.33] }))));
    out.push(...lampParts());
    out.push(part("floor", [-5000, -640, -3000], [5000, -600, 3000], "floor", 0, { col: [0.13, 0.13, 0.14] }));
    out.forEach((p) => { p.stain = [0, 0, 0]; p.knots = [1e9, 1e9, 1e9, 1e9]; });
    return { parts: out, bb: [-5000, -640, -3000, 5000, 2200, 3000] };
  }
  // The bottom rig under the gap: each camera body (as an upright box) and each LED bar, emitting from its top.
  function rigParts(camList) {
    const out = [], seen = new Set();
    camList.forEach((c) => {
      out.push(part("line-scan camera", [c.C[0] - 45, c.C[1] - 45, c.C[2] - 45], [c.C[0] + 45, c.C[1] + 45, c.C[2] + 45], "steel", 1, { col: [0.06, 0.07, 0.08] }));
      out.push(part("camera stand", [c.C[0] - 15, -600, c.C[2] - 15], [c.C[0] + 15, c.C[1] - 45, c.C[2] + 15], "steel", 1, { col: [0.3, 0.31, 0.33] }));
      const k = c.lightPos.join(",");
      if (seen.has(k)) return;
      seen.add(k);
      const barI = c.lights.reduce((s, l) => s + l[3], 0);   // axis 2 tells the tracer this lamp is the bar
      out.push(part("LED bar", [c.lightPos[0] - 25, c.lightPos[1] - 30, -500], [c.lightPos[0] + 25, c.lightPos[1] - 3, 500], "lamp", 2, { col: faceRadiance(barI, 50 * 1000) }));
      [-450, 450].forEach((z) => out.push(part("LED bar stand", [c.lightPos[0] - 12, -600, z - 12], [c.lightPos[0] + 12, c.lightPos[1] - 30, z + 12], "steel", 1, { col: [0.3, 0.31, 0.33] })));
    });
    out.forEach((p) => { p.stain = [0, 0, 0]; p.knots = [1e9, 1e9, 1e9, 1e9]; });
    return out;
  }
  const worlds = new Map();
  const rigKey = (camList) => camList.map((c) => c.C.map(Math.round).join(",") + "/" + c.lightPos.join(",")).join(";");
  function worldFor(g, camList) {
    const key = g + "|" + rigKey(camList);
    if (!worlds.has(key)) { const w = worldParts(g); worlds.set(key, { parts: w.parts.concat(rigParts(camList)), bb: w.bb }); }
    return worlds.get(key);
  }

