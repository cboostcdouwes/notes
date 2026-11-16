  // ---------------- controls ----------------
  const typesEl = $("types");
  TYPES.forEach((t) => {
    const id = "type-" + t.id, l = document.createElement("label"); l.htmlFor = id;
    l.innerHTML = '<input type="checkbox" id="' + id + '" checked> ' + t.name;
    l.querySelector("input").addEventListener("change", (e) => { if (e.target.checked) enabled.add(t.id); else enabled.delete(t.id); updateGapStat(); updateBudget(); });
    typesEl.append(l);
  });
  const presetBtns = document.querySelectorAll("#presets button");
  function setPreset(key) {
    presetKey = key;
    presetBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cams === key)));
    if (key !== "dual") { $("tilt").value = key; $("tilt-out").textContent = (+key > 0 ? "+" : "") + key + "°"; }
    restart();
  }
  presetBtns.forEach((b) => b.addEventListener("click", () => setPreset(b.dataset.cams)));
  $("tilt").addEventListener("input", () => { const v = +$("tilt").value; $("tilt-out").textContent = (v > 0 ? "+" : "") + v + "°"; });
  $("tilt").addEventListener("change", () => setPreset(String(+$("tilt").value)));
  $("side").addEventListener("input", () => { $("side-out").textContent = "±" + $("side").value + " mm"; });
  $("side").addEventListener("change", () => { sideOffset = +$("side").value; if (presetKey === "dual") restart(); });
  $("gap").addEventListener("input", () => { $("gap-out").textContent = $("gap").value + " mm"; });
  $("gap").addEventListener("change", () => {
    gap = +$("gap").value; sceneKey = ""; buildBench(); updateGapStat(); updateBudget();
    rebuildUpcoming();
  });
  // pallets that have not reached the gap yet take the new conditions; the others keep their path
  function rebuildUpcoming() { feed.forEach((p, i) => { if (palletX(p, lastLine) < -(p.reach + 200)) p.motion = buildMotion(p, gap, p.touching ? feed[i - 1] : null); }); sceneKey = ""; }
  ["sensor", "fnum", "opt-fit", "opt-rect", "opt-light"].forEach((id) => $(id).addEventListener("change", restart));
  $("light-setup").addEventListener("change", relight);
  $("spot-beam").addEventListener("change", relight);
  $("opt-station").addEventListener("change", buildStationRig);
  $("opt-fans").addEventListener("change", applyFans);
  $("exp").addEventListener("input", () => { $("exp-out").textContent = Math.round(Math.pow(10, +$("exp").value)) + " µs"; updateBudget(); });
  $("light").addEventListener("input", () => { $("light-out").textContent = $("light").value + "%"; updateBudget(); });
  $("aexp").addEventListener("input", () => { $("aexp-out").textContent = Math.pow(10, +$("aexp").value).toFixed(1) + " ms"; updateBudget(); });
  $("opt-unusual").addEventListener("change", () => { unusualOn = $("opt-unusual").checked; });
  $("dirt").addEventListener("input", () => { $("dirt-out").textContent = Math.round($("dirt").value * 100) + "%"; });
  $("dust").addEventListener("input", () => { $("dust-out").textContent = $("dust").value + " mg/m³"; });
  $("louvre").addEventListener("change", updateBudget);
  $("driver").addEventListener("change", updateBudget);
  $("win-angle").addEventListener("input", () => { service.winAngle = +$("win-angle").value; $("win-angle-out").textContent = winAngleText(service.winAngle); updateBudget(); });
  $("win-angle").addEventListener("change", buildRig);
  $("win-purge").addEventListener("change", () => { service.purge = $("win-purge").checked; buildRig(); updateBudget(); });
  $("f-splinter").addEventListener("change", updateBudget);
  ["side-h", "side-x"].forEach((id) => {
    $(id).addEventListener("input", () => { $(id + "-out").textContent = $(id).value + " mm"; });
    $(id).addEventListener("change", () => { sideCam.height = +$("side-h").value; sideCam.along = +$("side-x").value; AREA_CAMS.splice(1, 2, ...sideCams()); buildStationRig(); sceneKey = ""; });
  });
  $("opt-station").addEventListener("change", () => { sceneKey = ""; });   // the traced world holds the station cameras
  $("vib").addEventListener("input", () => { $("vib-out").textContent = (+$("vib").value).toFixed(2) + " mm"; });
  const sectionText = (f) => (f > 1.001 ? "+" + Math.round((f - 1) * 100) + "% faster" : "same speed");
  $("section").addEventListener("input", () => { $("section-out").textContent = sectionText(+$("section").value); });
  $("section").addEventListener("change", () => { sectionFactor = +$("section").value; buildBench(); restart(); });   // new pallet paths: restart the feed
  $("belt").addEventListener("input", () => { beltSpeed = +$("belt").value * 1000; $("belt-out").textContent = $("belt").value + " m/s"; updateBudget(); });
  $("belt").addEventListener("change", () => { updateGapStat(); rebuildUpcoming(); });   // sticking depends on speed
  $("speed").addEventListener("input", () => { speed = Math.exp(+$("speed").value); $("speed-out").textContent = speed.toFixed(speed < 0.1 ? 3 : 2) + "×"; liveEl.classList.toggle("slow", speed < 0.2); });
  $("damage").addEventListener("input", () => { damageShare = +$("damage").value; $("damage-out").textContent = Math.round(damageShare * 100) + "%"; });
  $("scatter").addEventListener("input", () => { scatter = +$("scatter").value; $("scatter-out").textContent = "±" + Math.round(80 * scatter) + " mm, ±" + (5 * scatter).toFixed(1).replace(".0", "") + "°"; });
  $("months").addEventListener("input", () => { service.months = +$("months").value; $("months-out").textContent = service.months + (service.months === 1 ? " month" : " months"); updateBudget(); });
  $("f-bar").addEventListener("change", () => { service.barOut = $("f-bar").checked; updateBudget(); });
  $("f-lamp").addEventListener("change", () => { service.lampOut = $("f-lamp").checked; });
  $("f-enc").addEventListener("change", () => { service.encErr = $("f-enc").checked ? 0.08 : 0; });
  $("pause").addEventListener("click", () => { paused = !paused; $("pause").textContent = paused ? "Resume" : "Pause"; });

  // hover explanations
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), tipEl = $("tip");
  let hoverPending = null;
  renderer.domElement.addEventListener("pointermove", (e) => { hoverPending = e; });
  renderer.domElement.addEventListener("pointerleave", () => { tipEl.hidden = true; hoverPending = null; });
  function doHover() {
    if (!hoverPending) return; const e = hoverPending; hoverPending = null;
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, cam3);
    const targets = [rig, stationRig, fixed].concat(visMode ? [visGroup] : feed.map((p) => p.mesh));
    const hit = ray.intersectObjects(targets, true).find((h) => h.object.visible && h.object.userData.tip);
    if (!hit) { tipEl.hidden = true; return; }
    tipEl.textContent = hit.object.userData.tip; tipEl.hidden = false;
    tipEl.style.left = Math.max(4, Math.min(e.clientX - r.left + 14, r.width - 310)) + "px"; tipEl.style.top = Math.max(4, Math.min(e.clientY - r.top + 14, r.height - 90)) + "px";
  }

