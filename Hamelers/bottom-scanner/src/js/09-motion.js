  // ---------------- pallet motion on the conveyor ----------------
  // Each pallet's pose is precomputed against belt progress u (encoder position minus the pallet's belt offset) and
  // shared with the shader as a texture. Ingredients, all assumed: belt slip and speed ripple; short hesitations
  // (roller friction); slow sideways and yaw wander; and catches at the scan gap: a leading bottom edge droops while
  // it crosses the unsupported span and snags on the far roller. The pallet stalls, the snag turns it, and the nose
  // dips while the front edge is over the gap. The droop, and with it how often and how long pallets stick, grows
  // with the gap.
  function staticMotion(z, yaw, dy, pitch) {
    const f = (v) => new Float32Array(MOTION_N).fill(v);
    return { dx: f(0), z: f(z), yaw: f(yaw), dy: f(dy), pitch: f(pitch), catches: [], hesitations: 0 };
  }
  function motionSample(a, u) {
    const f = Math.min(MOTION_N - 1.001, Math.max(0, (u - MOTION_U0) / MOTION_DU)), i = Math.floor(f);
    return a[i] + (a[i + 1] - a[i]) * (f - i);
  }
  // pose at encoder position s; same interpolation as the shader's poseAt
  function pose(p, s) {
    const m = p.motion, u = s - p.off;
    return { x: u + motionSample(m.dx, u), z: motionSample(m.z, u), yaw: motionSample(m.yaw, u), dy: motionSample(m.dy, u), pitch: motionSample(m.pitch, u) };
  }
  const palletX = (p, s) => pose(p, s).x;
  // how much a pallet's bottom edges sag over an unsupported span, mm, for a random draw r in 0..1
  const warpOf = (typeId, r) => (/plastic|nest/.test(typeId) ? 0.3 + 1.7 * r : typeId === "moulded" ? 1 + 3 * r : 0.5 + 3 * r);
  const gapDroop = (g) => Math.min(2.5, Math.max(0, (g - 20) / 130));   // droop scale: ~0.15 at 40 mm, 0.6 at 100, 2.5 at 350
  const CATCH_MM = 1.2;   // droop the far roller's curve still lifts over without snagging
  const BOUNCE_HZ = 10;   // a pallet nose bouncing on the roller after landing (assumed)
  // Leading edges of what the pallet stands on, front first: [local x, extra droop mm]. A broken board's free end
  // and a sagging span droop more.
  // A part's extent along travel and height as the belt sees it: [x0, y0, x1, y1] after the pallet's orientation.
  function beltBox(q, p) {
    const O = p.orient;
    if (O.pitch) return [-q.hi[0], p.H - q.hi[1], -q.lo[0], p.H - q.lo[1]];   // upside down: x and y mirrored
    if (O.yaw) return [q.lo[2], q.lo[1], q.hi[2], q.hi[1]];                     // rotated 90°: local z runs along travel
    return [q.lo[0], q.lo[1], q.hi[0], q.hi[1]];
  }
  function contactEdges(p) {
    const edges = [], front = (p.orient.yaw ? p.W : p.L) / 2;
    p.parts.forEach((q) => {
      const [, y0, x1, y1] = beltBox(q, p);
      if (y0 > 0.5 || (y1 < 3 && q.mat !== "steel") || q.mat === "wrap") return;   // what it stands on, plus nails dragging below
      const freeEnd = /\(piece\)/.test(q.name) && x1 < front - 5;
      const extra = freeEnd ? 3 : Math.max(0, -y0), k = edges.findIndex((x) => Math.abs(x[0] - x1) < 30);
      if (k < 0) edges.push([x1, extra]); else edges[k][1] = Math.max(edges[k][1], extra);
    });
    return edges.sort((a, b) => b[0] - a[0]);
  }
  const edgeDroop = (warp, extra, k, g) => Math.min(8, warp * gapDroop(g) * (k === 0 ? 1 : 0.6) + extra * Math.min(1, gapDroop(g) + 0.3));
  // The stall is a time to climb over the roller, so its length in belt travel grows with the speed at the gap,
  // and the snag's jolt (the turn) grows with the square root of speed. Reference speed 0.44 m/s. Assumed.
  const stallOf = (delta, r) => Math.min(90, (delta - CATCH_MM) * 6 * (0.6 + 0.8 * r) * scanSpeed() / 440);
  const kickScale = () => Math.sqrt(scanSpeed() / 440);
  function solveU(xAt, target) {   // xAt is non-decreasing in u
    let a = MOTION_U0, b = MOTION_U0 + MOTION_DU * (MOTION_N - 1);
    for (let i = 0; i < 40; i++) { const c = (a + b) / 2; if (xAt(c) < target) a = c; else b = c; }
    return (a + b) / 2;
  }
  // Pallet centre position against encoder progress u through the sections (x - u). The rollers under the pallet
  // drive it: the faster middle section's pull grows with the share of the pallet's length on it, and the pallet
  // follows that drive speed with slip, relaxing over SLIP_MM of travel. Depends on the pallet's length.
  const SLIP_MM = 80;   // assumed
  const sectionMaps = new Map();
  function sectionMap(f, len) {
    const key = f + "|" + Math.round(len / 50);
    if (sectionMaps.has(key)) return sectionMaps.get(key);
    const onFast = (x) => Math.max(0, Math.min(x + len / 2, SECTION_HALF) - Math.max(x - len / 2, -SECTION_HALF)) / len;
    const drive = (x) => 1 / (1 + (f - 1) * (1 - onFast(x)));   // in middle-section encoder units
    const dx = new Float32Array(MOTION_N), sub = 4, h = MOTION_DU / sub;
    let x = MOTION_U0 / f, v = drive(x);   // far upstream: on the infeed, at its speed
    for (let i = 0; i < MOTION_N; i++) {
      dx[i] = x;
      for (let k = 0; k < sub; k++) { v += (drive(x) - v) * Math.min(1, h / SLIP_MM); x += v * h; }
    }
    const i0 = Math.round(-MOTION_U0 / MOTION_DU), shift = dx[i0] - (MOTION_U0 + i0 * MOTION_DU);   // anchor: x = u at u = 0
    for (let i = 0; i < MOTION_N; i++) dx[i] = dx[i] - shift - (MOTION_U0 + i * MOTION_DU);
    sectionMaps.set(key, dx);
    return dx;
  }
  // ahead: the pallet this one touches; it can only fall back from it (a faster middle section opens a gap)
  function buildMotion(p, g, ahead) {
    const O = p.orient, m = staticMotion(p.zoff, p.yaw + O.yaw, O.dy, O.pitch), J = p.jostle, uAt = (i) => MOTION_U0 + i * MOTION_DU;
    const along = O.yaw ? p.W : p.L, across = O.yaw ? p.L : p.W, sec = sectionMap(sectionFactor, along);
    const base = (u) => motionSample(sec, u) - p.slip * Math.min(3000, Math.max(0, u + 1500)) + p.ripple * Math.sin(u * 0.004 + p.ripplePh);
    const behind = () => { if (ahead) for (let i = 0; i < MOTION_N; i++) { const u = uAt(i), limit = palletX(ahead, u + p.off) - ahead.reach - p.reach; m.dx[i] = Math.min(u + m.dx[i], limit) - u; } };
    if (!J) { for (let i = 0; i < MOTION_N; i++) m.dx[i] = base(uAt(i)); behind(); return m; }
    const events = J.hesitations.map((h) => ({ u0: h.u0, dur: h.dur, kick: h.kick, dz: 0 }));
    const lagAt = (u) => events.reduce((a, e) => a + Math.min(e.dur, Math.max(0, u - e.u0)), 0);
    const xAt = (u) => u + base(u) - lagAt(u);
    const xNear = -(g / 2 + ROLL_R);
    let front = null;
    contactEdges(p).forEach(([e, extra], k) => {
      const delta = edgeDroop(J.warp, extra, k, g);
      const xFar = g / 2 + ROLL_R - Math.sqrt(Math.max(0, 60 * delta - delta * delta));   // drooped edge meets the far roller's face
      const uHit = solveU(xAt, xFar - e);
      if (k === 0) front = { delta: delta, uLeave: solveU(xAt, xNear - e), uHit: uHit, stall: 0 };
      if (delta <= CATCH_MM) return;
      const r = J.catchRnd[k % J.catchRnd.length], stall = stallOf(delta, r[0]);
      if (stall < 1) return;   // a bump, not a stop
      const side = Math.sign(p.yaw || r[1] - 0.5);   // the leading corner reaches the roller first
      const kick = side * stall * (0.2 + 0.6 * r[1]) / across * kickScale() / (scanSpeed() / 440);   // turn per stall scales with sqrt(speed), not speed
      events.push({ u0: uHit, dur: stall, kick: kick, dz: side * stall * 0.3 * r[2] });
      m.catches.push({ stall: stall, kickDeg: kick * 180 / Math.PI });
      if (k === 0) front.stall = stall;
    });
    for (let i = 0; i < MOTION_N; i++) {
      const u = uAt(i);
      m.dx[i] = base(u) - lagAt(u);
      let yaw = p.yaw + O.yaw + J.wanderYaw * Math.sin(u / 900 + J.ph[0]), z = p.zoff + J.wanderZ * Math.sin(u / 700 + J.ph[1]);
      events.forEach((ev) => { const f = Math.min(1, Math.max(0, (u - ev.u0) / Math.max(ev.dur, 1))); yaw += ev.kick * f; z += ev.dz * f; });
      m.yaw[i] = yaw; m.z[i] = z;
      if (!front) continue;
      // nose droop: grows while the front edge crosses the gap, held while stuck, lifted onto the far roller after
      let k = 0;
      if (u > front.uLeave && u < front.uHit) k = Math.pow((u - front.uLeave) / (front.uHit - front.uLeave), 2);
      else if (u >= front.uHit) k = u <= front.uHit + front.stall ? 1 : Math.max(0, 1 - (u - front.uHit - front.stall) / 20);
      m.pitch[i] = O.pitch - front.delta * k / along; m.dy[i] = O.dy - front.delta * k / 2;   // pivot at the rear support
      // landed on the far roller: the nose bounces, decaying over about three cycles; harder at higher speed
      const u1 = front.uHit + front.stall + 20, cycle = scanSpeed() / BOUNCE_HZ;
      if (u > u1) { const b = front.delta * 0.5 * kickScale() * Math.exp(-(u - u1) / (3 * cycle)) * Math.sin(2 * Math.PI * (u - u1) / cycle); m.pitch[i] += b / along; m.dy[i] += b / 2; }
    }
    behind();
    m.hesitations = J.hesitations.length;
    return m;
  }
  // Per-pallet random draws, made once, so a gap change re-derives the same pallet's motion.
  function jostleDraws(p) {
    const hes = [];
    for (let u = -3500 + -Math.log(1 - rnd()) * 10000; u < 3500; u += -Math.log(1 - rnd()) * 10000)   // ~1 per 10 m
      hes.push({ u0: u, dur: 2 + rnd() * 8, kick: (rnd() - 0.5) * 0.002 });
    return { warp: warpOf(p.type.id, rnd()) + (p.verdict === "usable" ? 0 : 0.8), hesitations: hes,
      wanderZ: 2 + rnd() * 4, wanderYaw: (0.1 + rnd() * 0.2) * Math.PI / 180, ph: [rnd() * 6.28, rnd() * 6.28],
      catchRnd: Array.from({ length: 8 }, () => [rnd(), rnd(), rnd()]) };
  }
  // Expected sticking at gap g for intact pallets of the ticked types (model, not measured).
  const typeEdges = new Map();
  function stickEstimate(g) {
    let w = 0, catches = 0, stall = 0, worst = 0;
    TYPES.filter((t) => enabled.has(t.id)).forEach((t) => {
      if (!typeEdges.has(t.id)) typeEdges.set(t.id, contactEdges(analysisPallet(t)));
      const edges = typeEdges.get(t.id);
      for (let i = 0; i < 40; i++) {
        const warp = warpOf(t.id, (i + 0.5) / 40);
        edges.forEach(([, extra], k) => {
          const d = edgeDroop(warp, extra, k, g);
          if (d <= CATCH_MM) return;
          const st = stallOf(d, 0.5);
          if (st < 1) return;
          catches += t.weight / 40; stall += st * t.weight / 40; worst = Math.max(worst, stallOf(d, 1));
        });
      }
      w += t.weight;
    });
    return { perPallet: w ? catches / w : 0, meanStall: catches ? stall / catches : 0, worst: worst };
  }

