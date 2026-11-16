  // ---------------- parts ----------------
  const MAT = { spruce: 0, oak: 1, press: 2, paint: 3, moulded: 4, plasticBlue: 5, plasticGrey: 6, wrap: 7, steel: 9, floor: 10, card: 11, lamp: 12 };
  const MAT3D = { spruce: "#c9a878", oak: "#8d6a45", press: "#a9875e", paint: "#2a58a8", moulded: "#7b5838", plasticBlue: "#2d5fb0", plasticGrey: "#3a3d42", wrap: "#d7dde2", steel: "#7f8891", floor: "#2b2e31", card: "#a8845a", lamp: "#fff4d6" };
  const WOOD = ["#cfae7e", "#c6a476", "#b6aa98", "#d6b688", "#ada291"];
  // Each part draws its look from its own generator, seeded by the pallet's salt and the part's identity, so
  // removing one part (a damage) leaves every other part unchanged.
  let palletSalt = 1;
  function partRng(name, lo) {
    let h = 2166136261 ^ Math.floor(palletSalt * 1e6);
    const s = name + "|" + lo.map((v) => v.toFixed(1)).join(",");
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  }
  function part(name, lo, hi, mat, axis, extra) {
    const rnd = partRng(name, lo), pick = (a) => a[Math.floor(rnd() * a.length)];
    const p = Object.assign({ name: name, lo: lo, hi: hi, mat: mat, axis: axis, seed: Math.floor(rnd() * 9000) + 1, crack: 1e9, flags: 0, wet: 0, mud: 0,
      knots: [1e9, 1e9, 1e9, 1e9], stain: [0, 0, 0], silver: 0, nails: null, nailPat: null, mark: [0, 0, 0, 0], sub: null, planes: [], taper: null,
      soil: null, flexible: false }, extra || {});
    if (!p.col) {
      if (mat === "spruce" || mat === "paint") p.col = srgb2lin(pick(WOOD));
      else if (mat === "oak") p.col = srgb2lin(pick(["#9a7550", "#8c6a48", "#a07b55"]));
      else if (mat === "press") p.col = srgb2lin("#b08a5e");
      else if (mat === "moulded") p.col = srgb2lin("#7d5a3a");
      else if (mat === "plasticBlue") p.col = srgb2lin("#2c5ea8");
      else if (mat === "plasticGrey") p.col = srgb2lin("#45484d");
      else if (mat === "card") p.col = srgb2lin("#a8845a");
      else p.col = [0.5, 0.5, 0.5];
    }
    if ((mat === "spruce" || mat === "oak" || mat === "paint") && rnd() < 0.7) {
      const span = Math.max(hi[0] - lo[0], hi[2] - lo[2]);
      p.knots = [(rnd() - 0.5) * span, (rnd() - 0.5) * 60, rnd() < 0.4 ? (rnd() - 0.5) * span : 1e9, (rnd() - 0.5) * 60];
      const ca = axis === 2 ? (lo[0] + hi[0]) / 2 : (lo[2] + hi[2]) / 2, al = axis === 2 ? (lo[2] + hi[2]) / 2 : (lo[0] + hi[0]) / 2;
      p.knots[0] += al; p.knots[1] += ca; if (p.knots[2] < 1e8) p.knots[2] += al; p.knots[3] += ca;
    }
    if (lo[1] <= 0 && rnd() < 0.8) p.stain = [lo[0] + rnd() * (hi[0] - lo[0]), lo[2] + rnd() * (hi[2] - lo[2]), 12 + rnd() * 35];
    return p;
  }
  // half-space n·p <= d cutting the edge between faces (axis a, side sa) and (axis b, side sb) by c mm
  function chamfer(lo, hi, a, sa, b, sb, c) {
    const n = [0, 0, 0]; n[a] = sa; n[b] = sb; const k = Math.SQRT1_2;
    const ea = sa > 0 ? hi[a] : lo[a], eb = sb > 0 ? hi[b] : lo[b];
    return [n[0] * k, n[1] * k, n[2] * k, (sa * ea + sb * eb - c) * k];
  }
  function taperPlanes(cx, cz, botW, botD, topW, topD, y0, y1) {   // four sides leaning out toward the top
    const kx = (topW - botW) / 2 / (y1 - y0), kz = (topD - botD) / 2 / (y1 - y0), out = [];
    [1, -1].forEach((s) => { const nl = Math.hypot(1, kx); out.push([s / nl, -kx / nl, 0, (botW / 2 + s * cx - kx * y0) / nl]); });
    [1, -1].forEach((s) => { const nl = Math.hypot(1, kz); out.push([0, -kz / nl, s / nl, (botD / 2 + s * cz - kz * y0) / nl]); });
    return out;
  }

