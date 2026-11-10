# Example: service repos with their own template, imported by the machine

The prototype of 2026-11-10: a service's repo holds everything about the service (packages, dependencies, Dockerfile,
FlexCompose template, dev box), and a machine's integration repo imports its services. It needs the FlexCompose
prototype with `flexcompose_options.imports` (uncommitted in the FlexCompose repo on that date). Not reviewed;
`../machine-starter/PLAN.md` is unchanged. It replaces `../machine-starter-services/` (the same recipe per service
repo, but one template in the integration repo and shared checkouts).

Why (user, 2026-11-10): a service's own build steps and configuration live with the service; a service builds and
runs its dev box without an integration repo; a machine has several service repos, added the same way each; the
machine runs as a whole in a dev box, with some services only as images (a robot driver, inference).

| Folder | What |
|---|---|
| `service/` | What a service repo holds besides its packages, for a service that runs from source in a dev box |
| `service-as-image/` | The two templates of a service that runs as its image in a dev box too; the other files as in `service/` |
| `integration/` | The integration repo of a machine with two services, `example_app` and `example_driver` |
| `base/` | Stand-in for `cboost-ros2-jazzy:0.3.0` (PLAN step A): 0.2.0 plus `cdr` |
| `test.sh` | Runs all of it end to end, with repos served by a local git daemon |

## How it fits together

**A service repo** holds:

| File | What |
|---|---|
| packages, anywhere (the test's are under `source/`) | The service's code |
| `dependencies.repos` | The repositories it uses directly, for `cdr` |
| `Dockerfile` | Builds its packages and what they need into `/opt/app`. Built alone it resolves `dependencies.repos` itself; a machine passes its locked tree as the build context `workspace` |
| `flexcompose.yaml`, `flexcompose.release.yaml` | The service in a dev box and in a release |
| `bootstrap.sh`, `.devcontainer/` | Its dev box: `--update` clones the dependencies into `deps/` in the checkout |

**The integration repo** holds no service settings of its own:

| File | What |
|---|---|
| `dependencies.repos` | The machine's services; `lock.sh` resolves them and their dependencies for a release |
| `flexcompose.yaml` | Only `imports:`, the services' folders |
| `flexcompose.release.yaml` | What the machine changes in the services' releases: each builds from the locked tree |
| `.devcontainer/<service>/` | One config per service that runs from source |
| `lock.sh`, `release.sh`, `bundle/` | The release; `release.sh` now generates inside the checkout of `lock.repos` |

**In the machine's dev box** every service is a container. One whose template says `workspace: true` gets its own
checkout as `src/` and a volume of its own, so its box is the one its own repo gives: the app's packages are at
`~/workspaces/src/source/<package>`, its dependencies in `src/deps/`. The others run as the image their repo builds.

## Adding a service to a machine

1. `dependencies.repos`: the service's repository, under its name.
2. `flexcompose.yaml`: its folder in `imports`.
3. `flexcompose.release.yaml`: the four lines that build it from the locked tree.
4. If it runs from source: `.devcontainer/<service>/devcontainer.json`, a copy with the name replaced.

Then `vcs import --skip-existing --input dependencies.repos .` and `flexcompose generate`.

## Run it

```sh
PATH=<folder with flexcompose (with imports), cdr and vcs>:$PATH ./test.sh <new scratch folder>
```

Passed on 2026-11-10 (Linux, the FlexCompose prototype on `c88283f`, base 0.2.0): 18 checks. A service alone: its
dev box and its image from a clone. The machine: generate refused until the services are checked out; the app's box
holding only its own checkout and dependencies; the driver running next to it as an image; lock, release, and the
bundle running both containers, each image holding only its own service's packages.

## Not verified

- VS Code: Reopen in Container with the config in `.devcontainer/example_app/`, and Source Control finding the
  checkouts in `src/deps/`. The test runs `bootstrap.sh` the way `postAttachCommand` would.
- SSH: the fixtures are served over `git://`. Private repositories need an agent for `vcs import` on the host, and
  `docker build --ssh default` (or Compose's `build.ssh`) for a service's image built outside a release.
- `devbox:volume`, customer tags, Windows.

## Costs and open points

- **Dev boxes and the release resolve dependencies differently.** A service's box follows the service's own
  `dependencies.repos`; the release builds from the machine's lock, where the integration repo's overrides apply.
  A dependency two services share is cloned once per service and can differ between their boxes.
- **The image of an as-image service is not locked in the dev box**: Compose builds it from the checkout, where the
  Dockerfile resolves the dependencies itself, and Docker caches that step.
- **The host needs `vcs`** for the first sync of the service repos (and `cdr` for `lock.sh`, as before).
- **A service either runs from source or as an image**, as its template says. There is no choice per developer.
- An as-image service writes `BASE_IMAGE` out, because FlexCompose passes `image:` as `BASE_IMAGE` (PLAN step 1
  removes that).
- The base image's `~/.colcon` belongs to root. Nothing here writes to it any more, but it is worth fixing (step A).
- Limits of the FlexCompose prototype: see the vault's `TODO.md`.
