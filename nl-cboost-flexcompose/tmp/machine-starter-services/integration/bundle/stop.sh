#!/bin/bash
# Stops the release that runs, from any release folder (all releases share one Compose project): down removes its
# containers, so it no longer starts on boot either; its volumes stay. start.sh starts it again.
set -euo pipefail
cd "$(dirname "$0")"
docker compose -f compose.release.yaml down --remove-orphans
