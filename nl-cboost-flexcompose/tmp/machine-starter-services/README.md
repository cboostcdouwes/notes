# Example: a recipe per service repo

A working variant of `../machine-starter/` (the reviewed target state, where the integration repo holds one generic
recipe). Made 2026-11-10 on the user's request to keep a service's build instructions in the service's repo. Not
reviewed; `../machine-starter/PLAN.md` is unchanged.

Why (user, 2026-11-10): a service's own build steps live with the service; a service's image builds without an
integration repo; a machine may have several service repos, added in the same way each. Chosen for this example
(user): one container per service repo in the release; a dev container per service; `docker build` in a clone
resolves the service's own dependencies; the full recipe copied into each service repo, for now.

| Folder | What |
|---|---|
| `service/` | What a service repo holds besides its packages: `Dockerfile`, `.dockerignore`, `dependencies.repos` |
| `integration/` | The integration repo of a machine with two services, `example_app` and `example_driver` |
| `base/` | Stand-in for `cboost-ros2-jazzy:0.3.0` (PLAN step A): 0.2.0 plus `cdr` |
| `test.sh` | Runs all of it end to end, with repos served by a local git daemon |

## How it fits together

- **A service repo** holds its packages anywhere in it (the test's are under `source/`), the repositories it uses
  directly in `dependencies.repos`, and its `Dockerfile`. The Dockerfile builds the repo's packages and the packages
  they need (`colcon build --packages-up-to`) from a source tree it gets as the build context named `workspace`.
  Built alone, its first two stages make that tree with `cdr`. An integration repo passes its own tree, which
  replaces those stages.
- **The integration repo** names the services in `dependencies.repos` (`cdr`'s top-level file), as before.
  `lock.sh`, `release.sh` and `bundle/` are copies of the reviewed target state. A release builds every service's
  image with the Dockerfile in that service's locked checkout, with the whole locked tree as `workspace`.
- **The dev box** is one container per service. All share the checkouts in `src/` (one `cdr` resolution, as the
  release has one lock). Each builds in its own folder, `~/workspaces/<service>/`, and its colcon builds only that
  service's packages and what they need.

## Adding a service

The name is the same in all four places:

1. `dependencies.repos`: the service's repository, under its name.
2. `flexcompose.yaml`: a service block (copy one).
3. `flexcompose.release.yaml`: its image name, its build (copy one, change the name) and the machine's command.
4. `.devcontainer/<service>/devcontainer.json`: copy one, replace the name.

## Run it

```sh
PATH=<folder with flexcompose, cdr and vcs>:$PATH ./test.sh <new scratch folder>
```

Passed on 2026-11-10 (Linux, FlexCompose 1.2.0 built from `c88283f`, base 0.2.0): 17 checks, among them a service's
image built in a bare clone, both dev boxes building and running their service, each workspace and each image
holding only its own service's packages, a service's own Dockerfile step in its image only, and the bundle running
both containers.

## Not verified

- VS Code: choosing between the two devcontainer configs, two windows on one Compose project, Source Control seeing
  the checkouts. The test runs `bootstrap.sh` the way `postAttachCommand` would.
- SSH: the fixtures are served over `git://`. A private dependency in a build without an integration repo needs
  `docker build --ssh default`.
- `devbox:host` and `devbox:volume` (left out of the template's targets), customer tags, Windows.

## What it changes in the reviewed plan, and open points

- A-2 goes back to "the recipe lives in the service repo" (D1 with R2); D2g and `image/Dockerfile` go. W17 (a
  service repo doesn't hold the assembly) is given up; the copies move from one per machine to one per service repo.
- PLAN step 2 (refuse a second workspace service) contradicts this: the example needs several.
- The services' boxes share one Docker volume and separate their builds by folder, with a `src` symlink and a colcon
  defaults file that `bootstrap.sh` writes. A volume per workspace service in FlexCompose (the step A-3 deferred)
  would make each box a plain colcon workspace and remove both.
- `BASE_IMAGE` comes from FlexCompose 1.2.0, which passes the template's `image:`. PLAN step 1 stops that; the
  override then needs `args: {BASE_IMAGE: ...}` per service. The Dockerfile's default (for a build alone) is one
  more place the base version is written.
- A service's dev-only steps (PolyMX's `pip install -e`) still have no home in the service repo: `bootstrap.sh` is
  the integration repo's.
- A service's image built alone follows branches and Docker caches the resolve step; the machine's release uses
  the lock.
- The base image's `~/.colcon` belongs to root (`bootstrap.sh` writes there with sudo): fix in the base (step A).
- A service with a recipe of another kind (inference) can join the same way if its Dockerfile ignores the
  `workspace` context; not tried.
