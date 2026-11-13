  // ---------------- compare settings ----------------
  const SETTINGS = [
    ["Centred 0°", { key: "0" }], ["Centred +25°", { key: "25" }], ["Centred −25°", { key: "-25" }],
    ["Dual ±25°, sides ±400 mm", { key: "dual", side: 400 }], ["Dual ±25°, sides ±600 mm", { key: "dual", side: 600 }], ["Dual ±25°, both centred", { key: "dual", side: 0 }]
  ];
  [$("cmp-a"), $("cmp-b")].forEach((s) => SETTINGS.forEach(([n], i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; if (i === 3) o.selected = true; s.append(o); }));
  [$("cmp-ga"), $("cmp-gb")].forEach((s, j) => GAP_CHOICES.forEach((g) => { const o = document.createElement("option"); o.value = g; o.textContent = g + " mm"; if (g === (j ? 100 : 350)) o.selected = true; s.append(o); }));
  function fillDamages() { const t = TYPES.find((x) => x.id === cmpType.value); $("cmp-dmg").innerHTML = t.damages.map((d, i) => '<option value="' + i + '">' + d[0] + "</option>").join(""); }
  cmpType.addEventListener("change", fillDamages); fillDamages();
  const DIFF_LEVEL = 30;   // summed RGB difference (0-765) above which a pixel counts as changed
  function renderPass(p, cam, o, g, pit) {
    pit = pit || pitch;
    const rows = Math.ceil((2 * p.reach + 400) / pit), cv = document.createElement("canvas"); cv.width = cam.PX; cv.height = rows;
    const ctx = cv.getContext("2d");
    uploadScene([p], g);
    for (let r = 0; r < rows; r += MAXROWS) {
      const n = Math.min(MAXROWS, rows - r);
      traceLines(cam, -p.reach - 200 + r * pit, pit, n, Object.assign({ noise: 0, seed: 7, rowBase: r }, o));
      ctx.drawImage(glc, 0, 0, cam.PX, n, 0, r, cam.PX, n);
    }
    sceneKey = "";
    return cv;
  }
  function runCompare() {
    markEvent("analysis");
    const type = TYPES.find((t) => t.id === cmpType.value), dmg = type.damages[+$("cmp-dmg").value];
    $("cmp-status").textContent = "Tracing…";
    setTimeout(() => {
      const t0 = performance.now(), out = $("cmp-out"); out.innerHTML = "";
      const intact = analysisPallet(type), damaged = analysisPallet(type, dmg), o = opts();
      [[$("cmp-a"), $("cmp-ga")], [$("cmp-b"), $("cmp-gb")]].forEach(([sel, gsel]) => {
        const [name, st] = SETTINGS[+sel.value], g = +gsel.value;
        const sp = st.key === "dual" ? [{ tilt: 25, z: -st.side }, { tilt: -25, z: st.side }] : [{ tilt: Number(st.key), z: 0 }];
        const cs = sp.map((s) => bottomCam(s, PX, Object.assign({}, o, { anyZero: sp.some((x) => x.tilt === 0) })));
        const fig = document.createElement("figure"), cap = document.createElement("figcaption"), pair = document.createElement("div");
        cap.className = "cap"; pair.className = "pair"; let changed = 0;
        cs.forEach((cam) => {
          const ro = Object.assign({ fnum: o.fnum, dirt: o.dirt, rect: o.rect, lights: lightsFor(cs, "line") }, lineExposure(o));
          const a = renderPass(intact, cam, ro, g), b = renderPass(damaged, cam, ro, g);
          const A = a.getContext("2d").getImageData(0, 0, a.width, a.height).data, bctx = b.getContext("2d"), B = bctx.getImageData(0, 0, b.width, b.height).data;
          const D = bctx.createImageData(b.width, b.height);
          for (let i = 0; i < A.length; i += 4) {
            const df = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
            if (df > DIFF_LEVEL) { D.data[i] = 255; D.data[i + 1] = 40; D.data[i + 2] = 30; changed++; } else { D.data[i] = D.data[i + 1] = D.data[i + 2] = (B[i] + B[i + 1] + B[i + 2]) / 6; }
            D.data[i + 3] = 255;
          }
          const dcv = document.createElement("canvas"); dcv.width = b.width; dcv.height = b.height; dcv.getContext("2d").putImageData(D, 0, 0);
          [b, dcv].forEach((c) => { c.style.aspectRatio = (cam.PX * cam.mmPerPx).toFixed(0) + " / " + (c.height * pitch).toFixed(0); pair.append(c); });
        });
        const cm2 = changed * cs[0].mmPerPx * pitch / 100;
        const gr = gapReport(g, cs, o.fnum);
        cap.innerHTML = '<span class="cap-type">' + name + ", gap " + g + " mm</span><span>" + dmg[0] + ": " + changed.toLocaleString() + " px changed (~" + Math.round(cm2) + " cm² on the belt plane)</span><span class=\"cap-dim\">per camera: damaged image, then difference vs intact · light reaches " + (gr.lit >= 300 ? "the full height" : gr.lit + " mm up") + (gr.rays < 0 ? " · rollers cut the view" : "") + "</span>";
        fig.append(cap, pair); out.append(fig);
      });
      $("cmp-status").textContent = "Done in " + Math.round(performance.now() - t0) + " ms · noise off, same pallet, " + PX + " px.";
    }, 30);
  }
  $("cmp-run").addEventListener("click", runCompare);

