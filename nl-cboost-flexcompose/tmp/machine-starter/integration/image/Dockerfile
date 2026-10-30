# syntax=docker/dockerfile:1
# The machine's release image of its source-built service (FLEXCOMPOSE_DESIGN.md §13). Generic: it names no
# repository. release.sh passes lock.repos checked out as the build context named workspace, and
# flexcompose.release.yaml passes BASE_IMAGE. Stage build compiles the locked tree into /opt/app; stage release is
# the base image plus /opt/app only, so no source code reaches the image.
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
# Runtime dependencies only, from the installed package.xml files.
RUN apt-get update && rosdep update \
 && rosdep install -y --from-paths /opt/app/share --ignore-src --dependency-types exec \
 && rm -rf /var/lib/apt/lists/* /root/.ros
# No source code of compiled languages in the image: fail the build, listing the files, if any reached /opt/app.
# Interpreted code (Python, launch files) is what the release runs, so it stays. Add a language's extensions here.
RUN ! find /opt/app -type f -regextype posix-extended \
      -regex '.*\.(c|cc|cpp|cxx|h|hh|hpp|hxx|rs)|.*/(CMakeLists\.txt|Cargo\.toml)' | grep .
USER cboost-user
# Every command runs with the release's packages sourced (FLEXCOMPOSE_DESIGN.md §12).
ENTRYPOINT ["/bin/bash", "-c", "source /opt/app/setup.bash && exec \"$@\"", "--"]
