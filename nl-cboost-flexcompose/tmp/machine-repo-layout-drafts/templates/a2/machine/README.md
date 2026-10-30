# Machine repo (A2): one folder per service

The machine's integration and the top-level repo. Holds the dev box, the release, and the build recipe of every
service built here; a service with its own recipe (inference) is built from its repo.

```text
flexcompose.yaml            template: app (workspace service, built from services/app), inference (git context)
flexcompose.release.yaml    the release's differences
dependencies.repos          top level for cdr: the app repo and anything the machine pins directly
services/app/Dockerfile     the app's recipe: imports the lock, colcon build, release stage without source
variants/<customer>/        dependencies.repos (overrides), compose.yaml (run differences), lock.repos (committed)
bootstrap.sh                dev box: cdr into the checkout (runs on every open)
release.sh                  release.sh <customer>: merge overrides, cdr --strict, lock, build, bundle
.devcontainer/              one config (service: app)
```

Dev box: `flexcompose generate --target devbox:host-src`, then Reopen in Container; `bootstrap.sh` resolves the
app's whole tree with `cdr` into the checkout. Inference runs as an image built from its repo (pull_policy: build).

Release: `git tag -a customer-a/v1.2.0 && ./release.sh customer-a`.

Costs (log): the app's recipe sits here while inference's sits in its repo (two patterns, M2); one recipe here
must build every app version a customer runs (M8).
