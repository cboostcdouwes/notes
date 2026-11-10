# Stand-in for cboost-ros2-jazzy:0.3.0 (PLAN.md step A) until that base exists: 0.2.0 plus cdr. The dev box needs cdr
# for bootstrap.sh --update, a service's Dockerfile for a build without an integration repo.
# Build context: nl-cboost-ros-tools/tools.
FROM cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0
USER root
COPY . /tmp/tools
RUN pip install --no-cache-dir --break-system-packages /tmp/tools && rm -rf /tmp/tools
USER cboost-user
