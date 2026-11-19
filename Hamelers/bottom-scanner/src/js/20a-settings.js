  // ---------------- shareable settings ----------------
  // Every control as a short code; "Load settings…" accepts the code or a link ending in #s=<code>.
  const SETTING_IDS = ["tilt", "side", "gap", "sensor", "fnum", "opt-fit", "opt-rect", "opt-light", "top-line", "scan-lines", "opt-plates", "light-setup", "spot-beam", "exp", "light", "aexp", "dirt", "belt", "section",
    "speed", "damage", "scatter", "opt-transport", "opt-unusual", "opt-station", "months", "f-bar", "f-lamp", "f-enc",
    "louvre", "dust", "opt-glare", "driver", "lightcol", "daylight", "vib", "shutter", "f-uncal", "f-splinter", "f-fog",
    "win-angle", "win-purge", "side-h", "side-x", "opt-indirect"];
  const SETTINGS_PREFIX = "pbs1.";
  let applyingSettings = false, restartWanted = false;
  function settingsCode() {
    const o = { preset: presetKey, types: [...enabled] };
    SETTING_IDS.forEach((id) => { const e = $(id); o[id] = e.type === "checkbox" ? e.checked : e.value; });
    return SETTINGS_PREFIX + btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function applySettings(text) {
    const m = /(?:#s=)?(pbs1\.[A-Za-z0-9_-]+)/.exec(text.trim());
    if (!m) throw new Error("that is not a settings code from this page");
    let o;
    try { o = JSON.parse(atob(m[1].slice(SETTINGS_PREFIX.length).replace(/-/g, "+").replace(/_/g, "/"))); } catch (e) { throw new Error("the settings code is damaged"); }
    applyingSettings = true; restartWanted = false;
    try {
      SETTING_IDS.forEach((id) => {
        if (!(id in o)) return;   // codes from older versions of the page lack newer controls: keep the current value
        const e = $(id);
        if (e.type === "checkbox") e.checked = !!o[id]; else e.value = o[id];
        e.dispatchEvent(new Event("input")); e.dispatchEvent(new Event("change"));
      });
      if (Array.isArray(o.types)) TYPES.forEach((t) => { const box = $("type-" + t.id), on = o.types.includes(t.id); if (box.checked !== on) { box.checked = on; box.dispatchEvent(new Event("change")); } });
      if (typeof o.preset === "string") setPreset(o.preset);
    } finally { applyingSettings = false; }
    restart();
  }
  const setMsg = (t) => { $("set-msg").textContent = t; };
  $("set-copy").addEventListener("click", () => {
    const code = settingsCode(), field = $("set-code");
    try { history.replaceState(null, "", "#s=" + code); } catch (e) { /* sandboxed host: the code alone still works */ }
    field.hidden = false; field.value = code; field.select(); $("set-apply").hidden = true;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject(new Error("no clipboard")))
      .then(() => setMsg("Copied. Paste it into Load settings… on another copy of this page."), () => setMsg("Copy the selected code and send it along."));
  });
  $("set-load").addEventListener("click", () => { const f = $("set-code"); f.hidden = false; f.value = ""; f.focus(); $("set-apply").hidden = false; setMsg("Paste a settings code or link, then Apply."); });
  const applyField = () => { try { applySettings($("set-code").value); setMsg("Settings applied."); $("set-apply").hidden = true; } catch (e) { setMsg("Not applied: " + e.message + "."); } };
  $("set-apply").addEventListener("click", applyField);
  $("set-code").addEventListener("keydown", (e) => { if (e.key === "Enter" && !$("set-apply").hidden) applyField(); });
