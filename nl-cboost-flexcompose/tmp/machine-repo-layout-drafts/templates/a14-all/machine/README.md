# Machine repo (A14-all): every source-capable service always from source

As A14-default, without the per-service default and the override option: every service that can run from source
always does, in every dev box. Nothing to choose, nothing to switch, so every devcontainer lists the same files and
Dev Containers attaches to a container that is already right.

```text
flexcompose.yaml            template: the app (workspace service), inference (image + its checkout mounted)
flexcompose.release.yaml    the release's differences: inference's mount removed (!reset: unverified in FlexCompose)
dependencies.repos          top level for cdr: the colcon service repos
variants/<customer>/        as A14-default
bootstrap.sh                cdr for the app's tree; clones every Python service into programs/
release.sh                  as A14-default
.devcontainer/<service>/    hand-written, one per service
```

Dev box: `flexcompose generate --target devbox:host-src`, Reopen in Container, pick a service. Every developer
clones every service and builds every service's image, inference's CUDA image too (the cost against M6, M12).
OPEN for `devbox:volume` (no host checkout to mount; open point 1).
