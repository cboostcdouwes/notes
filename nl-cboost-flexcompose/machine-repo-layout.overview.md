# Where a machine's services live: the file trees of the leading options

A side-by-side of the options that led a round of `machine-repo-layout.md`, or are among the best now (round 6,
2026-10-28). Each tree shows the three repos of the PolyMX QC machine: the machine (integration) repo, the app repo,
and the inference repo (another team's). Only files that matter for the layout are shown; `# new` marks files the
option adds, `# changed` files it changes, `# moves away` files it removes. Requirements are in the log.

Common to every option: the release bundle (`images.tar`, `compose.release.yaml`, `.env`) is built by `release.sh`
in the machine repo, and the generated files (`compose.generated.yaml`, `compose.release*.yaml`) are FlexCompose
output, not edited by hand.

## A0: today (the baseline)

```text
nl-polymx-automated-qc/                 # machine repo
├── flexcompose.yaml                    # template: app (workspace service, dev box image); no inference yet
├── flexcompose.release.yaml            # release override: app's image tag, build: context .
├── Dockerfile                          # the APP's recipe: vcs import release.repos, colcon build, release stage
├── dev.repos                           # the app's packages, by branch (dev box)
├── release.repos                       # the app's packages, by commit (release)
├── bootstrap.sh                        # vcs import dev.repos into the checkout (runs on every open)
├── release.sh
├── .devcontainer/devcontainer.json     # one config, service: app
└── <checkouts of dev.repos>/           # gitignored: the app, orchestrator, state manager, packml_ros2, ...
nl-polymx-automated-qc-application/     # app repo: code
└── dependencies.repos                  # a second, stale list of the app's packages (differs from dev.repos)
nl-polymx-ai-suite-inference/           # inference repo: code + its own recipe
├── Dockerfile.serve
├── requirements*.txt
└── docker-compose.yml                  # its own run settings (not used by the machine)
```

Gaps: two patterns (the app's recipe in the machine repo, inference's in its repo: M2); one `src/` for every
source-built service (M7); the app's packages listed twice (M13).

## A1: each service repo holds its recipe and exact pins (led round 1, before the checks)

```text
nl-polymx-automated-qc/                 # machine repo
├── flexcompose.yaml                    # app and inference by git context at a commit (one pin per service)
├── flexcompose.release.yaml            # build options: target, ssh, BASE_IMAGE
├── dev.repos                           # changed: service repos only
├── release.sh
└── .devcontainer/
    # Dockerfile, release.repos: moves away (to the app repo)
nl-polymx-automated-qc-application/
├── Dockerfile                          # new: the app's recipe, next to its code
└── dependencies.repos                  # changed: the app's packages by COMMIT (its own exact pins)
nl-polymx-ai-suite-inference/
└── Dockerfile.serve, requirements*.txt # unchanged
```

Dropped: two pin levels (a shared-package fix: three PRs: M3); the app's build options sit in the machine repo,
its recipe in its own repo (M4).

## A2: one folder per service in the machine repo (runner-up rounds 1 and 3)

```text
nl-polymx-automated-qc/
├── flexcompose.yaml                    # app: build context services/app; inference: git context
├── flexcompose.release.yaml
├── services/
│   └── app/
│       ├── Dockerfile                  # moved here from the repo root
│       ├── dev.repos
│       └── release.repos
├── variants/<customer>/                # customer differences
├── bootstrap.sh                        # changed: imports each services/*/dev.repos into its own folder
├── release.sh
└── .devcontainer/
nl-polymx-automated-qc-application/     # code only (dependencies.repos removed)
nl-polymx-ai-suite-inference/           # unchanged: its recipe stays in its repo
```

Dropped: programs keep their recipe in their repo while the app's sits here (M2); one machine-level recipe for
several app versions across customers (M8).

## A3: the app repo becomes the machine repo (led round 1, after the checks)

```text
nl-polymx-automated-qc-application/     # app code AND the machine's integration
├── source/, middleware/, ...           # the app's code
├── flexcompose.yaml                    # moved in: the machine template (names inference)
├── flexcompose.release.yaml
├── Dockerfile
├── dev.repos, release.repos
├── variants/<customer>/
├── bootstrap.sh, release.sh
└── .devcontainer/
nl-polymx-automated-qc/                 # removed
nl-polymx-ai-suite-inference/           # unchanged
```

Dropped: the app's repo knows the machine, its customers and its other services (M11, the reverse dependency);
app and machine tags become one.

## A7: recipe in the service repo, every pin in the machine repo (led round 2, before the checks)

```text
nl-polymx-automated-qc/
├── flexcompose.yaml                    # app and inference by git context at a commit
├── flexcompose.release.yaml            # passes variants/<c>/pins/ as a named context to each build
├── variants/<customer>/pins/
│   ├── app.repos                       # the app's packages by commit, for this customer
│   └── inference.txt                   # inference's pip pins (another team's pins, moved here)
├── release.sh
└── .devcontainer/
nl-polymx-automated-qc-application/
└── Dockerfile                          # new: reads its pins from the named context
nl-polymx-ai-suite-inference/
└── Dockerfile.serve                    # changed: reads pins from outside
```

Dropped: inference's pins move out of its repo (M2); a standalone build needs a default pin file in the service
repo, a second copy (M3, M13); recipe and pins apart (M4).

## A9: recipe and loose dependencies in the service, exact lock in the machine (led rounds 2-3)

```text
nl-polymx-automated-qc/
├── flexcompose.yaml                    # app and inference by git context at a version
├── flexcompose.release.yaml
├── variants/<customer>/
│   └── lock/app.repos                  # generated: the app's declarations locked to commits (vcs export --exact)
├── release.sh                          # changed: writes the lock, feeds it to the build
└── .devcontainer/
nl-polymx-automated-qc-application/
├── Dockerfile                          # new
└── dependencies.repos                  # changed: the app's packages LOOSELY (branches): its declarations
nl-polymx-ai-suite-inference/
└── Dockerfile.serve, requirements*.txt # unchanged: requirements already declare ranges
```

Merged into A14 (its best variant); alone it had no dev-box rule (M6, M7, M10 left to separate choices).

## A10: root-only machine manifest with a computed dev view (led round 4, before the checks)

```text
nl-polymx-automated-qc/
├── machine.yaml                        # new format: services by repo + version, base
├── variants/<customer>/
│   ├── compose.yaml                    # the customer's differences
│   └── lock/                           # generated per service
├── flexcompose.work.yaml               # untracked, per developer: app: ../nl-polymx-automated-qc-application
└── release.sh
    # flexcompose.yaml, flexcompose.release.yaml, Dockerfile, *.repos: replaced by machine.yaml
nl-polymx-automated-qc-application/     # the envelope:
├── docker/Dockerfile                   # new: dev and release stages
├── docker/deps.repos                   # new: loose declarations
├── compose.service.yaml                # new: the app alone (ports, env; inference only as ${INFERENCE_URL})
└── .devcontainer/                      # new: the app's own dev settings (a fragment)
nl-polymx-ai-suite-inference/           # the envelope too: another team's repo changes
├── docker/Dockerfile                   # changed: dev and release stages
└── compose.service.yaml                # new
```

Dropped: the largest FlexCompose change (a new manifest, a work file, a computed view, fragment merging, a lock
command: M14, N22, N11); run settings in three places (M3).

## A14-default: today's template as the root, a per-service source default (leading now)

```text
nl-polymx-automated-qc/                 # machine repo
├── flexcompose.yaml                    # changed: app and inference with build: by git context at a version
│                                       #   (author-written, passed on as written), image: tag; each
│                                       #   source-capable service gets a default: from source or as an image
├── flexcompose.release.yaml            # the release's differences
├── variants/<customer>/                # new: the customer's differences (configuration first; versions, base)
│   └── lock/app.repos                  # written by release.sh before the build, fed in as its input
├── bootstrap.sh                        # clones the services that run from source (as today: vcs import)
├── release.sh                          # changed: per customer; writes and uses the lock
├── .devcontainer/
│   ├── app/devcontainer.json           # hand-written in the starter (as today), one per source-capable service
│   └── inference/devcontainer.json
└── <checkouts of services run from source>/   # gitignored, as today
    # Dockerfile, dev.repos, release.repos: move away (the app's recipe and declarations go to its repo)
nl-polymx-automated-qc-application/
├── Dockerfile                          # new: the app's recipe (dev and release stages)
└── dependencies.repos                  # changed: the app's packages loosely (its declarations)
nl-polymx-ai-suite-inference/           # unchanged: from source = its checkout bind-mounted over the image's
                                        #   package (pip install -e); no workspace
```

A developer: `flexcompose generate --target devbox:host-src` (the defaults: e.g. the app from source, inference as
an image), or `--source inference` / `--image app` to override; then Reopen in Container. The app keeps today's
workspace; a second colcon service's workspace is decided when one comes.

Open: ~ M14 (one template key and one override option); M13's accepted exception (a service's version as its
`image:` tag and its git ref); the remark on placing the dev box in the app's checkout (round 7).

Variant **A14-all**: every source-capable service always runs from its checkout (no default, no override option);
the same tree without the per-service default. Costs every developer every checkout and dev image (inference's
CUDA image).
