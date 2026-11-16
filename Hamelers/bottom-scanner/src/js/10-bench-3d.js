  // ---------------- 3D bench ----------------
  const view = $("view");
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  view.insertBefore(renderer.domElement, view.firstChild);
  const scene3 = new THREE.Scene();
  const cam3 = new THREE.PerspectiveCamera(38, 1.5, 0.02, 80);
  const controls = new THREE.OrbitControls(cam3, renderer.domElement);
  controls.enableDamping = !reduceMotion;
  cam3.position.set(-2.6, 1.2, 3.1); controls.target.set(0.1, 0.25, 0);
  scene3.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(2, 5, 3); scene3.add(sun);
  const M = (hex, o) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(hex), roughness: 0.75 }, o || {}));
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; };
  // The same photo textures as the tracer, tinted per part: texture × (part colour / texture mean colour).
  const TEX_MEAN = { spruce: [0.495, 0.379, 0.252], press: [0.735, 0.593, 0.444], hard: [0.258, 0.187, 0.129] };   // mean sRGB, measured
  const TEX_OF = { spruce: ["spruce", 500], paint: ["spruce", 500], oak: ["hard", 600], press: ["press", 600], moulded: ["press", 350] };
  const tex3d = {};
  TEX_LAYERS.forEach((k) => {
    const load = () => { const t = new THREE.Texture(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
    tex3d[k] = { map: load(), normalMap: load() };
  });
  // A material only gets its maps once the images are in: a map without an image renders black.
  let tex3dReady = false;
  const waitingMats = new Set();
  texImages.then((layers) => {
    TEX_LAYERS.forEach((k, i) => { [tex3d[k].map.image, tex3d[k].normalMap.image] = layers[i]; tex3d[k].map.needsUpdate = tex3d[k].normalMap.needsUpdate = true; });
    tex3dReady = true;
    waitingMats.forEach(texturize); waitingMats.clear();
  }).catch(() => {});   // reported by the tracer's loader; parts keep their plain colours
  function texturize(m) {
    const t = m.userData.tex;
    Object.assign(m, tex3d[t.layer]); m.color.setRGB(t.tint[0], t.tint[1], t.tint[2]); m.needsUpdate = true;
  }
  const lin2srgb = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
  function partMaterial(pt) {
    const tx = TEX_OF[pt.mat];
    if (!tx) return mats3d[pt.mat];
    const mean = TEX_MEAN[tx[0]], base = pt.mat === "paint" ? [0.16, 0.35, 0.66] : pt.col.map(lin2srgb);
    const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(base[0], base[1], base[2]), roughness: 0.88 });
    m.userData.own = true;
    m.userData.tex = { layer: tx[0], tint: [base[0] / mean[0], base[1] / mean[1], base[2] / mean[2]] };   // texture × tint = part colour on average
    if (tex3dReady) texturize(m); else waitingMats.add(m);
    return m;
  }
  // World-scaled UVs per face, grain along the part's long axis, so a board's texture runs continuously.
  function grainUVs(geo, pt, tile, swap) {
    const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
    const c = [0, 1, 2].map((i) => (pt.lo[i] + pt.hi[i]) / 2), A = pt.axis === 2 ? 2 : 0, X = pt.axis === 2 ? 0 : 2;
    const off = [(pt.seed * 0.618) % 1, (pt.seed * 0.377) % 1];
    for (let i = 0; i < pos.count; i++) {
      const w = [pos.getX(i) * 1000 + c[0], pos.getY(i) * 1000 + c[1], pos.getZ(i) * 1000 + c[2]];
      const n = [Math.abs(nor.getX(i)), Math.abs(nor.getY(i)), Math.abs(nor.getZ(i))], fa = n.indexOf(Math.max(...n));
      let [u, v] = fa === 1 ? [w[A], w[X]] : fa === A ? [w[X], w[1]] : [w[A], w[1]];
      if (swap) [u, v] = [v, u];
      uv.setXY(i, u / tile + off[0], v / tile + off[1]);
    }
    uv.needsUpdate = true;
  }
  const mats3d = {}; Object.keys(MAT3D).forEach((k) => { mats3d[k] = M(MAT3D[k], k.startsWith("plastic") ? { roughness: 0.45 } : k === "wrap" ? { transparent: true, opacity: 0.45 } : {}); });
  const fixed = new THREE.Group(), rig = new THREE.Group(), stationRig = new THREE.Group(), visGroup = new THREE.Group();
  scene3.add(fixed, rig, stationRig, visGroup);
  const fans = [];
  const tip = (obj, text) => { obj.traverse((c) => { c.userData.tip = text; }); return obj; };
  let scanLine = null;
  function buildBench() {
    while (fixed.children.length) fixed.remove(fixed.children[0]);
    const steel = M(css("--steel"), { metalness: 0.4, roughness: 0.5 }), roller = M(css("--steel"), { metalness: 0.6, roughness: 0.35 });
    const Wm = BELT_W / 1000, g = (gap / 2 + ROLL_R) / 1000;
    [[-4, -g], [g, 4]].forEach(([a, b]) => [-1, 1].forEach((s) => fixed.add(tip(box(b - a, 0.09, 0.05, steel, (a + b) / 2, -0.045, s * (Wm / 2 + 0.025)), "Conveyor side frame."))));
    for (let k = 0; k < 31; k++) [1, -1].forEach((sg) => {
      const x = sg * (gap / 2 + ROLL_R + k * ROLL_PITCH); if (Math.abs(x) > 4000) return;
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, Wm - 0.06, 18), roller);
      r.rotation.x = Math.PI / 2; r.position.set(x / 1000, -0.03, 0);
      fixed.add(tip(r, k === 0 ? "Roller next to the gap (Ø60 mm), " + gap + " mm clear gap. It is traced: it can cut off steep camera rays and shade the light from below." : "Roller, Ø60 mm, 125 mm pitch."));
    });
    [-1.2, 1.2].forEach((x) => [-0.95, 0.95].forEach((z) => fixed.add(tip(box(0.06, 2.8, 0.06, steel, x, 0.8, z), "Station frame post, also traced: the station cameras see it."))));
    const lampM = M("#fff4d6", { emissive: new THREE.Color("#fff4d6"), emissiveIntensity: 0.9 });
    lampParts().forEach((q) => {
      const s = [0, 1, 2].map((i) => (q.hi[i] - q.lo[i]) / 1000), c = [0, 1, 2].map((i) => (q.lo[i] + q.hi[i]) / 2000), lamp = q.mat === "lamp";
      fixed.add(tip(box(s[0], s[1], s[2], lamp ? lampM : steel, c[0], c[1], c[2]), lamp
        ? "Station lamp (assumed LED panel), " + (q.lo[1] > 1000 ? "1.25 m up beside the belt" : "0.7 m up, facing in from the end") + ". Lights the top and side views and, through gaps in the pallet, the bottom view too. Traced: cameras that see it get its glare."
        : "Beam carrying the station lamps, traced."));
    });
    fixed.add(box(10, 0.04, 6, M(css("--rule"), { roughness: 1 }), 0, -0.62, 0));
    if (sectionFactor > 1.001) [-1, 1].forEach((sg) => [-1, 1].forEach((sz) => fixed.add(tip(box(0.02, 0.1, 0.07, M(css("--accent")), sg * SECTION_HALF / 1000, 0.02, sz * (Wm / 2 + 0.025)),
      "End of the middle section, which runs " + sectionText(sectionFactor) + " than the infeed and outfeed. A pallet speeds up as more of it reaches the faster rollers, with some slip, so touching pallets come apart."))));
    scanLine = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, Wm), new THREE.MeshBasicMaterial({ color: new THREE.Color(css("--beam")) }));
    scanLine.position.set(0, 0.002, 0); fixed.add(tip(scanLine, "Scan line on the belt plane: every bottom-camera pixel ray crosses it."));
  }
  let cams = [];
  function buildRig() {
    while (rig.children.length) rig.remove(rig.children[0]);
    for (let i = fans.length - 1; i >= 0; i--) if (fans[i].userData.kind === "line") fans.splice(i, 1);
    const camM = M(css("--cam"), { roughness: 0.35 }), ledM = M(css("--led"), { emissive: new THREE.Color(css("--led")), emissiveIntensity: 0.6 });
    const beam = new THREE.MeshBasicMaterial({ color: new THREE.Color(css("--beam")), transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
    const leds = new Set();
    cams.forEach((c) => {
      const C = new THREE.Vector3(c.C[0] / 1000, c.C[1] / 1000, c.C[2] / 1000), d0 = new THREE.Vector3(...c.d0), e = new THREE.Vector3(...c.e);
      const axis = new THREE.Vector3(...c.axis), body = box(0.08, 0.1, 0.16, camM, 0, 0, 0);   // the lens at its front face
      body.position.copy(C.clone().addScaledVector(axis, -0.08)); body.lookAt(C.clone().add(axis));
      rig.add(windowMesh(c));
      // stands, as in the traced scene (rigParts): one under each camera, two under each LED bar
      const standM = M(css("--steel"), { metalness: 0.4, roughness: 0.5 }), stand = (x, top, z, w) => rig.add(tip(box(w, top + 0.6, w, standM, x, (top - 0.6) / 2, z), "Stand on the floor, 0.6 m below the belt."));
      stand(C.x, C.y - 0.045, C.z, 0.03);
      if (!leds.has(c.lightPos.join(","))) [-0.45, 0.45].forEach((z) => stand(c.lightPos[0] / 1000, c.lightPos[1] / 1000 - 0.03, z, 0.024));
      rig.add(tip(body, "Line-scan camera " + (c.spec.tilt > 0 ? "+" : "") + c.spec.tilt + "°" + (c.spec.z ? ", " + Math.abs(c.spec.z) + " mm " + (c.spec.z < 0 ? "left" : "right") : ", centred") +
        ". FOV " + ((c.phi1 - c.phi0) * 180 / Math.PI).toFixed(0) + "°, " + c.PX + " px over " + Math.round(c.z1 - c.z0) + " mm; lens " + c.focal.toFixed(0) + " mm focused at " + Math.round(c.focus) + " mm."));
      const lk = c.lightPos.join(",");
      if (!leds.has(lk)) { leds.add(lk); rig.add(tip(box(0.05, 0.03, 1.0, ledM, c.lightPos[0] / 1000, c.lightPos[1] / 1000, 0), "LED line light, 1 m bar, " + Math.round(-c.lightPos[1]) + " mm below the belt" + (c.lightPos[0] === 0 ? ", centred under the gap." : "."))); }
      const pts = [C]; const N = 20;
      for (let i = 0; i <= N; i++) {
        const phi = c.phi0 + (c.phi1 - c.phi0) * i / N;
        const dir = d0.clone().multiplyScalar(Math.cos(phi)).add(e.clone().multiplyScalar(Math.sin(phi)));
        pts.push(C.clone().add(dir.multiplyScalar((0.2 - C.y) / dir.y)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts); const idx = []; for (let i = 1; i <= N; i++) idx.push(0, i, i + 1); geo.setIndex(idx);
      const fan = new THREE.Mesh(geo, beam); fan.userData.kind = "line"; rig.add(tip(fan, "Scan plane of the " + (c.spec.tilt > 0 ? "+" : "") + c.spec.tilt + "° camera; it passes through the gap line.")); fans.push(fan);
    });
    applyFans();
  }
  // Camera c's window, as a pane of the glass it needs, and the air purge collar along its upper edge when on.
  function windowMesh(c) {
    const win = windowFor(c), w = windowOptics(c, opts().fnum), g = new THREE.Group();
    const a = new THREE.Vector3(...win.a), n = new THREE.Vector3(...win.n), b = n.clone().cross(a);
    g.matrix.makeBasis(a, b, n).setPosition(win.o[0] / 1000, win.o[1] / 1000, win.o[2] / 1000); g.matrixAutoUpdate = false;
    const wu = (w.sizeU || 40) / 1000, wv = (w.sizeV || 10) / 1000;
    const glassM = M("#a8d8ea", { transparent: true, opacity: 0.5, roughness: 0.05, depthWrite: false });
    g.add(tip(box(wu, wv, GLASS.thickMm / 1000, glassM, 0, 0, GLASS.thickMm / 2000), "Window, plain glass " + GLASS.thickMm + " mm, " +
      winAngleText(service.winAngle) + " from horizontal" + (w.housed === 1 ? ": too steep for this camera to see through." : ", " + Math.ceil(w.sizeU) + " × " + Math.ceil(w.sizeV) + " mm; lets through " + Math.round(w.tLo * 100) + "–" + Math.round(w.tHi * 100) + "%.")));
    if (service.purge) {
      const up = b.y >= 0 ? 1 : -1;
      g.add(tip(box(wu + 0.01, 0.008, 0.012, M(css("--steel"), { metalness: 0.4, roughness: 0.5 }), 0, up * (wv / 2 + 0.004), 0.006),
        "Air purge collar: blows dry compressed air across the window, about " + WINDOW_WEAR.purgeAirM3h + " m³/h (assumed)."));
    }
    return g;
  }
  function buildStationRig() {
    while (stationRig.children.length) stationRig.remove(stationRig.children[0]);
    for (let i = fans.length - 1; i >= 0; i--) if (fans[i].userData.kind === "area") fans.splice(i, 1);
    const camM = M(css("--cam"), { roughness: 0.35 });
    const beam = new THREE.MeshBasicMaterial({ color: new THREE.Color(css("--cam")), transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
    stationCamParts().filter((q) => q.name !== "station camera").forEach((q) => {   // the mounts, as traced
      const s = [0, 1, 2].map((i) => (q.hi[i] - q.lo[i]) / 1000), c = [0, 1, 2].map((i) => (q.lo[i] + q.hi[i]) / 2000);
      stationRig.add(tip(box(s[0], s[1], s[2], M("#4d4f54"), c[0], c[1], c[2]), "Camera mount (assumed), traced."));
    });
    AREA_CAMS.forEach((c, ci) => {
      if (ci > 0 && !$("opt-station").checked) return;
      const C = new THREE.Vector3(c.C[0] / 1000, c.C[1] / 1000, c.C[2] / 1000), F = new THREE.Vector3(...c.F), R = new THREE.Vector3(...c.R), U = new THREE.Vector3(...c.U);
      const body = box(0.07, 0.07, 0.12, camM, 0, 0, 0); body.position.copy(C); body.lookAt(C.clone().add(F)); stationRig.add(tip(body, c.tip));
      const dist = c.focus / 1000, hw = dist * c.w / 2 / c.fx, hh = dist * c.h / 2 / c.fx;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => C.clone().add(F.clone().multiplyScalar(dist)).add(R.clone().multiplyScalar(a * hw)).add(U.clone().multiplyScalar(b * hh)));
      const geo = new THREE.BufferGeometry().setFromPoints([C].concat(corners)); geo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]);
      const f = new THREE.Mesh(geo, beam); f.userData.kind = "area"; stationRig.add(tip(f, c.tip)); fans.push(f);
    });
    applyFans();
  }
  function applyFans() { const on = $("opt-fans").checked; fans.forEach((f) => { f.visible = on; }); }
  function palletMesh(p) {
    const g = new THREE.Group();
    p.parts.forEach((pt) => {
      const shape = pt.turn ? Object.assign({}, pt, { lo: pt.turn.lo, hi: pt.turn.hi }) : pt;   // a turned board: its own box, turned below
      const sx = (shape.hi[0] - shape.lo[0]) / 1000, sy = (shape.hi[1] - shape.lo[1]) / 1000, sz = (shape.hi[2] - shape.lo[2]) / 1000;
      const m = box(sx, sy, sz, partMaterial(pt), (shape.lo[0] + shape.hi[0]) / 2000, (shape.lo[1] + shape.hi[1]) / 2000, (shape.lo[2] + shape.hi[2]) / 2000);
      if (pt.turn) {   // about its pivot, as turnedPart (three.js turns +y the other way)
        const { pivot: [px, pz], angle: a } = pt.turn, cx = m.position.x * 1000 - px, cz = m.position.z * 1000 - pz;
        m.position.x = (px + cx * Math.cos(a) - cz * Math.sin(a)) / 1000; m.position.z = (pz + cx * Math.sin(a) + cz * Math.cos(a)) / 1000; m.rotation.y = -a;
      }
      if (TEX_OF[pt.mat]) grainUVs(m.geometry, shape, TEX_OF[pt.mat][1], pt.mat === "oak");
      if (pt.taper) {   // narrower at the bottom
        const pos = m.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) if (pos.getY(i) < 0) { pos.setX(i, pos.getX(i) * pt.taper[0]); pos.setZ(i, pos.getZ(i) * pt.taper[1]); }
        pos.needsUpdate = true; m.geometry.computeVertexNormals();
      }
      g.add(m);
    });
    g.rotation.order = "ZYX";   // yaw on the belt, then pitch about the across-belt axis, as in the tracer
    tip(g, p.type.name + ": " + (p.damages.length ? p.damages.map((d) => d[0]).join(", ") : "intact") + (p.wear.length ? "; wear: " + p.wear.join(", ") : "") + ".");
    return g;
  }
  function disposeMesh(g) { g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.userData.own) { waitingMats.delete(o.material); o.material.dispose(); } }); scene3.remove(g); }

