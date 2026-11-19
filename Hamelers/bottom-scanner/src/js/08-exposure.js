  // ---------------- exposure and sensor ----------------
  // Reference (k = 1): line-scan 100 µs at f/4 with the LED bar at 100%, area cameras 1 ms; mid-grey then fills half
  // the full well. Longer exposure or more light raises k (brighter surfaces clip); less lowers it (more gain, more noise).
  const SENSOR = { fullWell: 10000, readNoise: 12 };   // electrons per pixel, typical industrial CMOS (assumed)
  function lineExposure(o) {
    const tMax = pitch / scanSpeed() * 1e6 / linesPerImage(o), t = Math.min(o.expUs, tMax);   // a line can't integrate longer than its period
    return { t: t, tMax: tMax, k: t / 100 * (o.light / 100) * Math.pow(4 / (o.fnum || 4), 2), blur: scanSpeed() * t * 1e-6 };
  }
  const areaExposure = (o) => ({ t: o.aexpMs, k: o.aexpMs, blur: scanSpeed() * o.aexpMs / 1000 });
  // The line cameras' signal in image which (see lightsFor) relative to the reference: the exposure, with everything
  // that changes the light on the scan line (the setup's lights, LED ageing; for the main light, bar or spot, dust on
  // it and a failure leaving only stray light from the lamps; for the bar its louvre) and on the way back through the
  // camera's window.
  function lineSignalK(o, which) {
    const L = bottomLights(which), main = L.nBars > 0 || L.spots.length > 0;
    const mainLoss = main ? (L.nBars ? louvrePass(o.louvre) : 1) * (1 - service.barDust(besideCamera(o.lightSetup))) * (service.barOut ? 0.1 : 1) : 1;
    return lineExposure(o).k * setupLight(o, which) * mainLoss * service.lightFactor() * windowPass();
  }
  const significantBlur = (mm, mmPerPx) => ((mm || 0) >= 0.25 * mmPerPx ? mm : 0);   // below a quarter pixel: not worth the samples
  // gain: the camera's, never below 1; by default set for the reference light (an area camera's lamps)
  function sensorUniforms(P, o, gain) {
    gl.uniform1f(P.uK, o.k || 1); gl.uniform1f(P.uGain, gain || Math.max(1, 1 / (o.k || 1)));
    gl.uniform1f(P.uFullWell, SENSOR.fullWell); gl.uniform1f(P.uReadNoise, SENSOR.readNoise);
  }
  // A line camera's gain, set when it was installed for the design light of its setup on the scan line (image which,
  // cameras camList); dust and ageing since then darken its images. As the gain in the light budget (sensorAt).
  const lineGain = (o, which, camList) => Math.max(1, 1 / ((o.k || 1) * setupLight(opts(), which, camList)));

  // Photo mode (o.still): pass o.pass of a running average, blended into the float target.
  function beginStill(U, o) {
    gl.uniform1i(U.uStill, o.still ? 1 : 0); gl.uniform3fv(U.uSky, o.sky || [0, 0, 0]); gl.uniform3fv(U.uLightJit, o.lightJit || [0, 0, 0]);
    if (!o.still) return;
    gl.enable(gl.BLEND); gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA); gl.blendColor(0, 0, 0, 1 / (o.pass + 1));
  }
  const INDIRECT_SAMPLES = 4;   // bounce samples per pixel when the analysis views trace indirect light
  // Post-pass uniforms for the light (white balance, flicker) and the sensor: t0 and tRow time row 0 and each next row,
  // T the exposure (s); seed tells the cameras' pixel patterns apart.
  function conditionUniforms(P, L, t0, tRow, T, fpn, seed) {
    gl.uniform3fv(P.uWB, L.wb); gl.uniform3f(P.uFlick, L.driver.mode, L.driver.f, L.driver.p);
    gl.uniform1f(P.uT0, t0); gl.uniform1f(P.uTRow, tRow); gl.uniform1f(P.uExpS, T);
    gl.uniform1f(P.uFpn, fpn ? 1 : 0); gl.uniform1f(P.uCamSeed, seed % 997);
  }
  function traceLines(cam, s0, pitch, rows, o) {
    const U = progT.loc; gl.useProgram(progT.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, o.id ? idFB : nativeFB); gl.viewport(0, GH - rows, cam.PX, rows);
    sceneUniforms(U);
    gl.uniform1i(U.uMode, o.id ? 2 : 0); gl.uniform1i(U.uH, GH);
    gl.uniform1f(U.uExposure, 1.6); gl.uniform1f(U.uDirt, o.dirt || 0); gl.uniform1f(U.uSeed, o.seed || 1); gl.uniform3f(U.uBg, 0.025, 0.027, 0.03);
    gl.uniform3fv(U.uC, cam.C); gl.uniform3fv(U.uD0, cam.d0); gl.uniform3fv(U.uE, cam.e);
    gl.uniform1f(U.uPhi0, cam.phi0); gl.uniform1f(U.uDphi, cam.dphi); gl.uniform1f(U.uAxisPhi, cam.axisPhi);
    gl.uniform1f(U.uS0, s0); gl.uniform1f(U.uPitch, pitch); gl.uniform2f(U.uSize, cam.PX, rows);
    const L = o.lights || lightsFor(lineCams(), "line"), c = opts();
    setLights(U, L, o.still || o.indirect ? 0.008 : 0.035);   // indirect light replaces the constant fill
    gl.uniform1f(U.uVib, o.id ? 0 : c.vib); gl.uniform1f(U.uSpeed, scanSpeed()); gl.uniform1f(U.uDistort, c.uncal ? LENS_DISTORTION : 0); gl.uniform1f(U.uRollMM, 0);
    const fnum = o.id ? 0 : o.fnum;
    gl.uniform3fv(U.uAxis, cam.axis); gl.uniform1f(U.uFocus, cam.focus); gl.uniform1f(U.uAperture, fnum > 0 ? cam.focal / fnum : 0); gl.uniform1i(U.uDof, fnum > 0 ? LENS_SAMPLES : 0);
    gl.uniform1f(U.uPixAng, cam.dphi); gl.uniform1f(U.uBlur, significantBlur(o.blur, pitch));
    const win = windowFor(cam);
    gl.uniform3fv(U.uWinN, win.n); gl.uniform3fv(U.uWinO, win.o);
    beginStill(U, o);
    gl.uniform1i(U.uIndirect, o.indirect && !o.still && !o.id ? INDIRECT_SAMPLES : 0);
    if (o.indirect && !o.still) gl.uniform3fv(U.uSky, HALL_SKY.map((v) => v * L.hall * (1 + L.day)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);
    if (o.id || o.noPost) return;
    const P = progP.loc; gl.useProgram(progP.p);
    const out = o.outRow || 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, GH - rows - out, cam.PX, rows); gl.uniform1i(P.uOutRow, out);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, nativeTex); gl.uniform1i(P.uNative, 1);
    gl.uniform1i(P.uMode, 0); gl.uniform1i(P.uRect, o.rect ? 1 : 0); gl.uniform1i(P.uPX, cam.PX); gl.uniform1i(P.uH, GH);
    gl.uniform3fv(P.uC, cam.C); gl.uniform3fv(P.uD0, cam.d0); gl.uniform3fv(P.uE, cam.e);
    gl.uniform1f(P.uPhi0, cam.phi0); gl.uniform1f(P.uDphi, cam.dphi); gl.uniform1f(P.uZ0, cam.z0); gl.uniform1f(P.uZ1, cam.z1); gl.uniform1f(P.uPlaneY, cam.planeY);
    gl.uniform1f(P.uNoise, o.noise); gl.uniform1f(P.uSeed, o.seed || 1); gl.uniform1f(P.uRowBase, o.rowBase || 0); gl.uniform1i(P.uTone, 0); sensorUniforms(P, o, lineGain(o, o.which, o.cams));
    conditionUniforms(P, L, s0 / scanSpeed(), pitch / scanSpeed(), (o.t || 100) * 1e-6, c.uncal, cam.spec.tilt * 7 + cam.spec.z + (cam.top ? 500 : 0));   // a top camera: its own sensor
    const db = debrisFor(cam);
    gl.uniform4fv(P.uDebris, db.data); gl.uniform1i(P.uNDebris, db.n);
    gl.uniform3fv(P.uWinN, win.n); gl.uniform3fv(P.uWinO, win.o); gl.uniform3fv(P.uWinA, win.a);
    gl.uniform1f(P.uApR, apertureR(cam, o.fnum)); gl.uniform1f(P.uFog, c.fog ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function traceArea(cam, s, o) {
    const r0 = o.rowStart || 0, rn = o.rows || cam.h;   // rows r0 .. r0 + rn - 1, counted from the top
    gl.enable(gl.SCISSOR_TEST); gl.scissor(0, GH - r0 - rn, cam.w, rn);
    const U = progT.loc; gl.useProgram(progT.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, o.id ? idFB : nativeFB); gl.viewport(0, GH - cam.h, cam.w, cam.h);
    sceneUniforms(U);
    gl.uniform1i(U.uMode, o.id ? 3 : 1); gl.uniform1i(U.uH, GH);
    gl.uniform1f(U.uExposure, o.exposure || 1.6); gl.uniform1f(U.uDirt, 0); gl.uniform1f(U.uSeed, o.seed || 1); gl.uniform3f(U.uBg, 0.1, 0.105, 0.11);
    gl.uniform3fv(U.uC, cam.C); gl.uniform3fv(U.uF, cam.F); gl.uniform3fv(U.uR, cam.R); gl.uniform3fv(U.uU, cam.U);
    gl.uniform2f(U.uFoc, cam.fx, cam.fx); gl.uniform2f(U.uSize, cam.w, cam.h); gl.uniform1f(U.uSnapS, s);
    const L = o.lights || lightsFor(lineCams(), "area"), c = opts(), flaws = c.uncal && !cam.photo, rollS = c.rolling && !cam.photo ? ROLLING_S : 0;
    setLights(U, L, o.still ? 0.015 : 0.07);
    gl.uniform1f(U.uVib, 0); gl.uniform1f(U.uSpeed, scanSpeed()); gl.uniform1f(U.uDistort, flaws ? LENS_DISTORTION : 0); gl.uniform1f(U.uRollMM, rollS * scanSpeed());
    const dof = !o.id && o.fnum > 0;
    gl.uniform3fv(U.uAxis, cam.F); gl.uniform1f(U.uFocus, cam.focus); gl.uniform1f(U.uAperture, dof ? cam.aperture : 0); gl.uniform1i(U.uDof, dof ? LENS_SAMPLES : 0);
    gl.uniform1f(U.uPixAng, 1 / cam.fx); gl.uniform1f(U.uBlur, significantBlur(o.blur, cam.focus / cam.fx));
    beginStill(U, o);
    gl.uniform1i(U.uIndirect, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    if (o.id || o.noPost) return;
    const glare = opts().glare, whole = glare && r0 + rn >= cam.h, g = glare ? glareTarget(cam.w, cam.h) : null;
    if (glare) {   // keep the traced rows; with the last of them, post-process the whole image
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, nativeFB); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, g.fb);
      gl.blitFramebuffer(0, GH - r0 - rn, cam.w, GH - r0, 0, cam.h - r0 - rn, cam.w, cam.h - r0, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      if (whole) { gl.bindTexture(gl.TEXTURE_2D, g.tex); gl.generateMipmap(gl.TEXTURE_2D); }
    }
    gl.enable(gl.SCISSOR_TEST);
    const P = progP.loc; gl.useProgram(progP.p);
    const out = o.outRow || 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, GH - cam.h - out, cam.w, cam.h);
    if (whole) gl.scissor(0, GH - cam.h - out, cam.w, cam.h); else gl.scissor(0, GH - r0 - rn - out, cam.w, rn);
    gl.uniform1i(P.uOutRow, out);
    gl.uniform1f(P.uVeil, whole ? GLARE.veil : 0); gl.uniform1f(P.uGhost, GLARE.ghost);
    if (whole) {
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, g.tex); gl.uniform1i(P.uHdr, 5);
      gl.uniform1i(P.uHdrOff, GH - cam.h); gl.uniform2f(P.uHdrSize, cam.w, cam.h); gl.uniform1i(P.uLevels, g.levels);
    }
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, nativeTex); gl.uniform1i(P.uNative, 1);
    gl.uniform1i(P.uMode, 1); gl.uniform1i(P.uH, GH); gl.uniform1f(P.uNoise, o.noise); gl.uniform1f(P.uSeed, o.seed || 1); gl.uniform1f(P.uRowBase, 0); gl.uniform1i(P.uTone, o.tone ? 1 : 0); sensorUniforms(P, o);
    conditionUniforms(P, L, s / scanSpeed() - rollS / 2, rollS / cam.h, (o.t || 1) * 1e-3, flaws, cam.C[0] + cam.C[2]);
    gl.uniform1i(P.uNDebris, 0); gl.uniform1f(P.uFog, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.SCISSOR_TEST);
  }

