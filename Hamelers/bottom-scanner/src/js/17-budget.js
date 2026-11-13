  // ---------------- timing and data budget ----------------
  const TARGET_PER_H = 1000, SPACING = 400;   // R1 peak rate; mm between pallets in the feed (as spawn)
  const AREA_REAL = { topMP: 2.3, topPx: 1920, topField: 2600, stationMP: 5, stationMmPx: 0.6 };   // real-camera equivalents (assumed)
  const LINKS = [["GigE", 115], ["2.5GigE", 290], ["5GigE", 580], ["10GigE", 1150], ["CoaXPress-12 ×2", 2500]];   // usable MB/s
  const linkFor = (mbs) => (LINKS.find((l) => l[1] >= mbs * 1.25) || ["more than one link"])[0];
  function sensorAt(k) {   // mid-grey
    const e = Math.min(0.5 * k, 1) * SENSOR.fullWell;
    return { e: e, saturated: 0.5 * k >= 1, db: 20 * Math.log10(e / Math.sqrt(e + SENSOR.readNoise * SENSOR.readNoise)), gain: Math.max(1, 1 / k) };
  }
  const typeLen = new Map();
  function updateBudget() {
    const body = $("budget").querySelector("tbody"), o = opts(), types = TYPES.filter((t) => enabled.has(t.id));
    if (!types.length || !cams.length) { body.innerHTML = '<tr><td colspan="3" class="cap-dim">Tick at least one pallet type.</td></tr>'; return; }
    types.forEach((t) => { if (!typeLen.has(t.id)) typeLen.set(t.id, analysisPallet(t).L); });
    const v = beltSpeed, L = Math.max(...types.map((t) => typeLen.get(t.id))), cycle = 3600 / TARGET_PER_H, beltPitch = L + SPACING;
    const st = stickEstimate(gap), lost = st.perPallet * st.meanStall;   // travel lost to sticking, mm per pallet
    const capacity = v * 3600 / beltPitch, capStick = v * 3600 / (beltPitch + lost);
    const vs = scanSpeed(), le = lineExposure(o), ae = areaExposure(o), lineRate = vs / pitch;
    const pass = louvrePass(o.louvre), kLine = le.k * pass;
    const age = service.lightFactor(), sl = sensorAt(kLine * age * (1 - service.barDust()) * (service.barOut ? 0.1 : 1)), sa = sensorAt(ae.k * age);   // bar out: only stray light from the lamps above
    const driver = DRIVERS[$("driver").value], driverName = $("driver").selectedOptions[0].textContent;
    const flickLine = flickerSpread(driver, le.t * 1e-6), flickArea = flickerSpread(driver, ae.t * 1e-3);
    const flickRow = (spread) => [driverName, spread ? "brightness differs up to " + Math.round(spread * 100) + "% between exposures" : "steady", chk(spread <= 0.02, spread <= 0.1)];
    const lineCamMBs = lineRate * cams[0].PX * 3 / 1e6, linePalletMB = (L + 2 * MARGIN) / pitch * cams[0].PX * 3 * cams.length / 1e6;
    const topMmPx = AREA_REAL.topField / AREA_REAL.topPx, topMBs = AREA_REAL.topMP * TOP_FPS;
    const stations = AREA_CAMS.length - 1, stationMB = AREA_REAL.stationMP * stations, keptMB = linePalletMB + stationMB + AREA_REAL.topMP;
    const deadline = (1200 - MARGIN) / vs;   // end of the bottom scan until the trail leaves the station frame
    const chk = (ok, warn) => (ok ? '<span class="chip ok">ok</span>' : warn ? '<span class="chip warn">check</span>' : '<span class="chip bad">short</span>');
    const snrChk = (s) => chk(!s.saturated && s.db >= 30, !s.saturated && s.db >= 20);
    const signal = (s) => (s.saturated ? "saturated: mid-grey already fills the full well" : Math.round(s.e) + " e⁻, SNR " + s.db.toFixed(0) + " dB, gain ×" + s.gain.toFixed(1));
    const fmtBlur = (mm, mmPx) => mm.toFixed(2) + " mm = " + (mm / mmPx).toFixed(2) + " px";
    const rows = [
      ["Throughput"],
      ["Cycle per pallet at " + TARGET_PER_H + "/h", cycle.toFixed(1) + " s", ""],
      ["Belt pitch: longest ticked type " + L + " mm + " + SPACING + " mm", beltPitch + " mm, needs " + (beltPitch / cycle / 1000).toFixed(2) + " m/s", ""],
      ["Capacity at " + (v / 1000).toFixed(2) + " m/s", Math.round(capacity) + " pallets/h", chk(capacity >= TARGET_PER_H)],
      ["Gap between pallets at " + TARGET_PER_H + "/h", Math.round(v * cycle - L) + " mm (longest type)", chk(v * cycle - L >= SPACING)],
      ...(sectionFactor > 1.001 ? [
        ["Middle section", (vs / 1000).toFixed(2) + " m/s (" + sectionText(sectionFactor) + ")", ""],
        ["Gap in the middle section at " + TARGET_PER_H + "/h", Math.round(sectionFactor * v * cycle - L) + " mm", ""],
        ["Touching pallets come apart by", "about " + Math.round((sectionFactor - 1) * L) + " mm (longest type)", chk((sectionFactor - 1) * L >= 50, (sectionFactor - 1) * L >= 20)]] : []),
      ["… less gap sticking (" + st.perPallet.toFixed(2) + " × " + st.meanStall.toFixed(0) + " mm per pallet, model)", Math.round(capStick) + " pallets/h", chk(capStick >= TARGET_PER_H)],
      ["Bottom line-scan, " + cams.length + " × " + cams[0].PX + " px" + (sectionFactor > 1.001 ? ", at the middle-section speed" : "")],
      ["Line rate", Math.round(lineRate) + " lines/s, " + (1000 / lineRate).toFixed(2) + " ms per line", ""],
      ["Exposure", Math.round(le.t) + " µs" + (o.expUs > le.tMax ? " (capped at the line period)" : ""), chk(o.expUs <= le.tMax, true)],
      ["Motion blur along travel", fmtBlur(le.blur, pitch), chk(le.blur / pitch <= 0.5, le.blur / pitch <= 1)],
      ...(o.louvre ? [["LED bar louvre ±" + o.louvre + "° along the bar", "passes " + Math.round(pass * 100) + "% of the bar's light to the scan line", chk(pass >= 0.8, pass >= 0.4)]] : []),
      ["Signal at mid-grey", signal(sl), snrChk(sl)],
      ["Light flicker between lines: " + flickRow(flickLine)[0], flickRow(flickLine)[1], flickRow(flickLine)[2]],
      ["Brightest surface not clipped", kLine <= 2 ? "everything up to reference white" : Math.round(200 / kLine) + "% of reference white", chk(kLine <= 2, kLine <= 4)],
      ["Data rate", lineCamMBs.toFixed(1) + " MB/s per camera → " + linkFor(lineCamMBs), ""],
      ["Images per pallet", linePalletMB.toFixed(1) + " MB", ""],
      ["Top camera (tracking)"],
      ["Frames", TOP_FPS + " fps = one per " + FRAME_MM().toFixed(0) + " mm of travel, " + topMBs.toFixed(0) + " MB/s → " + linkFor(topMBs), ""],
      ["Frames while a pallet's lead edge crosses the view to the scan line", Math.floor(AREA_REAL.topField / 2 / FRAME_MM()) + "", chk(AREA_REAL.topField / 2 / FRAME_MM() >= 8, AREA_REAL.topField / 2 / FRAME_MM() >= 4)],
      ["Detector latency " + DETECT_S * 1000 + " ms = travel the tracker must predict over", LAT_MM().toFixed(0) + " mm", chk(LAT_MM() <= 50, LAT_MM() <= 100)],
      ["Motion blur", fmtBlur(ae.blur, topMmPx), chk(ae.blur / topMmPx <= 0.5, ae.blur / topMmPx <= 1.5)],
      ["Station cameras, " + stations + " × " + AREA_REAL.stationMP + " MP"],
      ["Per pallet", stationMB + " MB, " + (stationMB * TARGET_PER_H / 3600).toFixed(1) + " MB/s on average", ""],
      ["Motion blur", fmtBlur(ae.blur, AREA_REAL.stationMmPx), chk(ae.blur / AREA_REAL.stationMmPx <= 0.5, ae.blur / AREA_REAL.stationMmPx <= 1.5)],
      ["Signal at mid-grey (" + ae.t.toFixed(1) + " ms)", signal(sa), snrChk(sa)],
      ["Light flicker between snapshots: " + flickRow(flickArea)[0], flickRow(flickArea)[1], flickRow(flickArea)[2]],
      ["Service state"],
      ["Since service", service.months + " months: light output " + Math.round(age * 100) + "%, dust on the LED bar −" + Math.round(service.barDust() * 100) + "%, window dirt " + Math.round(o.dirt * 100) + "%, " + service.specks() + " specks per bottom window", chk(age >= 0.9 && o.dirt <= 0.5, age >= 0.8 && o.dirt <= 0.75)],
      ["Faults", [service.barOut && "LED bar out", service.lampOut && "a station lamp out", service.encErr && "encoder reads " + Math.round(service.encErr * 100) + "% short (images " + Math.round(service.encErr * 100) + "% compressed)"].filter(Boolean).join(", ") || "none",
        chk(!service.barOut && !service.lampOut && !service.encErr)],
      ["Totals"],
      ["Kept per pallet (bottom, station, one top frame)", keptMB.toFixed(0) + " MB", ""],
      ["Kept per hour at " + TARGET_PER_H + "/h", (keptMB * TARGET_PER_H / 1000).toFixed(0) + " GB", ""],
      ["Time to decide, from the end of the bottom scan until the pallet leaves the station frame", deadline.toFixed(1) + " s", '<span class="cap-dim">if the label is due by then (not a known requirement)</span>']
    ];
    body.innerHTML = rows.map((r) => (r.length === 1 ? '<tr><th colspan="3" style="padding-top:10px">' + r[0] + "</th></tr>" :
      "<tr><td>" + r[0] + '</td><td class="num">' + r[1] + "</td><td>" + r[2] + "</td></tr>")).join("");
  }

