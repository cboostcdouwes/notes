#!/bin/bash
# Starts the release in this folder on the machine, in place of the one that runs (all releases share one Compose
# project). It keeps running across reboots through its restart: policy (the template's restart: always), which
# Docker applies when it starts, so Docker must start on boot (systemctl enable docker). It marks this folder as
# ../current; an older folder's start.sh rolls back to that release, as long as its images are still loaded.
set -euo pipefail
cd -P "$(dirname "$0")"   # -P: the real folder, also when run as current/start.sh
docker compose -f compose.release.yaml up -d --remove-orphans
ln -sfn "$(basename "$PWD")" ../current
echo "Running $(basename "$PWD")."
