ARG BASE_IMAGE=cboost-c-nas:5100/cboost-ros2-jazzy:0.2.0   # a default the machine overrides (not a copy: M13)
FROM ${BASE_IMAGE} AS dev
# the dev box image when from source: today's base, nothing added (the workspace is mounted)
FROM ${BASE_IMAGE} AS build
COPY . /ws/src/app
COPY --from=lock . /tmp/lock/
RUN --mount=type=ssh if [ -f /tmp/lock/lock.repos ]; then vcs import --input /tmp/lock/lock.repos /ws/src; \
    else cdr --strict --repos /ws/src/app/dependencies.repos --src /ws/src; fi \
 && rosdep install --from-paths /ws/src --ignore-src -y && colcon build --base-paths /ws/src --install-base /opt/app
FROM ${BASE_IMAGE} AS release
COPY --from=build /opt/app /opt/app
# + the compiled-source check
