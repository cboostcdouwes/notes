#!/bin/bash
# Keeps this service's dev box in line with its sources. Dev Containers runs it on every open (postAttachCommand),
# before your own /home/cboost-user/workspaces/bootstrap.sh, in this repo's own box and in the box a machine's
# integration repo gives the service: either way this repo is the box's src/. An open never clones or moves a
# checkout. Clone the repositories of dependencies.repos into deps/, or take in newer commits, with:
#   bash src/bootstrap.sh --update
# (cdr: it puts followed branches on their pins, keeps local commits ahead of them, and refuses uncommitted changes).
set -euo pipefail
cd -P "$(dirname "$0")" && cd ..   # /home/cboost-user/workspaces: this repo is its src/
if [ "${1:-}" = --update ]; then
  cdr --repos src/dependencies.repos --src src/deps
fi
[ -d ~/.ros/rosdep/sources.cache ] || rosdep update
if ! rosdep check --from-paths src --ignore-src >/dev/null 2>&1; then
  sudo apt-get update
  rosdep install -y --from-paths src --ignore-src ||
    { echo "A package rosdep can't find may be one of ours not checked out yet: bash src/bootstrap.sh --update" >&2; exit 1; }
fi
# This service's own dev box steps go here: they change with its code, so they live with it.
