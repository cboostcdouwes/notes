  // ---------------- state ----------------
  let PX = 1024, pitch = 1, specs = [], presetKey = "dual", sideOffset = 400;
  let sBelt = 0, lastLine = 0, feed = [], nextOff = 0, uidN = 0, scanned = 0, paused = false, speed = 1, damageShare = 0.45, scatter = 1;
  let lineCounter = 0, seedN = 1, unusualOn = true;
  // Work per frame is steered by the measured frame time (GPU work isn't visible to JS timers): keep ~12+ fps.
  let lineCap = 48, frameMs = 16;   // measured tracing cost, ms per pixel
  const enabled = new Set(TYPES.map((t) => t.id));
  const liveEl = $("livecams"), gallery = $("gallery");
  let live = [], liveRaking = [];
  const LIVE_W = 512, LIVE_MM = 1700;
  const opts = () => ({ fit: $("opt-fit").checked, rect: $("opt-rect").checked, sharedLight: $("opt-light").checked, lightSetup: $("light-setup").value, spotBeam: $("spot-beam").value, anyZero: specs.some((s) => s.tilt === 0),
    fnum: +$("fnum").value, dirt: Math.min(1, +$("dirt").value + service.extraDirt()), transport: $("opt-transport").checked, station: $("opt-station").checked,
    expUs: Math.pow(10, +$("exp").value), light: +$("light").value, aexpMs: Math.pow(10, +$("aexp").value),
    louvre: +$("louvre").value, dust: +$("dust").value, glare: $("opt-glare").checked,
    vib: +$("vib").value, indirect: $("opt-indirect").checked, rolling: $("shutter").value === "rolling", uncal: $("f-uncal").checked, splinter: $("f-splinter").checked, fog: $("f-fog").checked && !service.purge });
  const specsFor = (key) => (key === "dual" ? [{ tilt: 25, z: -sideOffset }, { tilt: -25, z: sideOffset }] : [{ tilt: Number(key), z: 0 }]);

  function weightedType() {
    const list = TYPES.filter((t) => enabled.has(t.id)); if (!list.length) return null;
    let r = rnd() * list.reduce((a, t) => a + t.weight, 0);
    for (const t of list) { r -= t.weight; if (r <= 0) return t; } return list[list.length - 1];
  }
  // The supply delivers 1000 pallets/h: a faster belt spaces them further apart, but never closer than SPACING.
  const feedGap = (p) => Math.max(SPACING, beltSpeed * 3600 / TARGET_PER_H - 2 * p.reach);
  // Upstream a pallet covers 1/sectionFactor mm per encoder mm, so infeed distances are stretched by the factor in s.
  function spawn() {
    const o = opts();
    while (nextOff < sBelt + 4200) {
      const t = weightedType(); if (!t) break;
      const p = makePallet(t, rnd() < damageShare);
      const prev = feed[feed.length - 1];
      p.uid = ++uidN;
      p.zoff = (rnd() * 2 - 1) * 80 * scatter; p.yaw = (rnd() * 2 - 1) * 5 * scatter * Math.PI / 180;
      const yawT = p.yaw + p.orient.yaw;
      p.reach = Math.abs(p.L / 2 * Math.cos(yawT)) + Math.abs(p.W / 2 * Math.sin(yawT));
      p.touching = !!(o.transport && prev && rnd() < FEED.touching);
      p.mergeProne = p.touching && rnd() < FEED.mergeProne;   // the detector sees this touching pair as one object
      p.slip = o.transport ? rnd() * 0.03 : 0; p.ripple = o.transport ? rnd() * 12 : 0; p.ripplePh = rnd() * 6.28;
      // nextOff is the previous pallet's upstream edge; touching pallets close the gap and move as one
      p.off = feed.length ? nextOff + sectionFactor * ((p.touching ? 0 : feedGap(p)) + p.reach) : nextOff;
      if (p.touching) { p.slip = prev.slip; p.ripple = prev.ripple; }
      p.jostle = o.transport ? jostleDraws(p) : null;
      p.motion = buildMotion(p, gap, p.touching ? prev : null);
      nextOff = p.off + sectionFactor * p.reach;
      p.mesh = palletMesh(p); scene3.add(p.mesh); p.caps = null; p.snaps = {}; p.done = false;
      feed.push(p);
    }
  }

  const camLabel = (c) => (c.spec.tilt > 0 ? "+" : "") + c.spec.tilt + "°" + (c.spec.z ? (c.spec.z < 0 ? " left " : " right ") + Math.abs(c.spec.z) + " mm" : " centred") +
    " · FOV " + ((c.phi1 - c.phi0) * 180 / Math.PI).toFixed(0) + "° · " + (opts().rect ? "rectified" : "raw");

  // What the gap does to the bottom cameras. In the travel/height plane the scan plane is a line from the camera
  // through the gap centre, and the light bar is a point, so roller clearance is plain 2D geometry.
  function gapReport(g, cs, fnum) {
    const centres = [[-(g / 2 + ROLL_R), -ROLL_R], [g / 2 + ROLL_R, -ROLL_R]];
    const clearance = (a, b) => Math.min(...centres.map(([cx, cy]) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((cx - a[0]) * dx + (cy - a[1]) * dy) / (dx * dx + dy * dy)));
      return Math.hypot(a[0] + t * dx - cx, a[1] + t * dy - cy) - ROLL_R;
    }));
    let rays = Infinity, lit = Infinity;   // lit stays Infinity without a bar (side lights only)
    cs.forEach((c) => {
      rays = Math.min(rays, clearance([c.C[0], c.C[1]], [0, 0]) - (fnum > 0 ? c.focal / fnum / 2 : 0));
      // highest point on the scan plane (x = y · C.x / C.y) the light still reaches past the rollers
      if (!c.lightPos) return;
      let y = 0; while (y < 300 && clearance(c.lightPos, [y * c.C[0] / c.C[1], y]) > 0) y += 2;
      lit = Math.min(lit, y);
    });
    return { rays: rays, lit: lit };
  }
  // Which bottom cameras see a station lamp: the scan plane (camera + the gap line) cuts a lamp fixture.
  function lampGlare(camList) {
    const lamps = lampParts().filter((q) => q.mat === "lamp");
    return camList.filter((c) => {
      const n = [c.C[1], -c.C[0]];   // in-plane normal of the line from the gap centre to the camera, in x-y
      return lamps.some((q) => {
        const v = [[q.lo[0], q.lo[1]], [q.hi[0], q.lo[1]], [q.lo[0], q.hi[1]], [q.hi[0], q.hi[1]]].map(([x, y]) => n[0] * x + n[1] * y);
        return Math.min(...v) < 0 && Math.max(...v) > 0 && q.lo[1] > 0;   // above the belt, on both sides of the plane
      });
    });
  }
  function updateGapStat() {
    const r = gapReport(gap, cams, opts().fnum);
    $("st-gap").textContent = gap + " mm · " + (r.rays >= 0 ? "camera rays clear the rollers by " + r.rays.toFixed(0) + " mm" : "rollers cut into the camera view (" + r.rays.toFixed(0) + " mm)") +
      (r.lit === Infinity ? " · side lights along the gap" : " · light reaches " + (r.lit >= 300 ? "the whole pallet height" : r.lit <= 0 ? "nothing above the belt" : "up to " + r.lit + " mm above the belt"));
    const glare = lampGlare(cams);
    $("st-glare").textContent = glare.length ? "seen by the " + glare.map((c) => (c.spec.tilt > 0 ? "+" : "") + c.spec.tilt + "°").join(" and ") + " camera" + (glare.length > 1 ? "s" : "") + ": move or shield the lamps" : "no station lamp in a bottom camera's view";
    $("st-glare").style.color = glare.length ? "var(--bad)" : "";
    const st = stickEstimate(gap);
    $("st-stick").textContent = st.perPallet < 0.01 ? "pallets ride over the gap without snagging" :
      st.perPallet.toFixed(2) + " catches per pallet, " + st.meanStall.toFixed(0) + " mm stall on average, up to " + st.worst.toFixed(0) + " mm (intact pallets; damaged ones droop more)";
  }

  // One live waterfall per bottom camera, and with alternating lights a second one for its raking-light image.
  function setupLive() {
    liveEl.innerHTML = ""; live = []; liveRaking = [];
    const waterfall = (c, label) => {
      const wrap = document.createElement("div"); wrap.className = "livecam";
      const lbl = document.createElement("span");
      lbl.textContent = label;
      const mm = (c.z1 - c.z0) / LIVE_W;
      const cv = document.createElement("canvas"); cv.width = LIVE_W; cv.height = Math.round(LIVE_MM / mm);
      const ctx = cv.getContext("2d"); ctx.fillStyle = "#0b0c0d"; ctx.fillRect(0, 0, cv.width, cv.height);
      const mark = document.createElement("i"); mark.className = "scanmark";
      wrap.append(lbl, cv, mark); liveEl.append(wrap);
      return { ctx: ctx, acc: 0, mm: mm };
    };
    cams.forEach((c) => live.push(waterfall(c, camLabel(c))));
    if (opts().lightSetup === "alternate") cams.forEach((c) => liveRaking.push(waterfall(c, camLabel(c) + " · raking light")));
    const c0 = cams[0];
    $("st-res").textContent = (opts().rect ? c0.mmPerPx.toFixed(2) : c0.nearMm.toFixed(2) + "–" + c0.farMm.toFixed(2)) + " mm · " + c0.PX + " px";
  }

  function restart() {
    if (applyingSettings) { restartWanted = true; return; }   // applySettings restarts once at the end
    const o = opts();
    PX = +$("sensor").value; specs = specsFor(presetKey);
    cams = specs.map((sp) => bottomCam(sp, PX, Object.assign({}, o, { anyZero: specs.some((s) => s.tilt === 0) })));
    pitch = Math.max(0.2, cams[0].mmPerPx);   // square pixels: one line per pixel width of travel
    sizeGL(PX);
    feed.forEach((p) => disposeMesh(p.mesh)); feed = []; sceneKey = "";
    sBelt = lastLine = -300; nextOff = 1600; scanned = 0; snapQueue.length = 0; snapJob = null; $("st-count").textContent = "0";
    tracks = []; pending.length = 0; lastDets = []; nextTopS = lastLine; trigErrs.length = 0; mergedN = 0; topJob = null;
    cardQueue.length = 0; resetClassifier();
    gallery.innerHTML = '<p class="empty">Each pallet\'s images appear here once it has passed the scanner.</p>';
    buildRig(); buildStationRig(); setupLive(); updateGapStat(); updateBudget(); spawn();
  }
  // A new light setup moves the bars, not the cameras: rebuild the rig and the live views, keep the feed.
  function relight() {
    if (applyingSettings) { restartWanted = true; return; }
    const o = opts();
    cams = specs.map((sp) => bottomCam(sp, PX, Object.assign({}, o, { anyZero: specs.some((s) => s.tilt === 0) })));
    sceneKey = ""; buildRig(); setupLive(); updateGapStat(); updateBudget();
  }

