#!/bin/bash
# Writes lock.repos: the exact commit of every repository the release builds from source (FLEXCOMPOSE_DESIGN.md
# §13). It resolves dependencies.repos with cdr in a fresh folder, never the dev box's src/, whose local commits and
# branches would end up in the lock. Run it before tagging, review the diff, and commit lock.repos: release.sh
# builds only from the committed lock.
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
cdr --repos dependencies.repos --src "$tmp/src"
{
  echo "# dependencies.repos sha256: $(sha256sum < dependencies.repos | cut -d' ' -f1)"
  vcs export --exact "$tmp/src"   # commit hashes: a tag can be moved later
} > lock.repos
echo "Wrote lock.repos: check it (git diff lock.repos), then commit it."
