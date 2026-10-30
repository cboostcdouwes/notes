ARG BASE_IMAGE
FROM ${BASE_IMAGE} AS build
COPY --from=lock lock.repos /tmp/lock.repos
RUN --mount=type=ssh mkdir -p /ws/src && vcs import --input /tmp/lock.repos /ws/src \
 && rosdep install --from-paths /ws/src --ignore-src -y && colcon build --base-paths /ws/src --install-base /opt/app
FROM ${BASE_IMAGE} AS release
COPY --from=build /opt/app /opt/app
# + the starter's check that no compiled-language source ships (no-compiled-source)
