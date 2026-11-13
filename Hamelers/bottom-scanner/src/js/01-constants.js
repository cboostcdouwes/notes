  // ---------------- constants (mm unless noted; assumptions) ----------------
  const BELT_W = 1300, WD = 600, HALF_FOV = 42 * Math.PI / 180;
  // Wear and faults between services (assumed rates): LEDs lose ~2% output per month in 24/7 use, the camera window
  // collects ~6% dirt per month; faults switch a light off or make the encoder under-count travel.
  // Dust also settles on the LED bar's upward face under the gap, ~4% less light per month, unevenly (barDust: mean loss).
  const service = { months: 0, barOut: false, lampOut: false, encErr: 0,
    lightFactor() { return 1 - 0.02 * this.months; }, extraDirt() { return 0.06 * this.months; }, barDust() { return Math.min(0.7, 0.04 * this.months); },
    specks() { return Math.min(10, Math.floor(1.5 * this.months)); } };   // grit on each bottom window, ~1.5 per month
  let beltSpeed = 450;   // real infeed conveyor speed, mm/s (the Playback slider only runs the simulation faster or slower)
  // The middle section, |x| < SECTION_HALF around the scanner, can run faster than the infeed so touching pallets
  // separate. Its encoder drives the line-scan cameras and the tracker, so encoder position s is in middle-section mm.
  let sectionFactor = 1.1;
  const SECTION_HALF = 2000;   // the section covers the top camera's view
  const scanSpeed = () => beltSpeed * sectionFactor;   // mm/s over the scanner
  const PIXEL_UM = 7;                      // line-scan pixel pitch
  const MAXROWS = 256, TEXW = 16, TEXH = 768, MAXPAL = 5;
  const MOTION_N = 1024, MOTION_U0 = -5200, MOTION_DU = 10400 / (MOTION_N - 1);   // pose samples every ~10 mm of belt progress
  const ROLL_R = 30, ROLL_PITCH = 125, ROLL_HALF = BELT_W / 2 - 30;
  // gap = clear opening between the two rollers next to the scan line, surface to surface
  const GAP_CHOICES = [40, 60, 80, 100, 150, 250, 350];
  let gap = 100;
  const rollerCentres = (g, n) => { const out = []; for (let k = 0; k < n; k++) out.push(g / 2 + ROLL_R + k * ROLL_PITCH, -(g / 2 + ROLL_R + k * ROLL_PITCH)); return out; };
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rs = 99; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const srgb2lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b].map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); };

