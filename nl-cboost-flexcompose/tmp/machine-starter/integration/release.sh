#!/bin/bash
# Builds this machine's release bundle from the tagged commit checked out here (FLEXCOMPOSE_DESIGN.md §13): its
# images, the machine's Compose file, the .env with the version, lock.repos, the bundle's scripts (bundle/) and their
# checksums, in release-<tag>/. It builds from the committed lock.repos only, never from the checkouts here: a fix
# that isn't pushed and locked is not in the release. The tag is the release version: v1.1.0 on main,
# v1.1.0+<customer> on a customer branch. Docker tags can't hold +, so v1.1.0+acme's images are tagged 1.1.0_acme
# (_ never occurs in a semver pre-release such as 1.1.0-rc1). Needs flexcompose, Docker with buildx, vcs (vcs2l) and
# an SSH agent holding a key for the repositories. On Windows, run it in Git Bash.
set -euo pipefail
cd "$(dirname "$0")"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Commit your changes first: a release is built from a commit." >&2
  exit 1
fi
tag=$(git describe --exact-match --tags --match 'v*' HEAD 2>/dev/null || true)
if ! [[ $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.]+)?(\+[0-9A-Za-z.]+)?$ ]]; then
  echo "Tag this commit with its version first (git tag -a v1.1.0 -m v1.1.0, on a customer branch v1.1.0+<customer>): the tag is the release version." >&2
  exit 1
fi
lock_line="# dependencies.repos sha256: $(sha256sum < dependencies.repos | cut -d' ' -f1)"
if [ "$(head -n 1 lock.repos 2>/dev/null)" != "$lock_line" ]; then
  echo "lock.repos is missing or was written for another dependencies.repos: run ./lock.sh, commit lock.repos, and tag that commit." >&2
  exit 1
fi
version=${tag#v}
export RELEASE_VERSION=${version//+/_}   # the image tag
if [ -z "${SSH_AUTH_SOCK:-}" ]; then
  echo "Start an SSH agent and add a key for the repositories first (ssh-agent, ssh-add)." >&2
  exit 1
fi
RELEASE_SRC=$(mktemp -d); trap 'rm -rf "$RELEASE_SRC"' EXIT; export RELEASE_SRC
vcs import --input lock.repos "$RELEASE_SRC"
# .git differs in every clone; without it, rebuilds hit the build cache.
find "$RELEASE_SRC" -name .git -prune -exec rm -rf {} +
out=release-$tag
flexcompose generate --target release:build
flexcompose generate --target release
docker compose -f compose.release-build.yaml build
mkdir -p "$out"
cp compose.release.yaml lock.repos bundle/start.sh bundle/stop.sh bundle/update.sh "$out/"
echo "RELEASE_VERSION=$RELEASE_VERSION" > "$out/.env"
docker compose -f compose.release.yaml config --images | sort -u | xargs docker save -o "$out/images.tar"
(cd "$out" && sha256sum images.tar compose.release.yaml lock.repos .env start.sh stop.sh update.sh > SHA256SUMS)
echo "Bundle: $out/. On the machine, copy that folder (with its .env) next to the earlier releases and run:"
echo "  ./$out/update.sh"
