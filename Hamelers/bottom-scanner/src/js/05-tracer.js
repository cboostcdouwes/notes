  // ---------------- WebGL2 tracer ----------------
  const glc = document.createElement("canvas");
  // powerPreference asks laptops with two GPUs for the fast one (honoured on Windows and macOS)
  const gl = glc.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) { $("view").innerHTML = '<p class="err">This page needs WebGL2, which this browser does not offer.</p>'; return; }
  const floatOK = !!gl.getExtension("EXT_color_buffer_float");
  // Phones and small tablets: half-size textures, fewer full-resolution captures and gallery cards kept in memory
  // (Safari in particular limits total canvas memory).
  const lowMem = (navigator.deviceMemory || 8) <= 4 || /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
  const TEX_SIZE = lowMem ? 1024 : 2048, KEEP_FULLRES = lowMem ? 1 : 4, KEEP_CARDS = lowMem ? 6 : 14;
  // Without a GPU (software WebGL) the live view takes one lens sample per pixel instead of four.
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const gpuString = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  const softGL = /swiftshader|llvmpipe|software/i.test(gpuString);
  // Chrome reports "ANGLE (vendor, device details, backend)"; keep the device name. Examples:
  // "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)" -> "NVIDIA GeForce RTX 3060"
  // "ANGLE (NVIDIA, Vulkan 1.4.351 (NVIDIA NVIDIA GeForce RTX 2070 (0x00001ED1)), NVIDIA)" -> "NVIDIA GeForce RTX 2070"
  // "ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)" -> "Apple M1"
  const gpuName = (() => {
    const m = /^ANGLE \((.*)\)$/.exec(gpuString);
    if (!m) return gpuString;
    let r = m[1].replace(/^[^,]*,\s*/, "").replace(/,[^,]*$/, "");   // drop the vendor and backend fields
    const vk = /^Vulkan [\d.]+ \((.*)\)$/.exec(r);
    if (vk) r = vk[1];
    return r.replace(/^ANGLE Metal Renderer:\s*/, "").replace(/\s*\(0x[0-9a-f]+\)/i, "").replace(/\s+Direct3D.*$/, "").replace(/^(\S+) \1 /, "$1 ").trim();
  })();
  $("gpu-name").textContent = softGL ? "GPU: none, software rendering (" + gpuName + ")" : "GPU: " + gpuName;
  $("gpu-name").title = gpuString;
  const LENS_SAMPLES = softGL ? 1 : 4;
  function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function program(fsId) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, $("vs").textContent.trim())); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, $(fsId).textContent.trim()));
    gl.bindAttribLocation(p, 0, "aPos"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const loc = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); loc[u.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, u.name); }
    return { p: p, loc: new Proxy(loc, { get: (t, k) => (k in t ? t[k] : null) }) };
  }
  let progT, progP;
  try { progT = program("fs-trace"); progP = program("fs-post"); }
  catch (e) { $("view").innerHTML = '<p class="err">The GPU tracer failed to compile: ' + String(e.message).slice(0, 400) + "</p>"; console.error(e); return; }
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const partTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, partTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEXW, TEXH, 0, gl.RGBA, gl.FLOAT, null);
  const partData = new Float32Array(TEXW * TEXH * 4);
  const motionTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, motionTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MOTION_N * 2, MAXPAL + 1, 0, gl.RGBA, gl.FLOAT, null);
  const motionData = new Float32Array(MOTION_N * 8 * (MAXPAL + 1));
  // Photo textures (CC0, Poly Haven): layer 0 sawn softwood, 1 presswood chips, 2 hardwood. Until they load, or if they
  // can't, the shader falls back to procedural grain.
  const TEX_LAYERS = ["spruce", "press", "hard"];
  function texArray(size, internal) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, Math.log2(size) + 1, internal, size, size, TEX_LAYERS.length);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return t;
  }
  const albArr = texArray(TEX_SIZE, gl.SRGB8_ALPHA8), norArr = texArray(TEX_SIZE / 2, gl.RGBA8);
  let texReady = false;
  const loadImg = (src) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fail(new Error("could not decode an embedded texture")); i.src = src; });
  // The textures are embedded at the end of the page, so wait until it has been parsed.
  const whenParsed = new Promise((ok) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ok) : ok()));
  const fitTo = (im, size) => { if (im.width === size) return im; const c = document.createElement("canvas"); c.width = c.height = size; c.getContext("2d").drawImage(im, 0, 0, size, size); return c; };
  // texImages: per layer, [albedo, normal map] at the sizes this device uses
  const parseTextures = () => {
    try { return JSON.parse($("textures").textContent); }
    catch (e) { throw new Error("the embedded textures are damaged, so this copy of the file is probably incomplete or altered; copy it again (" + e.message + ")"); }
  };
  const texImages = whenParsed.then(parseTextures)
    .then((d) => Promise.all(TEX_LAYERS.flatMap((k) => [loadImg(d[k]), loadImg(d[k + "_n"])])))
    .then((imgs) => TEX_LAYERS.map((k, i) => [fitTo(imgs[i * 2], TEX_SIZE), fitTo(imgs[i * 2 + 1], TEX_SIZE / 2)]));
  texImages.then((layers) => {
    [albArr, norArr].forEach((t, j) => {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
      layers.forEach((pair, i) => { const im = pair[j]; gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, im.width, im.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, im); });
      gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    });
    texReady = true;
  }).catch((e) => {
    console.error(e);
    const msg = "Photo textures did not load (" + e.message + "); wood uses drawn grain and plain colours.";
    $("tex-note").textContent = msg; $("tex-warn").textContent = msg; $("tex-warn").hidden = false;
  });
  let GW = 0, GH = 0, nativeTex = null, nativeFB = null, idTex = null, idFB = null;
  function makeTarget(internal, type) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, GW, GH, 0, gl.RGBA, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return [t, f];
  }
  function sizeGL(px) {
    GW = Math.max(px, PHOTO_W); GH = Math.max(OUT_SNAP() + Math.max(...AREA_CAMS.map((c) => c.h)), PHOTO_H); glc.width = GW; glc.height = GH;
    stage.width = GW; stage.height = GH;
    [nativeTex, idTex].forEach((t) => t && gl.deleteTexture(t)); [nativeFB, idFB].forEach((f) => f && gl.deleteFramebuffer(f));
    [nativeTex, nativeFB] = makeTarget(floatOK ? gl.RGBA16F : gl.RGBA8, floatOK ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE);
    [idTex, idFB] = makeTarget(gl.RGBA8, gl.UNSIGNED_BYTE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // Lens glare needs an area image whole and mipmapped: traceArea copies its traced rows from the native target into
  // the glare target for its size, and post-processes the whole image from there once the last rows are in.
  const glareTargets = new Map();
  function glareTarget(w, h) {
    const key = w + "x" + h;
    if (glareTargets.has(key)) return glareTargets.get(key);
    const levels = Math.floor(Math.log2(Math.max(w, h))) + 1, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texStorage2D(gl.TEXTURE_2D, levels, floatOK ? gl.RGBA16F : gl.RGBA8, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const g = { tex: t, fb: f, levels: levels };
    glareTargets.set(key, g);
    return g;
  }
  // Reading the WebGL canvas back is slow in some browsers (about 2 ms per copy in Firefox), so each frame's renders
  // go to separate rows of it and are read back once, by queueCopy/flushCopies. Rows: bottom camera k at k × MAXROWS,
  // then the top camera's strip, then a station snapshot strip.
  const OUT_TOP = 2 * MAXROWS, OUT_SNAP = () => OUT_TOP + TOP_LIVE.h;
  const stage = document.createElement("canvas"), stageCtx = stage.getContext("2d");
  const strip = document.createElement("canvas"), stripCtx = strip.getContext("2d");   // see flushCopies
  const copyQueue = [], afterCopy = [];
  // dst: a function returning the 2D context, resolved at flush time (a capture canvas may be replaced meanwhile)
  const queueCopy = (sx, sy, sw, sh, dst, dx, dy, dw, dh) => copyQueue.push([sx, sy, sw, sh, dst, dx, dy, dw, dh]);
  function flushCopies() {
    if (copyQueue.length) {
      const rows = Math.max(...copyQueue.map((c) => c[1] + c[3]));
      stageCtx.clearRect(0, 0, GW, rows); stageCtx.drawImage(glc, 0, 0, GW, rows, 0, 0, GW, rows);   // the one read-back
      copyQueue.forEach(([sx, sy, sw, sh, dst, dx, dy, dw, dh]) => {
        const ctx = dst();
        if (!ctx) return;
        if (sw === dw && sh === dh) { ctx.drawImage(stage, sx, sy, sw, sh, dx, dy, dw, dh); return; }
        // Scaling straight from the stage would blend in the rows just outside the strip (other renders' leftovers)
        // and draw a line per frame; scale from an exact copy of the strip instead.
        if (strip.width < sw || strip.height !== sh) { strip.width = Math.max(strip.width, sw); strip.height = sh; }
        stripCtx.drawImage(stage, sx, sy, sw, sh, 0, 0, sw, sh);
        ctx.drawImage(strip, 0, 0, sw, sh, dx, dy, dw, dh);
      });
      copyQueue.length = 0;
    }
    afterCopy.splice(0).forEach((f) => f());
  }

  // scene upload: world slot + up to MAXPAL pallets
  function writePart(row, q) {
    const o = row * TEXW * 4, D = partData;
    const set = (j, a, b, c, d) => { D[o + j * 4] = a; D[o + j * 4 + 1] = b; D[o + j * 4 + 2] = c; D[o + j * 4 + 3] = d; };
    for (let i = 0; i < TEXW * 4; i++) D[o + i] = 0;
    set(0, q.lo[0], q.lo[1], q.lo[2], MAT[q.mat]); set(1, q.hi[0], q.hi[1], q.hi[2], q.axis);
    set(2, q.col[0], q.col[1], q.col[2], q.seed); set(3, q.crack, q.flags, q.wet, q.mud);
    set(4, q.knots[0], q.knots[1], q.knots[2], q.knots[3]); set(5, q.stain[0], q.stain[1], q.stain[2], q.silver);
    if (q.nails) set(6, q.nails[0], q.nails[1], q.nails[2], q.nails[3]); else set(6, 1e9, 1e9, 1e9, 0);
    set(7, q.mark[0], q.mark[1], q.mark[2], q.mark[3]);
    if (q.sub) { set(8, q.sub[0][0], q.sub[0][1], q.sub[0][2], 1); set(9, q.sub[1][0], q.sub[1][1], q.sub[1][2], 0); }
    q.planes.slice(0, 4).forEach((pl, j) => set(10 + j, pl[0], pl[1], pl[2], pl[3]));
    const s = q.soil || { kind: 0, x: 0, z: 0, r: 0 };
    set(14, q.nailPat ? q.nailPat[0] : 45, q.nailPat ? q.nailPat[1] : 3, s.x, s.z);
    set(15, q.snow || 0, q.ice || 0, s.kind, s.r);
  }
  let sceneKey = "", sceneSlots = [], sceneGap = gap;   // slots: [{pal (null = world), start, count}]
  function uploadScene(pals, g) {
    g = g || gap;
    const key = g + ":" + rigKey(cams) + ":" + pals.map((p) => p.uid).join(",");
    if (key === sceneKey) return;
    sceneKey = key; sceneSlots = []; sceneGap = g; let row = 0;
    const add = (pal, parts) => { const st = row; parts.forEach((q) => { if (row < TEXH) writePart(row++, q); }); sceneSlots.push({ pal: pal, start: st, count: row - st }); };
    add(null, worldFor(g, cams).parts);
    pals.forEach((p) => add(p, p.parts));
    motionData.fill(0);
    sceneSlots.forEach((e, i) => {
      if (!e.pal) return;
      const m = e.pal.motion, o = i * MOTION_N * 8;
      for (let k = 0; k < MOTION_N; k++) motionData.set([m.dx[k], m.z[k], m.yaw[k], m.dy[k], m.pitch[k], 0, 0, 0], o + k * 8);
    });
    gl.bindTexture(gl.TEXTURE_2D, motionTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MOTION_N * 2, MAXPAL + 1, gl.RGBA, gl.FLOAT, motionData);
    gl.bindTexture(gl.TEXTURE_2D, partTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TEXW, row || 1, gl.RGBA, gl.FLOAT, partData.subarray(0, TEXW * 4 * (row || 1)));
  }
  const palA = new Float32Array(24), palB = new Float32Array(24), bbLo = new Float32Array(24), bbHi = new Float32Array(24);
  const rollArr = new Float32Array(40);
  const MAX_LAMPS = 12, lampLo = new Float32Array(MAX_LAMPS * 4), lampHi = new Float32Array(MAX_LAMPS * 4);
  // The lamp faces, for mirror reflections: box, base radiance (lo.w) and whether it is the LED bar (hi.w).
  function lampUniforms(U) {
    const lamps = worldFor(sceneGap, cams).parts.filter((q) => q.mat === "lamp");
    if (lamps.length > MAX_LAMPS) throw new Error(lamps.length + " lamps; the tracer takes " + MAX_LAMPS + ". Raise MAX_LAMPS and uLampLo/uLampHi[] together.");
    lamps.forEach((q, i) => { lampLo.set([q.lo[0], q.lo[1], q.lo[2], q.col[0]], i * 4); lampHi.set([q.hi[0], q.hi[1], q.hi[2], q.axis === 2 ? 1 : 0], i * 4); });
    gl.uniform4fv(U.uLampLo, lampLo); gl.uniform4fv(U.uLampHi, lampHi); gl.uniform1i(U.uNLamp, lamps.length);
  }
  function sceneUniforms(U) {
    sceneSlots.forEach((e, i) => {
      const p = e.pal;
      palA.set([p ? p.off : 0, 0, 0, e.start], i * 4);
      palB.set([e.count, p ? 1 : 0, 0, 0], i * 4);
      const b = p ? p.bb : worldFor(sceneGap, cams).bb; bbLo.set([b[0], b[1], b[2], 0], i * 4); bbHi.set([b[3], b[4], b[5], 0], i * 4);
    });
    gl.uniform1i(U.uNPal, sceneSlots.length);
    gl.uniform4fv(U.uPalA, palA); gl.uniform4fv(U.uPalB, palB); gl.uniform4fv(U.uBbLo, bbLo); gl.uniform4fv(U.uBbHi, bbHi);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, motionTex); gl.uniform1i(U.uMotion, 4);
    gl.uniform1f(U.uMotionU0, MOTION_U0); gl.uniform1f(U.uMotionDU, MOTION_DU); gl.uniform1i(U.uMotionN, MOTION_N);
    const rollers = rollerCentres(sceneGap, 14); rollArr.set(rollers);
    gl.uniform1fv(U.uRollX, rollArr); gl.uniform1i(U.uNRoll, rollers.length); gl.uniform1f(U.uRollHalf, ROLL_HALF);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, partTex); gl.uniform1i(U.uParts, 0);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D_ARRAY, albArr); gl.uniform1i(U.uAlb, 2);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D_ARRAY, norArr); gl.uniform1i(U.uNor, 3);
    gl.uniform1i(U.uTex, texReady ? 1 : 0); gl.uniform1f(U.uTexSize, TEX_SIZE);
    lampUniforms(U);
  }
  const MAX_LIGHTS = 24, HALL = [0.1, 0.1, 0.11];   // HALL: brightness of the hall above, as seen through gaps
  // L: from lightsFor
  function setLights(U, L, ambient) {
    const lights = L.lights;
    if (lights.length > MAX_LIGHTS) throw new Error(lights.length + " lights; the tracer takes " + MAX_LIGHTS + ". Raise MAX_LIGHTS and uLights[] together.");
    const a = new Float32Array(MAX_LIGHTS * 4); lights.forEach((l, i) => a.set(l, i * 4));
    gl.uniform4fv(U.uLights, a); gl.uniform1i(U.uNL, lights.length); gl.uniform1i(U.uNBar, L.nBars); gl.uniform1f(U.uAmbient, ambient * (1 + 0.6 * L.day));
    gl.uniform3fv(U.uBgUp, HALL.map((v) => v * L.hall * (1 + L.day))); gl.uniform2f(U.uFace, L.barFace, L.lampFace);
    gl.uniform3fv(U.uBarCol, L.barCol); gl.uniform3fv(U.uLampCol, L.lampCol);
    gl.uniform1f(U.uLouvreTan, L.louvreTan); gl.uniform1f(U.uBarHalf, BAR_SEGMENT_HALF); gl.uniform1f(U.uDust, L.dust);
  }
  // An LED bar along z, sampled as points; w puts ~0.75 of the reference irradiance at the reference distance.
  // Each point stands for BAR_SEGMENT_HALF of the bar to either side (the points are 300 mm apart in bottomCam).
  const BAR_SEGMENT_HALF = 150;
  const bar = (x, y, z0, z1, n, ref) => { const out = []; for (let i = 0; i < n; i++) { const z = n === 1 ? (z0 + z1) / 2 : z0 + (z1 - z0) * i / (n - 1); out.push([x, y, z, 0.75 * 2.42 / n * ref * ref]); } return out; };

