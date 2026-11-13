  "use strict";
  const $ = (id) => document.getElementById(id);
  if (!window.THREE || !THREE.OrbitControls) { $("view").innerHTML = '<p class="err">The 3D library did not load. Reload the page to try again.</p>'; return; }

