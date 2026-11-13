  // ---------------- guided tour ----------------
  // A few steps through the station for people seeing it for the first time: the 3D view flies to each spot.
  // Camera positions and targets in metres.
  const TOUR = [
    { pos: [-3.4, 2.1, 3.8], at: [-0.8, 0.2, 0], text: "Pallets arrive on the infeed conveyor: 1000 an hour, nine types, some damaged and a few unusual (upside down, stacked, snowy)." },
    { pos: [0.3, 3.4, 1.6], at: [0, 0.1, 0], text: "The top camera watches 2.6 m of belt. A detector boxes each pallet and a tracker predicts where it is; that prediction triggers every other camera. Its live view is below this one." },
    { pos: [-1.0, -0.3, 1.5], at: [0, -0.08, 0], text: "At the gap between two rollers, two line-scan cameras look up at the underside, lit by one LED bar. Their images build up line by line on the right." },
    { pos: [2.6, 1.3, 2.6], at: [0, 0.35, 0], text: "Station cameras photograph the top, both sides, both ends and into a fork opening, lit by the lamps above." },
    { pos: [-2.2, 1.0, 2.6], at: [0.6, 0.2, 0], text: "Each pallet's images, its true condition and the stand-in classifier's label appear in the gallery further down the page." },
    { pos: [-2.6, 1.2, 3.1], at: [0.1, 0.25, 0], text: "Now change the gap, cameras, conveyor speed or service state above, and watch the images, the frame-rate graph and the Timing & data tab respond." }
  ];
  const TOUR_FLY_MS = 1600, TOUR_STEP_MS = 11000;   // flight time; auto-advance after this long on a step
  let tourStep = -1, tourFly = null, tourShown = 0;
  function showTourStep(i) {
    tourStep = Math.max(0, Math.min(TOUR.length - 1, i));
    const s = TOUR[tourStep];
    $("tour-text").textContent = s.text; $("tour-step").textContent = (tourStep + 1) + " / " + TOUR.length;
    $("tour-prev").disabled = tourStep === 0; $("tour-next").textContent = tourStep === TOUR.length - 1 ? "Finish" : "Next";
    tourFly = { from: cam3.position.clone(), fromAt: controls.target.clone(), to: new THREE.Vector3(...s.pos), toAt: new THREE.Vector3(...s.at), t0: performance.now() };
    tourShown = performance.now();
  }
  function endTour() { tourStep = -1; tourFly = null; $("tour").hidden = true; }
  // called every frame: fly the camera, auto-advance
  function stepTour(now) {
    if (tourStep < 0) return;
    if (tourFly) {
      const f = Math.min(1, (now - tourFly.t0) / (reduceMotion ? 1 : TOUR_FLY_MS)), e = f * f * (3 - 2 * f);
      cam3.position.lerpVectors(tourFly.from, tourFly.to, e); controls.target.lerpVectors(tourFly.fromAt, tourFly.toAt, e);
      if (f >= 1) tourFly = null;
    }
    if (now - tourShown > TOUR_STEP_MS && tourStep < TOUR.length - 1) showTourStep(tourStep + 1);
  }
  $("tour-start").addEventListener("click", () => { $("opt-follow").checked = false; $("opt-fans").checked = true; applyFans(); $("tour").hidden = false; showTourStep(0); });
  $("tour-prev").addEventListener("click", () => showTourStep(tourStep - 1));
  $("tour-next").addEventListener("click", () => (tourStep === TOUR.length - 1 ? endTour() : showTourStep(tourStep + 1)));
  $("tour-exit").addEventListener("click", endTour);
