# syntax=docker/dockerfile:1
# This service's release image: its packages (anywhere in this repository, e.g. under source/) and the packages they
# need from the source tree, built into /opt/app. The source tree is the build context named workspace:
# - built alone (docker build --ssh default -t <name> .), it is this repository plus the repositories of its
#   dependencies.repos, resolved by cdr in the stages resolve and workspace below;
# - built for a machine, the integration repo passes its locked checkout as the context workspace, which replaces
#   those two stages (flexcompose.release.yaml: additional_contexts).
# Stage release is the base image plus /opt/app only, so no source code of compiled languages reaches the image.
ARG BASE_IMAGE=cboost-c-nas:5100/cboost-ros2-jazzy:0.3.0

FROM ${BASE_IMAGE} AS resolve
USER root
# Trust only GitHub's published host key, for private repositories over SSH.
RUN install -d -m 700 /root/.ssh \
 && echo 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl' >> /root/.ssh/known_hosts
COPY dependencies.repos /resolve/
# Docker reuses this layer until dependencies.repos changes: to take in newer commits of a followed branch, build
# with --no-cache-filter resolve.
RUN --mount=type=ssh cdr --repos /resolve/dependencies.repos --src /resolve/src

FROM scratch AS workspace
COPY --from=resolve /resolve/src /
COPY . /this-service

FROM ${BASE_IMAGE} AS build
USER root
WORKDIR /opt/app-build
COPY --from=workspace / src
# This service's packages are the ones in this repository (the build context).
RUN --mount=type=bind,target=/this-service \
    colcon list --names-only --base-paths /this-service > own-packages \
 && { [ -s own-packages ] || { echo "This repository holds no colcon package." >&2; exit 1; }; }
RUN apt-get update && rosdep update \
 && rosdep install -y --ignore-src --from-paths $(colcon list --paths-only --packages-up-to $(cat own-packages))
# Headers and CMake/pkg-config files are only for building against these packages: leave them out.
RUN . /opt/ros/$ROS_DISTRO/setup.sh \
 && colcon build --merge-install --install-base /opt/app --packages-up-to $(cat own-packages) \
 && rm -rf /opt/app/include /opt/app/lib/pkgconfig /opt/app/share/*/cmake
# This service's own build steps go here: they change with its code, so they live with it.

FROM ${BASE_IMAGE} AS release
USER root
COPY --from=build /opt/app /opt/app
# Runtime dependencies only, from the installed package.xml files.
RUN apt-get update && rosdep update \
 && rosdep install -y --from-paths /opt/app/share --ignore-src --dependency-types exec \
 && rm -rf /var/lib/apt/lists/* /root/.ros
# This service's own runtime steps go here.
# No source code of compiled languages in the image: fail the build, listing the files, if any reached /opt/app.
# Interpreted code (Python, launch files) is what the release runs, so it stays. Add a language's extensions here.
RUN ! find /opt/app -type f -regextype posix-extended \
      -regex '.*\.(c|cc|cpp|cxx|h|hh|hpp|hxx|rs)|.*/(CMakeLists\.txt|Cargo\.toml)' | grep .
USER cboost-user
# Every command runs with the release's packages sourced (FLEXCOMPOSE_DESIGN.md §12).
ENTRYPOINT ["/bin/bash", "-c", "source /opt/app/setup.bash && exec \"$@\"", "--"]
