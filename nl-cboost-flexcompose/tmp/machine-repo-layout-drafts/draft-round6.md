Round 6 drafts (spikes run on Linux, Docker Engine 29.9.2, Compose 5.6.1).

1. A14-prof: one generated file; per source-capable service two entries, `app` (image, profile app-img) and
   `app-src` (from source, profile app-src); COMPOSE_PROFILES picks one per service.
   Spike spike-profiles/: `up` with app-img, then `up` with app-src: both run; `--remove-orphans` doesn't stop the
   profiled-out one. With network_mode: host the two clash on ports. Switching needs `docker compose stop app` by
   hand, and the profile choice lives in a file or variable per developer.

2. Subpath workspaces: keep the one frozen `source_workspace` volume; another service mounts a subfolder
   (`volume: {subpath: <svc>}`). Spike spike-subpath/: works, but the subfolder must exist first ("cannot access
   path ... no such file or directory" until created). Needs an init step (the first service's post_start, or a
   one-shot init service). host placement: `./workspaces/<svc>` (bind mounts create the folder). host-src: the
   service's checkout at its src/. No new volume declaration, no "first service" naming rule; the app's workspace
   volume holds the other services' folders too; `down -v` loses all, as today for the one workspace.

3. A14-all: every source-capable service always runs its dev image with its checkout mounted (at the lock when
   untouched), so nothing switches and every devcontainer lists the same files (no Dev Containers reuse gap). Each
   developer clones and builds every service's dev image (inference's CUDA image too) and needs a GPU for
   inference; the others are not "as images" (M6 as worded).
