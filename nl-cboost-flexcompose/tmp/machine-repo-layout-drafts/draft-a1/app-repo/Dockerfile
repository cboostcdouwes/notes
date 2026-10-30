# App repo (A1 draft): the recipe next to the code; its own pins in dependencies.repos.
ARG BASE_IMAGE
FROM ${BASE_IMAGE} AS build
COPY . /ws/src/app
RUN --mount=type=ssh vcs import /ws/src < /ws/src/app/dependencies.repos && colcon build --base-paths /ws/src --install-base /opt/app
FROM ${BASE_IMAGE} AS release
COPY --from=build /opt/app /opt/app
# + the starter's compiled-source check
