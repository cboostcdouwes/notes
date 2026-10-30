#!/usr/bin/env bash
# Dev box: every source-capable service from source.
set -euo pipefail
cd "$(dirname "$0")"
cdr --repos dependencies.repos --src .
rosdep install --from-paths . --ignore-src -y
[ -d programs/inference ] || git clone git@github.com:Cboostbv/nl-polymx-ai-suite-inference.git programs/inference
touch programs/COLCON_IGNORE
