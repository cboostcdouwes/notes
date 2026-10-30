# syntax=docker/dockerfile:1
# The release image of this machine's source-built services (FLEXCOMPOSE_DESIGN.md §13): generic, it names no
# service. release.sh passes lock.repos checked out as the build context named workspace, and BASE_IMAGE.
# A repository in the lock may ship release/install.sh: it runs after colcon, with PREFIX=/opt/app and the locked
# tree in /opt/app-build/src, for steps of its own (pip packages, staged libraries). It may write only under PREFIX.
ARG BASE_IMAGE

FROM ${BASE_IMAGE} AS build
USER root
COPY --from=workspace / /opt/app-build/src
WORKDIR /opt/app-build
RUN apt-get update && rosdep update && rosdep install -y --from-paths src --ignore-src
RUN . /opt/ros/$ROS_DISTRO/setup.sh \
 && colcon build --merge-install --install-base /opt/app \
 && rm -rf /opt/app/include /opt/app/lib/pkgconfig /opt/app/share/*/cmake
RUN for step in src/*/release/install.sh; do [ ! -f "$step" ] || PREFIX=/opt/app bash "$step" || exit 1; done

FROM ${BASE_IMAGE} AS release
USER root
COPY --from=build /opt/app /opt/app
# ... as today's starter: runtime rosdep, the compiled-source check, USER cboost-user, the sourcing ENTRYPOINT.
