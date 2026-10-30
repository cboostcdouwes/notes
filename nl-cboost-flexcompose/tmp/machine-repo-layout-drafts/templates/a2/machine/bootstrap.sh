#!/usr/bin/env bash
# Dev box: resolve the app's whole tree into this checkout (src/ in devbox:host-src), then its system dependencies.
set -euo pipefail
cd "$(dirname "$0")"
cdr --repos dependencies.repos --src .
rosdep install --from-paths . --ignore-src -y
