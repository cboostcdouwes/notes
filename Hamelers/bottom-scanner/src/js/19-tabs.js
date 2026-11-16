  // ---------------- tabs ----------------
  document.querySelectorAll(".tabs button[data-tab]").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button[data-tab]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    ["live", "status", "vis", "cmp", "photo", "budget", "batch", "assume"].forEach((t) => { const el = $("pane-" + t); el.hidden = t !== b.dataset.tab; el.style.display = el.hidden ? "none" : "grid"; });
    setVisMode(b.dataset.tab === "vis" && visGroup.children.length > 0);
  }));

  // the settings, one group per tab
  const setTabs = [...document.querySelectorAll("#set-tabs button")];
  setTabs.forEach((b) => b.addEventListener("click", () => setTabs.forEach((x) => {
    x.setAttribute("aria-selected", String(x === b)); $("set-" + x.dataset.set).hidden = x !== b;
  })));
