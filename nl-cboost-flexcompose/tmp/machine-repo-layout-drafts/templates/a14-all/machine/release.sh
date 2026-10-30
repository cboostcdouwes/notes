#!/usr/bin/env bash
# release.sh <customer>: one customer's release from the tag <customer>/v<version>.
set -euo pipefail
customer=${1:?customer}; export CUSTOMER=$customer
tmp=$(mktemp -d)
merge-repos dependencies.repos "variants/$customer/dependencies.repos" > "$tmp/top.repos"   # small helper: overrides win
cdr --strict --repos "$tmp/top.repos" --src "$tmp/src"
vcs export --exact-with-tags "$tmp/src" > "variants/$customer/lock.repos"
git diff --quiet "variants/$customer/lock.repos" || { echo "lock changed: commit it, then tag again" >&2; exit 1; }
export APP_REF=$(lock-ref "variants/$customer/lock.repos" nl-polymx-automated-qc-application)   # the app commit from the lock
flexcompose generate --target release:build && docker compose -f compose.release-build.yaml build
flexcompose generate --target release
docker compose -f compose.release.yaml -f "variants/$customer/compose.yaml" config > bundle/compose.release.yaml
# ... docker save into bundle/images.tar, .env with RELEASE_VERSION, as today
