  // ---------------- tabs ----------------
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    ["live", "vis", "cmp", "photo", "budget", "batch"].forEach((t) => { const el = $("pane-" + t); el.hidden = t !== b.dataset.tab; el.style.display = el.hidden ? "none" : "grid"; });
    setVisMode(b.dataset.tab === "vis" && visGroup.children.length > 0);
  }));

