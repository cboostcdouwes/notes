#!/bin/bash
# Sets up one service's dev box (FLEXCOMPOSE_DESIGN.md §13). Dev Containers runs it on every open of that service's
# container (postAttachCommand), before your own /home/cboost-user/workspaces/bootstrap.sh; an open never clones or
# moves a checkout. Clone the repositories of dependencies.repos, or take in newer commits, with:
#   bash src/bootstrap.sh <service> --update
# (cdr: it puts followed branches on their pins, keeps local commits ahead of them, and refuses uncommitted changes).
# The checkouts in src/ are shared by all services' boxes, so one --update serves them all.
set -euo pipefail
service=${1:?usage: bash src/bootstrap.sh <service> [--update]}
cd -P "$(dirname "$0")" && cd ..   # /home/cboost-user/workspaces: this repo is its src/
if [ "${2:-}" = --update ]; then
  cdr --repos src/dependencies.repos --src src
fi
if [ ! -d "src/$service" ]; then
  echo "src/$service is not checked out yet: clone the repositories with bash src/bootstrap.sh $service --update." >&2
  exit 1
fi
# The service's own colcon workspace, ~/workspaces/<service>: its build/, install/ and log/, and the shared src/.
mkdir -p "$service"
ln -sfn ../src "$service/src"
# In this container colcon builds this service's packages and the ones they need, as the service's Dockerfile does.
own_packages=$(colcon list --names-only --base-paths "src/$service")
# sudo: the base image's ~/.colcon belongs to root.
echo "build: {packages-up-to: [${own_packages//$'\n'/, }]}" | sudo tee ~/.colcon/defaults.yaml >/dev/null
needed_paths=$(colcon list --paths-only --base-paths src --packages-up-to $own_packages)
[ -d ~/.ros/rosdep/sources.cache ] || rosdep update
if ! rosdep check --from-paths $needed_paths --ignore-src >/dev/null 2>&1; then
  sudo apt-get update
  rosdep install -y --from-paths $needed_paths --ignore-src ||
    { echo "A package rosdep can't find may be one of ours not checked out yet: bash src/bootstrap.sh $service --update" >&2; exit 1; }
fi
