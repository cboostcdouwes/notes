  // ---------------- the assumptions list ----------------
  // Every value the simulation assumes, read from the constants the code uses (and, for the tracer's own, from the
  // shader source), so the list cannot disagree with the model. Basis: "assumed" (a guess, not measured), "typical"
  // (a usual value for such equipment, not this one's), "physics", "given" (from the brief), "standard" (a pallet
  // standard), "estimate" (derived from other assumptions).
  const shaderText = () => $("fs-trace").textContent + $("fs-post").textContent;
  function shaderFloat(name) {
    const m = new RegExp("\\b" + name + " = (-?[\\d.]+(?:e-?\\d+)?)").exec(shaderText());
    if (!m) throw new Error("the shader has no constant " + name + "; update the assumptions list");
    return +m[1];
  }
  function shaderVec3(name) {
    const m = new RegExp("\\b" + name + " = vec3\\(([^)]*)\\)").exec(shaderText());
    if (!m) throw new Error("the shader has no vec3 constant " + name + "; update the assumptions list");
    return m[1].split(",").map(Number);
  }
  const pct = (v, d) => (v * 100).toFixed(d || 0) + "%";
  const range = (lo, hi, unit) => lo.toFixed(1) + "–" + hi.toFixed(1) + " " + unit;
  const ASSUMPTIONS = [
    ["Conveyor and feed", [
      ["Peak rate", () => TARGET_PER_H + " pallets/h", "given", "belt speed needed, Timing & data"],
      ["Space between pallets in the feed", () => SPACING + " mm", "assumed", "capacity, belt speed needed"],
      ["Belt width; rollers", () => BELT_W + " mm; Ø" + 2 * ROLL_R + " mm at " + ROLL_PITCH + " mm pitch", "assumed", "gap geometry, light through the gap, sticking"],
      ["Pallets arriving touching the one ahead", () => pct(FEED.touching) + ", of which " + pct(FEED.mergeProne) + " look like one object to the detector", "assumed", "merged boxes, hidden pallets"],
      ["Faster middle section extent", () => "±" + SECTION_HALF / 1000 + " m around the scan line", "assumed", "how touching pallets separate"],
      ["Slip as a pallet changes speed", () => "relaxes over " + SLIP_MM + " mm of travel", "assumed", "separation, tracking"],
      ["Hesitations (roller friction)", () => "one per " + HESITATION_MM / 1000 + " m of travel on average", "assumed", "tracking error"]]],
    ["Pallets crossing the gap", [
      ["Edge droop scale over the gap", () => [40, 100, 350].map((g) => gapDroop(g).toFixed(2) + " at " + g + " mm").join(", "), "assumed", "sticking at the gap"],
      ["Warp of the bottom edges", () => "wood " + range(warpOf("eur", 0), warpOf("eur", 1), "mm") + ", plastic " + range(warpOf("plastic3", 0), warpOf("plastic3", 1), "mm") + ", moulded " + range(warpOf("moulded", 0), warpOf("moulded", 1), "mm"), "assumed", "sticking at the gap"],
      ["Droop the far roller still lifts over", () => CATCH_MM + " mm", "assumed", "how often pallets catch"],
      ["Stall length", () => STALL.mmPerMm + " mm of travel per mm of droop over that, at " + STALL.refSpeed / 1000 + " m/s; longer when faster", "assumed", "sticking, image stretch, capacity"],
      ["Nose bounce after landing", () => BOUNCE_HZ + " Hz, decaying over ~3 cycles", "assumed", "bottom image geometry"]]],
    ["Bottom line-scan cameras", [
      ["Working distance", () => WD + " mm", "assumed", "field of view, resolution"],
      ["Pixel pitch", () => PIXEL_UM + " µm", "typical", "lens focal length, aperture, debris on the window"],
      ["Sensor full well; read noise", () => SENSOR.fullWell + " e⁻; " + SENSOR.readNoise + " e⁻", "typical", "signal-to-noise"],
      ["Reference exposure", () => "100 µs at f/4 with the LED bar at 100% fills mid-grey to half the full well", "assumed", "every brightness and noise result"],
      ["LED bar", () => "1 m long, sampled as 4 points; under the gap " + BAR_REF_MM + " mm below the belt, or beside each camera " + BESIDE_MM + " mm from its lens (the same bar, so less light)", "assumed", "light through the gap, glare, louvre"],
      ["LED spots", () => "beside each camera (where the bar beside would be), behind their own window, one bar's LED power per camera in their beams, faces " + 2 * SPOT.faceR + " mm across; a line lens (±" + SPOT_BEAMS.line.across + "° across, the belt's width along, +" + SPOT.marginDeg + "°) or rows of " + SPOT_BEAMS.oval.name + " or " + SPOT_BEAMS.round.name + " overlapping by " + pct(SPOT.overlap), "assumed", "light on the scan line, glints, glare"],
      ["Side lights", () => "one per belt side, " + (-SIDE_LIGHT.y) + " mm below the belt and " + SIDE_LIGHT.z + " mm from its centre, aimed along the gap at the belt centre, each as bright as the whole bar; no dust on them", "assumed", "raking-light image"],
      ["LED bar against the station lamps", () => BAR_VS_LAMPS + "× as bright (100 µs line exposure vs 1 ms area exposure, similar lenses)", "estimate", "glare in the station cameras, lamps in the bottom images"],
      ["Window in front of the lens", () => WINDOW_MM + " mm along the lens axis, outer face turned the way the camera looks", "assumed", "how debris on it shows, window size"],
      ["Window glass", () => "plain, uncoated, " + GLASS.thickMm + " mm, index " + GLASS.n + " (BK7-like); housing behind it matt black, so the window reflects nothing into the lens", "assumed", "light lost at steep windows, shift of the view"],
      ["Glass dispersion", () => "index " + GLASS.nRB[0] + " for red, " + GLASS.nRB[1] + " for blue; the colour fringe is estimated, not traced", "typical", "colour fringe"],
      ["Purge air", () => PURGE_AIR.coolK + " K colder than the hall in a " + PURGE_AIR.layerMm + " mm layer crossed over " + PURGE_AIR.pathMm + " mm; air index " + AIR_DN_DT + " per K; the bending is estimated, not traced", "assumed", "shimmer with an air purge"],
      ["Louvre film leak beyond its cut-off", () => pct(shaderFloat("LOUVRE_LEAK"), 1), "typical", "glare with a louvre"]]],
    ["Station and top cameras", [
      ["Top camera", () => AREA_REAL.topMP + " MP, " + AREA_REAL.topPx + " px over " + AREA_REAL.topField / 1000 + " m, " + TOP_FPS + " fps", "assumed", "tracking, data rate"],
      ["Station cameras", () => AREA_REAL.stationMP + " MP, " + AREA_REAL.stationMmPx + " mm/px", "assumed", "motion blur, data per pallet"],
      ["Detector", () => DETECT_S * 1000 + " ms latency; misses " + pct(DETECTOR.miss) + " of frames; box edges ±" + pct(DETECTOR.jitter, 1) + "; needs " + pct(DETECTOR.minVisible) + " of a pallet in view", "assumed", "tracking, trigger accuracy"],
      ["Pallet height assumed by the tracker", () => H_ASSUMED + " mm (real types 120–156 mm)", "assumed", "trigger accuracy"],
      ["Rolling-shutter readout", () => ROLLING_S * 1000 + " ms", "typical", "skew with a rolling shutter"]]],
    ["Lens and light effects", [
      ["Lens veiling glare; ghost", () => pct(GLARE.veil) + " of the light spread over the frame; " + pct(GLARE.ghost, 1) + " in one ghost", "typical", "glare from the LED bar and lamps"],
      ["Head-on reflectance", () => "zinc and steel " + pct(shaderFloat("METAL_F0")) + ", water, ice and plastic " + pct(shaderFloat("DIELECTRIC_F0")), "physics", "glints on rollers and wet wood"],
      ["Light drivers", () => "PWM " + DRIVERS.pwm.f + " Hz at " + pct(DRIVERS.pwm.p) + " duty; cheap driver " + DRIVERS.ripple.f + " Hz ripple of ±" + pct(DRIVERS.ripple.p), "typical", "flicker bands"],
      ["Light colours", () => Object.keys(KELVIN).join(", ") + " K as linear RGB of white LEDs", "typical", "colour casts with mixed lights"],
      ["Lens distortion when uncalibrated", () => "barrel, " + LENS_DISTORTION + " (about 1% at 35° off axis)", "typical", "dimensions when uncalibrated"],
      ["Sensor flaws when uncalibrated", () => "pixel gain ±" + pct(shaderFloat("PRNU_SPAN") / 2) + ", dark offset up to " + shaderFloat("DARK_E") + " e⁻", "typical", "streaks in the bottom images"]]],
    ["Air, daylight, vibration", [
      ["Dust in the air", () => "scatters " + DUST_SIGMA * 1e6 + " per m per mg/m³ (~0.5 m²/g, coarse wood dust), mostly forward (g = " + shaderFloat("DUST_G") + ")", "assumed", "haze, glow above the gap"],
      ["Daylight in the hall", () => "overcast adds " + DAYLIGHT.overcast + "× the lamp-lit hall; sun with clouds " + DAYLIGHT.cloudLow + "–" + DAYLIGHT.cloudHigh + "×", "assumed", "station and top images"],
      ["Vibration of the bottom camera stands", () => shaderVec3("VIB_HZ").join(", ") + " Hz", "assumed", "wavy edges in the bottom images"],
      ["Fogged window", () => "lets through " + pct(shaderFloat("FOG_KEEP")) + ", scatters " + pct(shaderFloat("FOG_SCATTER")) + " of it along the line", "assumed", "contrast in the bottom images"]]],
    ["Wear and service", [
      ["LED output loss", () => pct(WEAR.ledLoss) + " per month", "typical", "signal over time"],
      ["Dirt on the bottom windows", () => pct(WEAR.windowDirt) + " per month on a flat window; in proportion to the face seen from above, but " + pct(WINDOW_WEAR.dustCling) + " of it clings to a vertical one", "assumed", "signal and contrast over time"],
      ["Dust on the LED bar", () => pct(WEAR.barDust) + " less light per month, uneven along the bar", "assumed", "signal over time"],
      ["Grit on each bottom window", () => WEAR.specks + " specks per month on a flat window (up to 10); grit and splinters slide off from " + WINDOW_WEAR.gritSlideDeg + "°", "assumed", "dark bands in the bottom images"],
      ["Air purge on the bottom windows", () => "blows grit away, lets " + pct(WINDOW_WEAR.purgeDust) + " of the dust settle, keeps the window dry (no fog); not a splinter", "assumed", "service interval"],
      ["Air purge consumption", () => "about " + WINDOW_WEAR.purgeAirM3h + " m³/h of compressed air per window", "assumed", "running cost"]]],
    ["Damage catalogue", [
      ["What makes a pallet need repair or count as unusual", () => "EPAL quality classification for the open exchange pool (contamination, rot, inadmissible components, skewed blocks over 1 cm, visible nail shanks, illegible marks; adhesions removed first)", "standard", "which damages exist and their severity"],
      ["Loose board turned flat", () => LOOSE_TURN_DEG[0] + "–" + LOOSE_TURN_DEG[1] + "° about the last block's nails, free end outward", "assumed", "how far it sticks out"],
      ["How often each damage occurs", () => "every damage of a type equally likely on a damaged pallet", "assumed", "Batch results, live labels"],
      ["Contamination and defect patch sizes", () => Object.entries(SOIL_R).map(([k, [a, b]]) => k + " " + a + "–" + b + " mm").join(", ") + " (radius)", "assumed", "how visible they are"]]],
    ["Stand-in classifier (not a real model)", [
      ["Damage found", () => "half the time at " + CLS.findCm2 + " cm² of changed image, borderline damage at " + CLS.borderCm2 + " cm²", "assumed", "every Batch and live label"],
      ["Undecided", () => "when the draw is within " + CLS.closeCall + " of the decision", "assumed", "share labelled"],
      ["False alarms on intact pallets", () => pct(CLS.falseAlarm), "assumed", "false alarm rate"],
      ["Image quality weights", () => "dirt " + QUALITY.dirt + ", debris " + QUALITY.debris + ", flicker " + QUALITY.flicker + ", fog ×" + QUALITY.fog + ", uncalibrated ×" + QUALITY.uncalCond + " (type ×" + QUALITY.uncalType + "), encoder error ×" + QUALITY.encoder, "assumed", "how conditions change the labels"],
      ["Changed-pixel threshold", () => DIFF_LEVEL + " of 765 summed RGB", "assumed", "damage evidence, Compare"],
      ["Targets", () => "at least " + CLS.labelTarget + "% labelled, at most " + CLS.wrongLimit + "% wrong", "given", "ok / short marks"]]]
  ];
  function renderAssumptions() {
    let n = 0, assumed = 0;
    const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    $("assume-table").querySelector("tbody").innerHTML = ASSUMPTIONS.map(([group, rows]) =>
      '<tr><th colspan="4" style="text-align:left">' + esc(group) + "</th></tr>" + rows.map(([what, value, basis, affects]) => {
        n++; if (basis === "assumed") assumed++;
        return "<tr><td>" + esc(what) + '</td><td style="white-space:normal">' + esc(value()) + "</td><td>" + basis + '</td><td class="cap-dim" style="white-space:normal">' + esc(affects) + "</td></tr>";
      }).join("")).join("");
    $("assume-intro").textContent = n + " values the simulation rests on; " + assumed + " are plain assumptions, not measured. Basis: assumed (a guess), typical (a usual value for such equipment, not this one's), estimate (derived from others), physics, given (from the brief). Measuring the ones a sensitivity sweep shows to matter most is the next step.";
  }
  $("tab-assume").addEventListener("click", renderAssumptions);
