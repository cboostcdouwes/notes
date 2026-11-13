  // ---------------- visibility map ----------------
  const visType = $("vis-type"), cmpType = $("cmp-type");
  TYPES.forEach((t) => [visType, cmpType].forEach((s) => { const o = document.createElement("option"); o.value = t.id; o.textContent = t.name; s.append(o); }));
  function analysisPallet(type, dmg) {
    const save = rs; rs = 4242;
    const p = makePallet(type, false, dmg || null);
    rs = save;
    p.uid = -(++uidN); p.zoff = 0; p.yaw = 0; p.reach = p.L / 2; p.slip = 0; p.ripple = 0; p.ripplePh = 0; p.off = 0;
    p.jostle = null; p.motion = staticMotion(0, 0, 0, 0);
    return p;
  }
  function idStats(p) {
    const st = new Map(), ncam = cams.length + (opts().station ? AREA_CAMS.length : 0);
    const get = (id) => { if (!st.has(id)) st.set(id, { px: 0, faces: new Set(), best: Infinity, perCam: new Array(ncam).fill(0) }); return st.get(id); };
    const buf = new Uint8Array(GW * MAXROWS * 4);
    uploadScene([p]);
    const sStart = -p.reach - 200, sEnd = p.reach + 200;
    const read = (w, h, k, fpOf) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, idFB); gl.readPixels(0, GH - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      for (let i = 0; i < w * h; i++) {
        const o = i * 4, id = buf[o] + (buf[o + 1] >> 3) * 256; if (!id) continue;
        const s = get(id - 1); s.px++; s.faces.add(buf[o + 1] & 7); s.perCam[k]++;
        const fp = fpOf(buf[o + 2] + buf[o + 3] * 256); if (fp < s.best) s.best = fp;
      }
    };
    cams.forEach((cam, k) => {
      for (let s0 = sStart; s0 < sEnd; s0 += MAXROWS * pitch) {
        const rows = Math.min(MAXROWS, Math.ceil((sEnd - s0) / pitch));
        traceLines(cam, s0, pitch, rows, { id: true });
        read(cam.PX, rows, k, (dist) => Math.max(dist * cam.dphi, pitch));
      }
    });
    if (opts().station) AREA_CAMS.forEach((c, ci) => { traceArea(c, 0, { id: true }); read(c.w, c.h, cams.length + ci, (dist) => dist / c.fx); });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    sceneKey = "";
    return st;
  }
  const FACE = ["rear", "front", "underside", "top", "left", "right"];
  const visColor = (s) => (!s ? "#d2452b" : s.px < 60 ? "#e0a640" : s.best <= 1 ? "#2f9a4d" : "#9bc53d");
  let visMode = false;
  function runVisibility() {
    markEvent("analysis");
    const type = TYPES.find((t) => t.id === visType.value);
    $("vis-status").textContent = "Tracing…";
    setTimeout(() => {
      const t0 = performance.now(), p = analysisPallet(type), stats = idStats(p), worldN = worldFor(gap, cams).parts.length;
      const names = cams.map((c) => "bottom " + (c.spec.tilt > 0 ? "+" : "") + c.spec.tilt + "°").concat(opts().station ? AREA_CAMS.map((c) => c.name) : []);
      $("vis-table").querySelector("thead").innerHTML = "<tr><th>Part</th>" + names.map((n) => "<th>" + n + "</th>").join("") + "<th>Best mm/px</th><th>Faces seen</th></tr>";
      let html = "", unseen = 0;
      p.parts.forEach((q, i) => {
        const s = stats.get(worldN + i); if (!s) unseen++;
        html += '<tr><td><i class="dot" style="background:' + visColor(s) + '"></i>' + q.name + "</td>" +
          names.map((n, k) => '<td class="num">' + (s && s.perCam[k] ? s.perCam[k].toLocaleString() : "–") + "</td>").join("") +
          '<td class="num">' + (s ? s.best.toFixed(2) : "–") + "</td><td>" + (s ? [...s.faces].map((f) => FACE[f]).join(", ") : "not seen") + "</td></tr>";
      });
      $("vis-table").querySelector("tbody").innerHTML = html;
      $("vis-status").textContent = (p.parts.length - unseen) + " of " + p.parts.length + " parts seen by at least one camera · traced in " + Math.round(performance.now() - t0) + " ms. The 3D view shows the pallet coloured by visibility; hover a part for its numbers.";
      while (visGroup.children.length) disposeVis(visGroup.children[0]);
      const g = palletMesh(p);
      g.children.forEach((m, i) => { const s = stats.get(worldN + i); m.material = M(visColor(s)); tip(m, p.parts[i].name + ": " + (s ? s.px.toLocaleString() + " px, best " + s.best.toFixed(2) + " mm/px, faces " + [...s.faces].map((f) => FACE[f]).join(", ") : "not seen by any selected camera")); });
      visGroup.add(g); setVisMode(true);
    }, 30);
  }
  function disposeVis(g) { g.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); visGroup.remove(g); }
  function setVisMode(on) { visMode = on; visGroup.visible = on; feed.forEach((p) => { p.mesh.visible = !on; }); }
  $("vis-run").addEventListener("click", runVisibility);

