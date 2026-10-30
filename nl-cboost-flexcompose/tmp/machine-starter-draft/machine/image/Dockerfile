# syntax=docker/dockerfile:1
# The release image of this machine's source-built service (FLEXCOMPOSE_DESIGN.md §13). Generic: it names no
# repository. release.sh passes lock.repos checked out as the build context named workspace, and BASE_IMAGE.
# build compiles the locked tree into /opt/app; release is the base plus /opt/app only, so no source code ships.
ARG BASE_IMAGE

FROM ${BASE_IMAGE} AS build
USER root
COPY --from=workspace / /opt/app-build/src
WORKDIR /opt/app-build
RUN apt-get update && rosdep update && rosdep install -y --from-paths src --ignore-src
# Headers and CMake/pkg-config files are only for building against these packages: leave them out.
RUN . /opt/ros/$ROS_DISTRO/setup.sh \
 && colcon build --merge-install --install-base /opt/app \
 && rm -rf /opt/app/include /opt/app/lib/pkgconfig /opt/app/share/*/cmake

FROM ${BASE_IMAGE} AS release
USER root
COPY --from=build /opt/app /opt/app
# ... as today's starter: runtime rosdep, the compiled-source check, USER cboost-user, the sourcing ENTRYPOINT.
