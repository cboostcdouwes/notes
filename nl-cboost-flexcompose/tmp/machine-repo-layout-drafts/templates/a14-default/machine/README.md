# Machine repo (A14-default): today's template as the root, a source default per service

The machine's integration and the top-level repo. No build recipes: every service is built from its own repo at a
version. Each service that can run from source has a default (from source, or as an image); a developer overrides
it for their own box.

```text
flexcompose.yaml            template: each service with image:, build: (git context at its version) and a source default
flexcompose.release.yaml    the release's differences
dependencies.repos          top level for cdr: the service repos built from colcon source (the app)
variants/<customer>/        dependencies.repos (overrides), compose.yaml (run differences), lock.repos (committed)
bootstrap.sh                dev box: cdr for colcon services run from source; a clone for Python ones
release.sh                  release.sh <customer>
.devcontainer/<service>/    hand-written, one per service that can run from source
```

Dev box: `flexcompose generate --target devbox:host-src` gives the template's defaults (here: the app from source,
inference as an image). `--source inference` or `--image app` overrides one service for this developer
(PROPOSED, remembered in the generated file's header). Reopen in Container and pick the service's config.

From source, per service kind:
- colcon (the app): today's workspace; `bootstrap.sh` resolves its tree with `cdr` into the checkout.
- Python (inference): its checkout, cloned into `programs/<service>/` (gitignored, with COLCON_IGNORE so the
  app's colcon build doesn't scan it), bind-mounted over the image's package (`pip install -e`). OPEN for
  `devbox:volume` (no host checkout to mount; open point 1).

Release: `git tag -a customer-a/v1.2.0 && ./release.sh customer-a`: each service built from its repo; the app with
the customer's lock as the build's input.
