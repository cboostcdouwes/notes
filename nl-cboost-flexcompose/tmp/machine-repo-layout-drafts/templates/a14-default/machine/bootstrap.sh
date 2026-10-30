#!/usr/bin/env bash
# Dev box: fetch what runs from source in this box (FlexCompose writes the list: PROPOSED, e.g. .flexcompose/source).
set -euo pipefail
cd "$(dirname "$0")"
if grep -qx app .flexcompose/source 2>/dev/null; then
  cdr --repos dependencies.repos --src .
  rosdep install --from-paths . --ignore-src -y
fi
if grep -qx inference .flexcompose/source 2>/dev/null && [ ! -d programs/inference ]; then
  git clone git@github.com:Cboostbv/nl-polymx-ai-suite-inference.git programs/inference
  touch programs/COLCON_IGNORE
fi
