#!/bin/bash
# This app's own release steps, run by a machine's generic release build after colcon (PREFIX=/opt/app; the locked
# tree is the current folder's src/). Its Python dependencies that aren't ROS packages, from their locked checkouts.
set -euo pipefail
for pkg in nl-cboost-orchestrator yaskawa_hse_driver nl-polymx-datastore; do
  pip install --no-deps --prefix "$PREFIX" "src/$pkg"
done
# + the patched Fast DDS and rclpy, staged from middleware/ (docs/fastdds-shm-deployment.md)
