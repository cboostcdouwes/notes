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
  // The conveyor's side frames: depth mm below the belt plane, width mm wide, just outside the belt.
  const SIDE_FRAME = { depth: 90, width: 50 };
  const sideFrameZ = (s) => [s * BELT_W / 2, s * (BELT_W / 2 + SIDE_FRAME.width)].sort((a, b) => a - b);   // s: -1 left, 1 right
  function worldParts(g) {
    const out = [], e = g / 2 + ROLL_R;
    [[-4000, -e], [e, 4000]].forEach(([a, b]) => [-1, 1].forEach((s) => {
      const [z0, z1] = sideFrameZ(s);
      out.push(part("conveyor side frame", [a, -SIDE_FRAME.depth, z0], [b, 0, z1], "steel", 0, { col: [0.16, 0.17, 0.18] }));
    }));
    [-1200, 1200].forEach((x) => [-950, 950].forEach((z) => out.push(part("station post", [x - 30, -600, z - 30], [x + 30, 2200, z + 30], "steel", 1, { col: [0.3, 0.31, 0.33] }))));
    out.push(...lampParts());
    out.push(part("floor", [-5000, -640, -3000], [5000, -600, 3000], "floor", 0, { col: [0.13, 0.13, 0.14] }));
    out.forEach((p) => { p.stain = [0, 0, 0]; p.knots = [1e9, 1e9, 1e9, 1e9]; });
    return { parts: out, bb: [-5000, -640, -3000, 5000, 2200, 3000] };
  }
  // The line-scan rig: each camera body (as an upright box) and each LED bar, emitting from its face toward the belt.
  // The bottom rig stands on the floor; the top line-scan rig hangs from the frame above the station (TOP_FRAME_Y).
  const TOP_FRAME_Y = 2170;
  function rigParts(camList) {
    const out = [], seen = new Set(), steel = { col: [0.3, 0.31, 0.33] };
    camList.forEach((c) => {
      out.push(part("line-scan camera", [c.C[0] - 45, c.C[1] - 45, c.C[2] - 45], [c.C[0] + 45, c.C[1] + 45, c.C[2] + 45], "steel", 1, { col: [0.06, 0.07, 0.08] }));
      out.push(c.top ? part("camera hanger", [c.C[0] - 15, c.C[1] + 45, c.C[2] - 15], [c.C[0] + 15, TOP_FRAME_Y, c.C[2] + 15], "steel", 1, steel)
        : part("camera stand", [c.C[0] - 15, -600, c.C[2] - 15], [c.C[0] + 15, c.C[1] - 45, c.C[2] + 15], "steel", 1, steel));
      if (c.spot) {   // the housing only: its light leaves in the beam (spotShare, spotGlint), not from a glowing face
        const [x, y, z] = c.spot.pos, r = SPOT.faceR + 10;
        out.push(c.top ? part("LED spot", [x - r, y + 3, z - r], [x + r, y + 60, z + r], "steel", 1, { col: [0.06, 0.07, 0.08] })
          : part("LED spot", [x - r, y - 60, z - r], [x + r, y - 3, z + r], "steel", 1, { col: [0.06, 0.07, 0.08] }));
        out.push(c.top ? part("LED spot hanger", [x - 10, y + 60, z - 10], [x + 10, TOP_FRAME_Y, z + 10], "steel", 1, steel)
          : part("LED spot stand", [x - 10, -600, z - 10], [x + 10, y - 60, z + 10], "steel", 1, steel));
      }
      const k = String(c.lightPos);
      if (!c.lights.length || seen.has(k)) return;
      seen.add(k);
      const barI = c.lights.reduce((s, l) => s + l[3], 0);   // axis 2 tells the tracer this lamp is the bar
      const [bx, by] = c.lightPos;
      if (c.top) {   // facing down
        out.push(part("LED bar", [bx - 25, by + 3, -500], [bx + 25, by + 30, 500], "lamp", 2, { col: faceRadiance(barI, 50 * 1000) }));
        [-450, 450].forEach((z) => out.push(part("LED bar hanger", [bx - 12, by + 30, z - 12], [bx + 12, TOP_FRAME_Y, z + 12], "steel", 1, steel)));
        return;
      }
      out.push(part("LED bar", [bx - 25, by - 30, -500], [bx + 25, by - 3, 500], "lamp", 2, { col: faceRadiance(barI, 50 * 1000) }));
      [-450, 450].forEach((z) => out.push(part("LED bar stand", [bx - 12, -600, z - 12], [bx + 12, by - 30, z + 12], "steel", 1, steel)));
    });
    if ($("opt-plates").checked) out.push(...platesFor(camList));
    if (opts().lightSetup === "side" || opts().lightSetup === "alternate") sideLights().forEach(([x, y, z, I]) => {   // facing in along the gap
      const s = Math.sign(z), face = 100 * 40;
      out.push(part("side light", [x - 50, y - 20, s > 0 ? z + 3 : z - 33], [x + 50, y + 20, s > 0 ? z + 33 : z - 3], "lamp", 0, { col: faceRadiance(I, face) }));
    });
    out.forEach((p) => { p.stain = [0, 0, 0]; p.knots = [1e9, 1e9, 1e9, 1e9]; });
    return out;
  }
  // Matt black plates (option) across each line camera's view PLATE.beyondMm past the plane it looks at, so what it
  // sees between and past the pallet's boards is black: above the belt for a bottom camera, below for a top one. In the
  // travel/height plane a line camera's view is a line from its lens through the scan line, so each plate is a strip
  // across the belt. A plate that would cut into another line camera's view is left out (a 0° camera and a top one
  // right above it look at each other). Past the belt's edges a top camera's view also crosses the side frames below
  // the belt, which a bottom camera's never does: there the frame is black too. Assumed: flocked or black anodised,
  // PLATE.albedo of the light diffusely.
  const PLATE = { beyondMm: 400, widthMm: 40, albedo: 0.03 };
  function platesFor(camList) {
    const inView = (c, x0, x1, y) => (y - c.C[1]) * (y - c.planeY) < 0 && planeX(c, y) > x0 && planeX(c, y) < x1;   // between lens and plane
    const out = [], w = PLATE.widthMm / 2;
    camList.forEach((c) => {
      const y = c.planeY + (c.top ? -1 : 1) * PLATE.beyondMm, x = planeX(c, y);
      if (camList.some((o) => o !== c && inView(o, x - w, x + w, y))) return;
      const k = (y - c.C[1]) / (c.planeY - c.C[1]), zs = [c.z0, c.z1].map((z) => c.C[2] + (z - c.C[2]) * k);   // the view's width there
      const black = { col: [PLATE.albedo, PLATE.albedo, PLATE.albedo] };
      out.push(part("black plate", [x - w, y, Math.min(...zs) - 50], [x + w, y + 3, Math.max(...zs) + 50], "black", 0, black));
      if (!c.top) return;
      const xs = [planeX(c, 0), planeX(c, -SIDE_FRAME.depth)];
      [-1, 1].forEach((s) => {
        const [z0, z1] = sideFrameZ(s);
        out.push(part("black frame cover", [Math.min(...xs) - w, -SIDE_FRAME.depth - 2, z0 - 2], [Math.max(...xs) + w, 1, z1 + 2], "black", 0, black));
      });
    });
    return out;
  }
  const worlds = new Map();
  // Station camera bodies and their mounts (assumed): side, end and fork cameras on posts from the floor, the top
  // camera hanging from a frame across the station posts' tops. A camera's own rays start inside its body, so it never
  // sees itself; it does see the others (the side cameras face each other across the belt).
  function stationCamParts() {
    const out = [], station = $("opt-station").checked, steel = { col: [0.3, 0.31, 0.33] };
    AREA_CAMS.forEach((c, ci) => {
      if (ci > 0 && !station) return;
      const [x, y, z] = c.C;
      out.push(part("station camera", [x - 45, y - 45, z - 45], [x + 45, y + 45, z + 45], "steel", 1, { col: [0.06, 0.07, 0.08] }));
      if (ci > 0) out.push(part("camera post", [x - 15, -600, z - 15], [x + 15, y - 45, z + 15], "steel", 1, steel));
    });
    const [tx, ty, tz] = AREA_CAMS[0].C;
    out.push(part("top camera rod", [tx - 12, ty + 45, tz - 12], [tx + 12, 2170, tz + 12], "steel", 1, steel));
    out.push(part("top frame", [-1230, 2170, tz - 20], [1230, 2200, tz + 20], "steel", 0, steel));
    [-1200, 1200].forEach((px) => out.push(part("top frame", [px - 30, 2170, -980], [px + 30, 2200, 980], "steel", 2, steel)));
    out.forEach((p) => { p.stain = [0, 0, 0]; p.knots = [1e9, 1e9, 1e9, 1e9]; });
    return out;
  }
  const rigKey = (camList) => camList.map((c) => c.C.map(Math.round).join(",") + "/" + String(c.lightPos)).join(";") + "|" + opts().lightSetup + "|" + $("opt-plates").checked +
    "|" + $("opt-station").checked + ":" + AREA_CAMS.map((c) => c.C.join(",")).join(";");
  function worldFor(g, camList) {
    const key = g + "|" + rigKey(camList);
    if (!worlds.has(key)) { const w = worldParts(g); worlds.set(key, { parts: w.parts.concat(rigParts(camList), stationCamParts()), bb: w.bb }); }
    return worlds.get(key);
  }

