A1 draft, not run. Walkthrough of its real uses:
- Release: release.sh -> flexcompose generate release:build -> docker compose build: app from the app repo's git
  context at <sha> (its Dockerfile, its dependencies.repos), inference from its repo at <sha>. One pin per service in
  the machine repo; package pins live in the app repo (one level down).
- Dev box: bootstrap imports dev.repos (service repos), then each service repo's own dependencies.repos into that
  service's folder (two-pass, vcstool has no recursion). With one source-built service (today) this is B1; M7 needs B2/B3.
- Base bump: the machine template's image: and the app repo's BASE_IMAGE default/arg are now in two repos (rsd ~):
  here the release override passes BASE_IMAGE explicitly, so it stays in the machine repo (sibling F2), keeping the
  base bump in one repo.
- Cost of one cross-cutting change (orchestrator fix used by the app): PR orchestrator -> bump in app's
  dependencies.repos -> bump app <sha> in machine repo: three PRs instead of two today.
