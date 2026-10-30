# Machine repo (draft starter): workflows

One repo per machine: the dev box and the release of all its services. It holds the generic recipe for the
source-built service (`image/Dockerfile`); service repos hold only code and their `dependencies.repos`, and a
service with its own recipe (inference) is built from its repo. `main` holds the default configuration; each customer has a branch `customer/<name>`.

```text
flexcompose.yaml            the services: the app (the dev box's workspace), inference (its image, built by git tag)
flexcompose.release.yaml    how the release differs: the app built from the lock, its base, command
image/Dockerfile            the generic recipe: the locked tree built with colcon, only /opt/app shipped
dependencies.repos          top level for cdr: the repositories built from source; only this file may override
lock.repos                  the release's exact commits (lock.sh writes it); release.sh builds only from it
bootstrap.sh                dev box: rosdep on every open, never clones or moves a checkout; --update clones and syncs
lock.sh                     writes lock.repos in a fresh folder
release.sh                  tag → bundle
.devcontainer/              the app's container
```

Needs: flexcompose, Docker with buildx, an SSH agent with a key for the repositories; for `lock.sh` and `release.sh`
also cdr and vcs2l on the host (`pip install <nl-cboost-ros-tools>/tools vcs2l`). The base image needs cdr and vcs2l
for the dev box (not yet in `cboost-ros2-jazzy:0.2.0`).

Dev box targets: `devbox:host-src` (above) mounts this repo as the box's `src/`. With `devbox:host` or
`devbox:volume` the box's `src/` starts empty: clone this repo into it once, in the box
(`git clone <machine repo> ~/workspaces/src`), then use `bash src/bootstrap.sh --update` as below; Dev Containers
runs that copy's `bootstrap.sh` on every open. Keep the two copies apart: generate the box from the host copy, work
and commit in the box's copy.

## Developer

| Action | Commands | What happens |
|---|---|---|
| New dev box | `git clone <machine repo> && cd <it>`, `flexcompose generate --target devbox:host-src`, Reopen in Container, `bash src/bootstrap.sh --update`, `colcon build` | The first open says nothing is checked out yet; `--update` resolves the tree with cdr, clones every repository and installs system packages; Compose builds inference once from its tag |
| Daily work on any package | edit in `src/<repo>/`, `colcon build`, commit and push in that repo | Opening the box never moves a checkout or refuses because of your work |
| Take in teammates' new commits | `bash src/bootstrap.sh --update` | cdr puts followed branches on their pins (refuses uncommitted changes; keeps local commits ahead) |
| A teammate added a repository | `bash src/bootstrap.sh --update` | A missing package makes rosdep fail on the next open with the `--update` hint; a new top-level repository nothing depends on arrives at your next `--update` |
| Bump or add a dependency | edit `dependencies.repos` in the repo that uses it, commit, push | Others get it with `--update`; a conflict names both owners: agree, or `override: true` in this repo's file |
| Take a new inference version | `image: ...polymx-serve:1.5.0` and `#v1.5.0` in `flexcompose.yaml`, commit; others: `docker compose -f compose.generated.yaml up -d` | Compose builds the new tag once (it is missing), then reuses it offline |
| Work on inference with the machine | tag or branch in the inference repo, point both literals at it, `up -d` | Inference runs as an image here; from source only in its own repo (a later decision) |
| Bump the base image | the template's `image:` and the override's `BASE_IMAGE:` | Both literals by hand (A-5); a forgotten one goes unnoticed |
| Work on a customer's setup | `git switch customer/acme`, `bash src/bootstrap.sh --update`; Rebuild if the template changed | `--update` moves the checkouts to the customer's pins; without it you work on the previous branch's versions (not warned) |

## Release manager

| Action | Commands | What happens |
|---|---|---|
| Release (default) | on `main`: push your work, `./lock.sh`, `git diff lock.repos`, commit, `git tag -a v1.3.0 -m v1.3.0`, `./release.sh` | Builds from the committed lock only, never from your checkouts: a fix that isn't pushed and locked is not in it; refuses a lock written for another `dependencies.repos`; bundle in `release-v1.3.0/` with `lock.repos` (the commits it was built from) |
| Rebuild an old release | `git checkout v1.2.0 && ./release.sh` (or from a worktree) | Same source commits from that tag's lock; on the same PC the cached image is reused |
| New customer | `git switch -c customer/acme v1.3.0`; configuration in the Compose files or mounted files; other versions in `dependencies.repos` (`override: true` if needed), `./lock.sh`, commit | Configuration is never baked into images |
| Customer release | on `customer/acme`: `./lock.sh`, commit, `git tag -a v1.3.0+acme -m v1.3.0+acme`, `./release.sh` | Images tagged `1.3.0_acme`; equal locks share one image with other releases on the same PC |
| Fix for all customers (machine repo) | fix on `main`, tag, release; per customer: `git switch customer/acme && git merge v1.3.1`, on a `lock.repos` conflict take either side and `./lock.sh`, commit, tag `v1.3.1+acme`, release | One merge per customer branch (A-4's accepted cost) |
| Fix for all customers (app repo) | fix on the app line each customer follows; per branch `./lock.sh`, commit, tag, release | Re-locks, no merges |
| On the machine | copy `release-<tag>/` next to the earlier ones, `./release-<tag>/update.sh` | As today |
