#!/bin/bash
# Keeps the dev box's system packages in line with src/ (FLEXCOMPOSE_DESIGN.md §13). Dev Containers runs it on every
# open (postAttachCommand), before your own /home/cboost-user/workspaces/bootstrap.sh; an open never clones or moves a
# checkout. Clone the repositories of dependencies.repos, or take in newer commits, with:
#   bash src/bootstrap.sh --update
# (cdr: it puts followed branches on their pins, keeps local commits ahead of them, and refuses uncommitted changes).
set -euo pipefail
cd "$(dirname "$0")/.."   # /home/cboost-user/workspaces: this repo is its src/
if [ "${1:-}" = --update ]; then
  cdr --repos src/dependencies.repos --src src
elif ! ls -d src/*/.git >/dev/null 2>&1; then
  echo "Nothing is checked out yet: clone the repositories with bash src/bootstrap.sh --update." >&2
  exit 1
fi
[ -d ~/.ros/rosdep/sources.cache ] || rosdep update
if ! rosdep check --from-paths src --ignore-src >/dev/null 2>&1; then
  sudo apt-get update
  rosdep install -y --from-paths src --ignore-src ||
    { echo "A package rosdep can't find may be one of ours not checked out yet: bash src/bootstrap.sh --update" >&2; exit 1; }
fi
