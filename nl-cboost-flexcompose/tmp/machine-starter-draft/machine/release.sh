#!/bin/bash
# Builds this machine's release bundle from the tagged commit checked out here (FLEXCOMPOSE_DESIGN.md §13). The
# tag is the release version: v1.3.0 on main, v1.3.0+<customer> on a customer branch. Docker tags can't hold +, so
# the images of v1.3.0+acme are tagged 1.3.0_acme (_ never occurs in a semver pre-release such as 1.3.0-rc1).
# Needs flexcompose, Docker with buildx, vcs (vcstool or vcs2l) and an SSH agent with a key for the repositories.
set -euo pipefail
cd "$(dirname "$0")"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Commit your changes first: a release is built from a commit." >&2
  exit 1
fi
tag=$(git describe --exact-match --tags --match 'v*' HEAD 2>/dev/null || true)
if ! [[ $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.]+)?(\+[0-9A-Za-z.]+)?$ ]]; then
  echo "Tag this commit with its version first (git tag -a v1.3.0 -m v1.3.0, on a customer branch v1.3.0+<customer>): the tag is the release version." >&2
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
# .git differs in every clone; with it removed rebuilds hit the build cache.
find "$RELEASE_SRC" -name .git -prune -exec rm -rf {} +
out=release-$tag
flexcompose generate --target release:build
flexcompose generate --target release
docker compose -f compose.release-build.yaml build
# The bundle carries lock.repos, so a reader on the machine sees the commits the release was built from.
# ... bundle as today, plus lock.repos: compose.release.yaml, bundle/*.sh, .env, images.tar, SHA256SUMS in $out/
