  // ---------------- pallet types ----------------
  // Each damage: [label, severity ("discard", "repair", "borderline"), function setting build options].
  // A board that has worked loose from all blocks but one turns flat about that block's nails. Assumed range, degrees.
  const LOOSE_TURN_DEG = [2, 15];
  const looseTurn = () => (LOOSE_TURN_DEG[0] + rnd() * (LOOSE_TURN_DEG[1] - LOOSE_TURN_DEG[0])) * Math.PI / 180;
  // A board turned flat by angle (rad) about pivot [x, z]: the box around the turned board, trimmed to it by four
  // upright cuts (the tracer's half-spaces n·p <= w). turn keeps the unturned box and the turn, for the 3D view.
  function turnedPart(name, lo, hi, pivot, angle, mat, axis, extra) {
    const c = Math.cos(angle), s = Math.sin(angle), [px, pz] = pivot;
    const corners = [[lo[0], lo[2]], [hi[0], lo[2]], [hi[0], hi[2]], [lo[0], hi[2]]].map(([x, z]) => [px + (x - px) * c - (z - pz) * s, pz + (x - px) * s + (z - pz) * c]);
    const xs = corners.map((q) => q[0]), zs = corners.map((q) => q[1]);
    const uP = c * px + s * pz, vP = -s * px + c * pz;   // the turned board's own axes u = (c, s), v = (-s, c), at the pivot
    const planes = [[c, 0, s, uP + hi[0] - px], [-c, 0, -s, -uP - (lo[0] - px)], [-s, 0, c, vP + hi[2] - pz], [s, 0, -c, -vP - (lo[2] - pz)]];
    return part(name, [Math.min(...xs), lo[1], Math.min(...zs)], [Math.max(...xs), hi[1], Math.max(...zs)], mat, axis,
      Object.assign({}, extra, { planes: planes, turn: { lo: lo, hi: hi, pivot: pivot, angle: angle } }));
  }
  function blockPallet(o) {
    const L = o.L, W = o.W, parts = [], tb = o.tBottom, hb = o.hBlock, tc = o.tCross, tt = o.tTop, dm = o.dmg;
    const nailP = (p) => { p.nails = [o.cols[0], o.cols[1], o.cols[2], (p.hi[2] - p.lo[2]) * 0.35]; p.nailPat = [45, 3]; return p; };
    const sideName = o.bottom.length === 2 ? ["left", "right"] : ["left", "middle", "right"];
    o.bottom.forEach(([z, d0], bi) => {
      // a non-standard repair: a thinner, narrower board, nailed up against the blocks so it sits higher than the others
      const thin = dm.thinBoard === bi, t = thin ? tb - 6 : tb, d = thin ? d0 - 20 : d0, yb = tb - t;
      const nm = "bottom board " + sideName[bi], lo = [-L / 2, yb, z - d / 2], hi = [L / 2, tb, z + d / 2];
      const ex = {};
      if (dm.crackBoard === bi) ex.crack = dm.crackAt;
      if (o.repaired === bi) { ex.col = srgb2lin("#e2c49a"); ex.silver = 1; }
      if (thin) ex.col = srgb2lin("#e8cfa6");
      const pl = o.chamfer && !thin ? [chamfer(lo, hi, 1, -1, 2, -1, 6), chamfer(lo, hi, 1, -1, 2, 1, 6)] : [];
      const seg = (a, b, y0, extraName) => nailP(part(nm + (extraName || ""), [a, y0 + yb, z - d / 2], [b, y0 + tb, z + d / 2], o.mat, 0, Object.assign({ planes: y0 === 0 ? pl : [] }, ex)));
      // from a to b, turned by angle about the nails of the block at pivotX, its free end outward (nails pulled: no heads)
      const turnedSeg = (a, b, pivotX, angle, extraName) => turnedPart(nm + extraName, [a, yb, z - d / 2], [b, tb, z + d / 2], [pivotX, z],
        angle * Math.sign(z || 1) * Math.sign((a + b) / 2 - pivotX), o.mat, 0, ex);
      if (dm.brokenBoard === bi) {
        parts.push(dm.turnPiece ? turnedSeg(-L / 2, dm.breakAt - 80, o.cols[0], dm.turnPiece, " (piece, loose, turned)") : seg(-L / 2, dm.breakAt - 80, 0, " (piece)"),
          seg(dm.breakAt + 80, L / 2, 0, " (piece)"));
        parts.push(part("splinter at break", [dm.breakAt - 80, 0, z - d / 2], [dm.breakAt - 50, tb * 0.55, z - d / 6], o.mat, 0));
      } else if (dm.sagBoard === bi) {
        const a = -L / 2 + L * 0.3, b = L / 2 - L * 0.3;
        parts.push(seg(-L / 2, a, 0), seg(a, b, -7, " (sagging span)"), seg(b, L / 2, 0));
      } else if (dm.turnBoard && dm.turnBoard.board === bi) parts.push(turnedSeg(-L / 2, L / 2, o.cols[dm.turnBoard.atFront ? 2 : 0], dm.turnBoard.angle, " (loose, turned)"));
      else parts.push(seg(-L / 2, L / 2, 0));
    });
    if (dm.splitNails !== undefined) {   // split along the grain next to the rear block: a gap with two nail shanks in it
      // the asked-for board, or the first other one still whole (another damage may have broken or turned it)
      const b = [dm.splitNails, ...sideName.keys()].map((i) => parts.find((q) => q.name === "bottom board " + sideName[i])).find(Boolean);
      if (!b) throw new Error("no whole bottom board left to split");
      const x = o.cols[0] + 25, zc = (b.lo[2] + b.hi[2]) / 2;
      b.sub = [[x - 4, b.lo[1] - 1, b.lo[2] - 1], [x + 4, b.hi[1] + 1, b.hi[2] - 12]];
      [-25, 10].forEach((dz) => parts.push(part("nail shank", [x - 1.5, b.lo[1] + 3, zc + dz - 1.5], [x + 1.5, b.hi[1], zc + dz + 1.5], "steel", 1, { col: [0.42, 0.43, 0.45] })));
    }
    if (o.perimeter) [-L / 2 + 50, L / 2 - 50].forEach((x, i) => parts.push(part("perimeter board " + (i ? "front" : "rear"), [x - 50, 0, -W / 2], [x + 50, tb, W / 2], o.mat, 2)));
    const colN = ["rear", "centre", "front"], rowN = ["left", "middle", "right"];
    o.cols.forEach((x, ci) => o.rows.forEach(([z, d], ri) => {
      if ((dm.missing || []).some(([a, b]) => a === ci && b === ri)) return;
      const skew = dm.skewBlock && dm.skewBlock[0] === ci && dm.skewBlock[1] === ri ? dm.skewBlock[2] * Math.sign(z || 1) : 0;   // knocked outward
      const lo = [x - o.bw / 2, tb, z - d / 2 + skew], hi = [x + o.bw / 2, tb + hb, z + d / 2 + skew];
      const ex = { planes: o.chamfer ? [chamfer(lo, hi, 0, -1, 2, -1, 8), chamfer(lo, hi, 0, 1, 2, -1, 8), chamfer(lo, hi, 0, -1, 2, 1, 8), chamfer(lo, hi, 0, 1, 2, 1, 8)] : [] };
      if ((dm.crackBlocks || []).some(([a, b]) => a === ci && b === ri)) ex.crack = x + 10;
      if ((dm.chipBlocks || []).some(([a, b]) => a === ci && b === ri)) ex.sub = [[hi[0] - 40, hi[1] - 35, lo[2] - 1], [hi[0] + 1, hi[1] + 1, lo[2] + 30]];
      else if (o.wearChips && rnd() < 0.15) ex.sub = [[lo[0] - 1, lo[1] - 1, hi[2] - 12], [lo[0] + 14, lo[1] + 18, hi[2] + 1]];
      if (o.marks && !dm.noMarks && ri !== 1) ex.mark = ci !== 1 ? [1, ri === 0 ? 4 : 5, x, tb + hb / 2] : [2, ri === 0 ? 4 : 5, x, tb + hb / 2];
      if (o.label === ci * 3 + ri && ri !== 1) ex.mark = [3, ri === 0 ? 4 : 5, x, tb + hb / 2];
      parts.push(part("block " + colN[ci] + " " + rowN[ri], lo, hi, o.blockMat(ri), 1, ex));
    }));
    o.cols.forEach((x, ci) => parts.push(part("cross board " + colN[ci], [x - o.bw / 2, tb + hb, -W / 2], [x + o.bw / 2, tb + hb + tc, W / 2], o.mat, 2)));
    const y0 = tb + hb + tc;
    o.top.forEach(([z, d], ti) => { if ((dm.missingTop || []).includes(ti)) return; parts.push(part("top board " + (ti + 1), [-L / 2, y0, z - d / 2], [L / 2, y0 + tt, z + d / 2], o.mat, 0)); });
    return { parts: parts, L: L, W: W, H: y0 + tt };
  }
  // From the EPAL quality classification for the open exchange pool: what makes a pallet "not usable" until a
  // licensed repair (contamination that can pass onto goods, rotten elements, inadmissible components such as woodworm,
  // wane or an under-sized board, a block skewed over 1 cm, more nail shanks visible than allowed, no legible marks),
  // and adhesions (film, tape, straps) that must be removed before grading. Severity here: "repair" for not usable
  // until repaired, "flag" for adhesions (remove, then grade).
  const soilDamage = (label, kind) => [label, "repair", (d) => (d.soils = (d.soils || []).concat([kind]))];
  const CONTAMINATION = [soilDamage("oil stain (contamination)", "oil"), soilDamage("paint splashes (contamination)", "paint"), soilDamage("mould (contamination)", "mould")];
  const WOOD_DEFECTS = [soilDamage("rotten wood", "rot"), soilDamage("woodworm holes (inadmissible component)", "woodworm"), soilDamage("wane on a bottom board (inadmissible component)", "wane")];
  const ADHESIONS = [["strap caught in the pallet", "flag", (d) => (d.strap = true)], ["film or tape stuck on a block", "flag", (d) => (d.film = true)]];
  const NAIL_DAMAGES = [["protruding nail, underside", "repair", (d) => (d.nailOut = "under")], ["protruding nail, top deck", "repair", (d) => (d.nailOut = "top")]];
  const BLOCK_DAMAGES = (nb) => [
    ["missing corner block", "discard", (d) => (d.missing = (d.missing || []).concat([[2, 0]]))],
    ["missing centre block", "discard", (d) => (d.missing = (d.missing || []).concat([[1, 1]]))],
    ["broken bottom board", "repair", (d) => { d.brokenBoard = nb - 1; d.breakAt = -250; }],
    ["cracked bottom board", "repair", (d) => { d.crackBoard = 0; d.crackAt = 120; }],
    ["split block (borderline)", "borderline", (d) => (d.crackBlocks = (d.crackBlocks || []).concat([[0, 0]]))],
    ["chipped block corner (borderline)", "borderline", (d) => (d.chipBlocks = (d.chipBlocks || []).concat([[2, 2]]))],
    ["sagging bottom board (borderline)", "borderline", (d) => { d.sagBoard = Math.min(1, nb - 1); }],
    ["missing top board", "repair", (d) => (d.missingTop = (d.missingTop || []).concat([1]))],
    ["skewed block, over 1 cm overhang", "repair", (d) => (d.skewBlock = [2, 0, 15])],
    ["split board, nail shanks visible", "repair", (d) => (d.splitNails = 0)],
    ["loose bottom board, turned", "repair", (d) => (d.turnBoard = { board: 0, atFront: rnd() < 0.5, angle: looseTurn() })],
    ["broken bottom board, loose piece turned", "repair", (d) => { d.brokenBoard = nb - 1; d.breakAt = -250; d.turnPiece = looseTurn(); }],
    ["non-standard repair: board too thin", "repair", (d) => (d.thinBoard = nb - 1)],
    ["markings illegible", "repair", (d) => (d.noMarks = true)],
    ...NAIL_DAMAGES, ...CONTAMINATION, ...WOOD_DEFECTS, ...ADHESIONS
  ];
  const TYPES = [
    { id: "eur", name: "EUR / EPAL 1200×800", weight: 5, material: "spruce, presswood middle blocks", damages: BLOCK_DAMAGES(3),
      build: (dm, w) => blockPallet(Object.assign({ L: 1200, W: 800, tBottom: 22, hBlock: 78, tCross: 22, tTop: 22, bw: 145, mat: "spruce", chamfer: true, marks: true,
        bottom: [[-350, 100], [0, 145], [350, 100]], rows: [[-350, 100], [0, 145], [350, 100]], cols: [-527.5, 0, 527.5],
        top: [[-327.5, 145], [-163.75, 100], [0, 145], [163.75, 100], [327.5, 145]], blockMat: (ri) => (ri === 1 ? "press" : "spruce") }, w, { dmg: dm })) },
    { id: "oneway", name: "One-way 1200×800, 2 bottom boards", weight: 2, material: "thin spruce, presswood blocks", damages: BLOCK_DAMAGES(2).filter((x) => !/centre|sagging|markings/.test(x[0])),
      build: (dm, w) => blockPallet(Object.assign({ L: 1200, W: 800, tBottom: 15, hBlock: 75, tCross: 15, tTop: 15, bw: 100, mat: "spruce",
        bottom: [[-340, 100], [340, 100]], rows: [[-340, 100], [0, 100], [340, 100]], cols: [-550, 0, 550],
        top: [[-340, 100], [-170, 80], [0, 100], [170, 80], [340, 100]], blockMat: () => "press" }, w, { dmg: dm })) },
    { id: "ind", name: "Industrial 1200×1000", weight: 2, material: "spruce", damages: BLOCK_DAMAGES(3).filter((x) => !/markings/.test(x[0])),
      build: (dm, w) => blockPallet(Object.assign({ L: 1200, W: 1000, tBottom: 22, hBlock: 78, tCross: 22, tTop: 22, bw: 145, mat: "spruce", chamfer: true,
        bottom: [[-427.5, 145], [0, 145], [427.5, 145]], rows: [[-427.5, 145], [0, 145], [427.5, 145]], cols: [-527.5, 0, 527.5],
        top: [[-427.5, 145], [-285, 100], [-142.5, 100], [0, 145], [142.5, 100], [285, 100], [427.5, 145]], blockMat: () => "spruce" }, w, { dmg: dm })) },
    { id: "chep", name: "CHEP 1200×1000, perimeter base", weight: 2, material: "painted spruce (pool blue)", damages: BLOCK_DAMAGES(3).filter((x) => !/sagging|markings/.test(x[0])),
      build: (dm, w) => blockPallet(Object.assign({ L: 1200, W: 1000, tBottom: 22, hBlock: 90, tCross: 22, tTop: 22, bw: 145, mat: "paint", perimeter: true,
        bottom: [[-450, 100], [0, 145], [450, 100]], rows: [[-450, 100], [0, 145], [450, 100]], cols: [-527.5, 0, 527.5],
        top: [[-430, 140], [-290, 100], [-145, 100], [0, 140], [145, 100], [290, 100], [430, 140]], blockMat: () => "paint" }, w, { dmg: dm })) },
    { id: "half", name: "Half pallet 800×600", weight: 1, material: "spruce", damages: BLOCK_DAMAGES(3).filter((x) => !/top board|markings/.test(x[0])),
      build: (dm, w) => blockPallet(Object.assign({ L: 800, W: 600, tBottom: 22, hBlock: 78, tCross: 22, tTop: 22, bw: 120, mat: "spruce",
        bottom: [[-250, 100], [0, 120], [250, 100]], rows: [[-250, 100], [0, 120], [250, 100]], cols: [-340, 0, 340],
        top: [[-245, 110], [-120, 90], [0, 110], [120, 90], [245, 110]], blockMat: () => "spruce" }, w, { dmg: dm })) },
    { id: "plastic3", name: "Plastic 1200×800, 3 skids", weight: 1.5, material: "HDPE, blue",
      damages: [["broken-off skid piece", "discard", (d) => (d.cutSkid = 2)], ["missing foot", "discard", (d) => (d.missingFoot = 4)], ["cracked deck", "repair", (d) => (d.crackDeck = true)], ["crushed foot corner (borderline)", "borderline", (d) => (d.crushFoot = 0)]],
      build: (dm) => plasticPallet("plasticBlue", true, dm) },
    { id: "nest", name: "Plastic nestable 1200×800, 9 feet", weight: 1, material: "recycled PP, grey",
      damages: [["missing foot", "discard", (d) => (d.missingFoot = 0)], ["cracked deck", "repair", (d) => (d.crackDeck = true)], ["crushed foot corner (borderline)", "borderline", (d) => (d.crushFoot = 8)],
        ...CONTAMINATION.slice(0, 2), ...ADHESIONS],
      build: (dm) => plasticPallet("plasticGrey", false, dm) },
    { id: "gma", name: "US stringer 48×40 (1219×1016)", weight: 1, material: "hardwood",
      damages: [["missing bottom deckboard", "repair", (d) => (d.missingDeck = 2)], ["cracked bottom deckboard", "repair", (d) => (d.crackDeck = 1)], ["broken stringer", "discard", (d) => (d.brokenStringer = 1)], ["chipped deckboard edge (borderline)", "borderline", (d) => (d.chipDeck = 4)], ...NAIL_DAMAGES],
      build: (dm, w) => stringerPallet(dm, w) },
    { id: "moulded", name: "Moulded presswood 1200×800", weight: 1, material: "moulded wood fibre",
      damages: [["missing foot", "discard", (d) => (d.missingFoot = 8)], ["cracked deck", "repair", (d) => (d.crackDeck = true)], ["crushed foot corner (borderline)", "borderline", (d) => (d.crushFoot = 4)],
        ...CONTAMINATION, ...ADHESIONS],
      build: (dm) => mouldedPallet(dm) }
  ];
  function feetGrid(L, W, fw, fd) { const xs = [-L / 2 + fw / 2 + 20, 0, L / 2 - fw / 2 - 20], zs = [-W / 2 + fd / 2 + 20, 0, W / 2 - fd / 2 - 20]; const out = []; xs.forEach((x) => zs.forEach((z) => out.push([x, z]))); return out; }
  function plasticPallet(mat, skids, dm) {
    const L = 1200, W = 800, parts = [], H = 150, skidT = 22, deckT = 30, y0 = skids ? skidT : 0;
    if (skids) [-340, 0, 340].forEach((z, i) => {
      const nm = "skid " + ["left", "middle", "right"][i];
      if (dm.cutSkid === i) {
        parts.push(part(nm + " (piece)", [-L / 2, 0, z - 60], [-120, skidT, z + 60], mat, 0, { flags: 2 }));
        parts.push(part(nm + " (piece)", [120, 0, z - 60], [L / 2, skidT, z + 60], mat, 0, { flags: 2 }));
      } else parts.push(part(nm, [-L / 2, 0, z - 60], [L / 2, skidT, z + 60], mat, 0, { flags: 2 }));
    });
    feetGrid(L, W, 150, 120).forEach(([x, z], i) => {
      if (dm.missingFoot === i) return;
      const ex = { planes: taperPlanes(x, z, 120, 95, 150, 120, y0, H - deckT), taper: [120 / 150, 95 / 120] };
      if (dm.crushFoot === i) ex.sub = [[x + 30, y0 - 1, z - 61], [x + 76, y0 + 45, z - 20]];
      parts.push(part("foot " + (i + 1), [x - 75, y0, z - 60], [x + 75, H - deckT, z + 60], mat, 1, ex));
    });
    parts.push(part("deck", [-L / 2, H - deckT, -W / 2], [L / 2, H, W / 2], mat, 0, { flags: 1, crack: dm.crackDeck ? 140 : 1e9 }));
    return { parts: parts, L: L, W: W, H: H };
  }
  function stringerPallet(dm, w) {
    const L = 1219, W = 1016, parts = [], tb = 16, hs = 89, tt = 16;
    [-565, -282, 0, 282, 565].forEach((x, i) => {
      if (dm.missingDeck === i) return;
      const ex = { nails: [-489, 0, 489, 14], nailPat: [0, 1] };
      if (dm.crackDeck === i) ex.crack = 160;
      if (dm.chipDeck === i) ex.sub = [[x + 20, -1, -W / 2 - 1], [x + 45, tb + 1, -W / 2 + 60]];
      if (w.repaired === i) { ex.col = srgb2lin("#c9a06e"); ex.silver = 1; }
      parts.push(part("bottom deckboard " + (i + 1), [x - 44, 0, -W / 2], [x + 44, tb, W / 2], "oak", 2, ex));
    });
    [-489, 0, 489].forEach((z, i) => {   // stringers with two fork notches each
      const nm = "stringer " + ["left", "middle", "right"][i];
      parts.push(part(nm + " (upper)", [-L / 2, tb + 38, z - 19], [L / 2, tb + hs, z + 19], "oak", 0));
      [[-L / 2, -450], [-200, 200], [450, L / 2]].forEach(([a, b], j) => {
        if (dm.brokenStringer === i && j === 1) return;
        parts.push(part(nm + " (foot " + (j + 1) + ")", [a, tb, z - 19], [b, tb + 38, z + 19], "oak", 0));
      });
    });
    [-560, -373, -187, 0, 187, 373, 560].forEach((x, i) => parts.push(part("top deckboard " + (i + 1), [x - 44, tb + hs, -W / 2], [x + 44, tb + hs + tt, W / 2], "oak", 2)));
    return { parts: parts, L: L, W: W, H: tb + hs + tt };
  }
  function mouldedPallet(dm) {
    const L = 1200, W = 800, parts = [], H = 130, deckT = 25;
    feetGrid(L, W, 160, 150).forEach(([x, z], i) => {
      if (dm.missingFoot === i) return;
      const ex = { planes: taperPlanes(x, z, 110, 100, 160, 150, 0, H - deckT), taper: [110 / 160, 100 / 150] };
      if (dm.crushFoot === i) ex.sub = [[x + 25, -1, z + 20], [x + 81, 40, z + 76]];
      parts.push(part("foot " + (i + 1), [x - 80, 0, z - 75], [x + 80, H - deckT, z + 75], "moulded", 1, ex));
    });
    parts.push(part("deck", [-L / 2, H - deckT, -W / 2], [L / 2, H, W / 2], "moulded", 0, { crack: dm.crackDeck ? -200 : 1e9 }));
    return { parts: parts, L: L, W: W, H: H };
  }

  // A nail standing out of a bottom board's underside or the top deck: a repair, and a safety issue.
  function addNail(built, where) {
    const under = where === "under", cands = built.parts.filter((q) => (under ? q.lo[1] <= 0 && q.hi[1] > 5 : q.hi[1] >= built.H - 1) && q.mat !== "wrap");
    const b = pick(cands), x = b.lo[0] + 30 + rnd() * Math.max(1, b.hi[0] - b.lo[0] - 60), z = (b.lo[2] + b.hi[2]) / 2 + (rnd() - 0.5) * 30;
    const y0 = under ? -14 : built.H, y1 = under ? 0 : built.H + 14;
    built.parts.push(part("protruding nail", [x - 1.5, y0, z - 1.5], [x + 1.5, y1, z + 1.5], "steel", 1, { col: [0.42, 0.43, 0.45] }));
  }
  // A contamination or defect patch on one of the parts the bottom and side cameras see (resting on the belt or just
  // above). Radii in mm (assumed). Rot also crumbles a lower corner; wane cuts a long lower edge where the bark was.
  const SOIL_KIND = { oil: 1, paint: 2, mould: 3, rot: 4, woodworm: 5, wane: 6 }, SOIL_R = { oil: [40, 90], paint: [20, 60], mould: [50, 120], rot: [40, 70], woodworm: [30, 60] };
  function addSoil(built, kind) {
    const low = (q) => q.lo[1] <= 30 && !q.flexible && !["steel", "wrap", "card"].includes(q.mat);
    const cands = built.parts.filter(kind === "wane" ? (q) => low(q) && /^bottom (deck)?board/.test(q.name) && !q.sub && !q.turn : low);
    if (!cands.length) throw new Error("no part to put " + kind + " on");
    const q = pick(cands);
    if (kind === "wane") {
      const side = rnd() < 0.5 ? -1 : 1;
      q.planes = q.planes.filter((pl) => Math.sign(pl[2]) !== side).concat([chamfer(q.lo, q.hi, 1, -1, 2, side, 18)]);
      q.soil = { kind: SOIL_KIND.wane, x: side, z: 0, r: 0 };
      return;
    }
    const [r0, r1] = SOIL_R[kind], x = q.lo[0] + rnd() * (q.hi[0] - q.lo[0]), z = q.lo[2] + rnd() * (q.hi[2] - q.lo[2]);
    q.soil = { kind: SOIL_KIND[kind], x: x, z: z, r: r0 + rnd() * (r1 - r0) };
    if (kind === "rot" && !q.sub) {
      const cx = x < (q.lo[0] + q.hi[0]) / 2 ? q.lo[0] : q.hi[0] - 35, cz = z < (q.lo[2] + q.hi[2]) / 2 ? q.lo[2] : q.hi[2] - 30;
      q.sub = [[cx - 1, q.lo[1] - 1, cz - 1], [cx + 36, q.lo[1] + 12, cz + 31]];
      q.soil.x = cx + 17; q.soil.z = cz + 15;
    }
  }
  // A strapping band caught in the pallet: up through a gap between the bottom boards, its loose end trailing behind
  // on the rollers. Flexible, so it never counts as an edge the pallet stands on.
  function addStrap(built) {
    const bottoms = built.parts.filter((q) => q.lo[1] <= 0 && q.hi[1] > 5 && !q.flexible && q.mat !== "wrap").sort((a, b) => a.lo[2] - b.lo[2]);
    let zg = 0;
    for (let i = 0; i + 1 < bottoms.length; i++) if (bottoms[i + 1].lo[2] - bottoms[i].hi[2] > 30) { zg = (bottoms[i].hi[2] + bottoms[i + 1].lo[2]) / 2; break; }
    const x = (rnd() - 0.5) * built.L * 0.4, col = pick([[0.02, 0.02, 0.02], [0.75, 0.75, 0.72], [0.05, 0.15, 0.5]]), band = { col: col, flexible: true };
    built.parts.push(part("strapping band", [x - 6, 0, zg - 0.6], [x + 6, built.H * 0.6, zg + 0.6], "plasticGrey", 0, band));
    built.parts.push(part("strapping band, loose end", [-built.L / 2 - 250, -1.5, zg - 6], [x + 6, 0, zg + 6], "plasticGrey", 0, band));
  }
  // A piece of film or tape stuck to the outer face of a block or foot.
  function addFilm(built) {
    const blocks = built.parts.filter((q) => /^(block|foot|skid|stringer)/.test(q.name));
    if (!blocks.length) throw new Error("no block to stick film on");
    const b = pick(blocks), out = b.hi[2] > 0, f0 = out ? b.hi[2] : b.lo[2] - 1;
    built.parts.push(part("film stuck on a block", [b.lo[0] + 8, b.lo[1] + 6, f0], [b.hi[0] - 8, b.hi[1] - 4, f0 + 1], "wrap", 0, { flexible: true }));
  }
  // A sheet of cardboard stuck to the underside, across one or two bottom boards.
  function addCardboard(built) {
    const bottoms = built.parts.filter((q) => q.lo[1] <= 0 && q.hi[1] > 5 && q.mat !== "wrap"), b = pick(bottoms);
    const len = 300 + rnd() * 300, x = b.lo[0] + rnd() * Math.max(1, b.hi[0] - b.lo[0] - len), wz = 200 + rnd() * 250, z = (b.lo[2] + b.hi[2]) / 2 + (rnd() - 0.5) * 100;
    built.parts.push(part("cardboard stuck underneath", [x, -2.5, z - wz / 2], [x + len, 0, z + wz / 2], "card", 0));
  }
  // A second pallet of the same build lying on top; the same parts, raised by the pallet height.
  function stackCopy(built) {
    const H = built.H;
    built.parts.slice().forEach((q) => {
      const c = Object.assign({}, q, { name: "upper pallet: " + q.name, lo: [q.lo[0], q.lo[1] + H, q.lo[2]], hi: [q.hi[0], q.hi[1] + H, q.hi[2]], seed: (q.seed * 7 + 13) % 9000 + 1, stain: [0, 0, 0] });
      if (q.sub) c.sub = q.sub.map((v) => [v[0], v[1] + H, v[2]]);
      if (q.turn) c.turn = Object.assign({}, q.turn, { lo: [q.turn.lo[0], q.turn.lo[1] + H, q.turn.lo[2]], hi: [q.turn.hi[0], q.turn.hi[1] + H, q.turn.hi[2]] });
      c.planes = q.planes.map((pl) => [pl[0], pl[1], pl[2], pl[3] + pl[1] * H]);
      if (q.mark[0] && q.mark[1] !== 2 && q.mark[1] !== 3) c.mark = [q.mark[0], q.mark[1], q.mark[2], q.mark[3] + H];   // side faces: v is height
      built.parts.push(c);
    });
    built.H = 2 * H;
  }

  // wear: not damage, but everyday variation that a classifier has to tolerate
  function addWear(built, w, isWood, unusual) {
    const notes = [];
    const bottoms = built.parts.filter((p) => p.lo[1] <= 0 && p.hi[1] > 5);
    if (isWood && rnd() < 0.5 && bottoms.length) {   // splinters hanging below a board edge
      const b = pick(bottoms), n = 1 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const x = b.lo[0] + 40 + rnd() * Math.max(10, b.hi[0] - b.lo[0] - 150), z = rnd() < 0.5 ? b.lo[2] + 2 : b.hi[2] - 6;
        built.parts.push(part("splinter", [x, -4 - rnd() * 4, z], [x + 40 + rnd() * 50, 0, z + 4], b.mat, b.axis));
      }
      notes.push("splinters");
    }
    if (rnd() < 0.25) { pick(built.parts).wet = 0.4 + rnd() * 0.5; pick(built.parts).wet = 0.3 + rnd() * 0.5; notes.push("wet patches"); }
    if (rnd() < 0.4) { const m = 0.3 + rnd() * 0.6; bottoms.forEach((b) => { b.mud = m * rnd(); }); notes.push("mud"); }
    if (rnd() < 0.12 && bottoms.length) {   // stretch-wrap remnant around a bottom board
      const b = pick(bottoms), len = Math.min(300, b.hi[0] - b.lo[0]), x = b.lo[0] + rnd() * (b.hi[0] - b.lo[0] - len);
      built.parts.push(part("stretch wrap", [x, b.lo[1] - 1.5, b.lo[2] - 2], [x + len, b.hi[1] + 1.5, b.hi[2] + 2], "wrap", 0));
      notes.push("stretch-wrap remnant");
    }
    const blocks = built.parts.filter((q) => /^block/.test(q.name));
    if (isWood && blocks.length && rnd() < 0.1) {   // knocked slightly outward: within the 1 cm the EPAL classification allows
      const b = pick(blocks), s = 6 * Math.sign((b.lo[2] + b.hi[2]) || 1); b.lo[2] += s; b.hi[2] += s;
      notes.push("slightly skewed block (≤ 1 cm)");
    }
    if (w.repaired !== undefined) notes.push("repaired board");
    if (w.label !== undefined) notes.push("paper label");
    if (w.wearChips) notes.push("worn block edges");
    if (unusual && rnd() < 0.05) { const s = 0.4 + rnd() * 0.6; built.parts.forEach((q) => { if (q.hi[1] >= built.H - 1) q.snow = s; }); notes.push("snow on the deck"); }
    if (unusual && rnd() < 0.04) { const a = 0.4 + rnd() * 0.6; built.parts.forEach((q) => { q.ice = a; }); notes.push("ice glaze"); }
    return notes;
  }

  // forceDamage: undefined = random; null = clean (no wear, no damage); [label, severity, fn] = exactly that damage, no wear
  function makePallet(type, damaged, forceDamage) {
    const dm = {}, labels = [];
    palletSalt = rnd();
    const clean = forceDamage !== undefined;
    if (forceDamage) { forceDamage[2](dm); labels.push([forceDamage[0], forceDamage[1]]); }
    else if (!clean && damaged) {
      const n = rnd() < 0.6 ? 1 : rnd() < 0.75 ? 2 : 3, pool = type.damages.slice();
      for (let i = 0; i < n && pool.length; i++) { const d = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; d[2](dm); labels.push([d[0], d[1]]); }
    }
    const wood = !/plastic|nest|moulded/.test(type.id);
    const w = clean ? {} : { repaired: wood && rnd() < 0.2 ? Math.floor(rnd() * 2) : undefined, label: wood && rnd() < 0.3 ? pick([0, 2, 6, 8]) : undefined, wearChips: wood && rnd() < 0.5 };
    const built = type.build(dm, w), unusual = !clean && unusualOn;
    if (dm.nailOut) addNail(built, dm.nailOut);
    (dm.soils || []).forEach((k) => addSoil(built, k));
    if (dm.strap) addStrap(built);
    if (dm.film) addFilm(built);
    const wear = clean ? [] : addWear(built, w, wood, unusual);
    // Unusual arrivals that the grading rules may or may not cover: flagged rather than judged.
    let orient = { yaw: 0, pitch: 0, dy: 0 };
    if (unusual) {
      if (rnd() < 0.04) { addCardboard(built); labels.push(["cardboard stuck underneath", "flag"]); }
      if (rnd() < 0.02) { stackCopy(built); labels.push(["two pallets stacked", "flag"]); }
      const r = rnd();
      if (r < 0.03) { orient = { yaw: 0, pitch: Math.PI, dy: built.H }; labels.push(["upside down", "flag"]); }   // turned end over end
      else if (r < 0.06) { orient = { yaw: Math.PI / 2, pitch: 0, dy: 0 }; labels.push(["rotated 90°, short side first", "flag"]); }
    }
    let bb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    built.parts.forEach((p) => { for (let i = 0; i < 3; i++) { bb[i] = Math.min(bb[i], p.lo[i]); bb[i + 3] = Math.max(bb[i + 3], p.hi[i]); } });
    bb = bb.map((v, i) => v + (i < 3 ? -2 : 2));
    const verdict = ["discard", "repair", "flag", "borderline"].find((v) => labels.some((l) => l[1] === v)) || "usable";
    return { type: type, damages: labels, verdict: verdict, wear: wear, parts: built.parts, L: built.L, W: built.W, H: built.H, bb: bb, orient: orient };
  }

