  // ---------------- saving images ----------------
  // Published on claude.ai, the page offers a file through the viewer's save prompt (downloads capability); opened
  // as a local file, it falls back to a plain browser download.
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  function saveCanvas(cv, name, statusEl) {
    cv.toBlob(async (blob) => {
      const filename = "pallet-scanner-" + slug(name) + ".png";
      const downloads = window.claude && window.claude.use ? await window.claude.use("downloads") : null;
      if (downloads) {
        try { await downloads.save({ filename: filename, data: blob }); }
        catch (e) { if (e.code !== "declined") statusEl.textContent = "Not saved: " + (e.message || e.code) + "."; }
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    }, "image/png");
  }
  // The pallet in the zoom view: its full-resolution images side by side in one PNG.
  $("zoom-save").addEventListener("click", () => {
    const imgs = [...$("zoom-imgs").querySelectorAll("canvas")];
    if (!imgs.length) return;
    const GAP = 8, out = document.createElement("canvas");
    out.width = imgs.reduce((s, c) => s + c.width + GAP, -GAP); out.height = Math.max(...imgs.map((c) => c.height));
    const ctx = out.getContext("2d"); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, out.width, out.height);
    let x = 0;
    imgs.forEach((c) => { ctx.drawImage(c, x, 0); x += c.width + GAP; });
    saveCanvas(out, $("zoom-title").textContent, $("zoom-cap"));
  });
