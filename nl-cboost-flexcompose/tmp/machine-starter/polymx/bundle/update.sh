#!/bin/bash
# Installs the release in this folder on the machine: checks the bundle, loads its images and starts it in place of the
# one that runs (start.sh). Then it removes the images of all but the newest $keep releases, so the machine's disk does
# not fill up; their folders stay. Put each bundle in its own folder next to the earlier ones (releases/release-v1.1.0/),
# then run its update.sh.
set -euo pipefail
cd "$(dirname "$0")"
keep=3
sha256sum --quiet -c SHA256SUMS
docker load -i images.tar
./start.sh

# Remove the images of the older releases, except the ones this release still runs (a prebuilt image, e.g. postgres:16).
in_use=$(docker compose -f compose.release.yaml config --images)
loaded=$(docker image ls --format '{{.Repository}}:{{.Tag}}')
shopt -s nullglob
releases=(../release-v*/)
for old in $(printf '%s\n' "${releases[@]}" | sort -V | head -n -"$keep"); do
  for image in $(cd "$old" && docker compose -f compose.release.yaml config --images); do
    if ! grep -qxF "$image" <<< "$in_use" && grep -qxF "$image" <<< "$loaded"; then
      docker image rm "$image"
    fi
  done
done
