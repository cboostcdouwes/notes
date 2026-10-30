# Template drafts: A2, A14-default, A14-all (round 7)

Throwaway drafts for `machine-repo-layout.md`; not run. Each option has three templates:

- `machine/`: the machine (integration) repo, the top-level repo for `cdr` (`nl-cboost-ros-tools`, deps-resolve).
- `app/`: a colcon service repo (the ROS app).
- `inference/`: a Python service repo with its own recipe (another team's).

Shared by all three:
- `dependencies.repos` convention (`cdr`): every repo pins its own direct source dependencies; the machine repo's
  file is the top level, and only it may `override: true`.
- Customer variants: `variants/<customer>/dependencies.repos` holds only that customer's overrides; `release.sh
  <customer>` merges it onto the machine's file, resolves with `cdr --strict`, and commits
  `variants/<customer>/lock.repos`. Every build of that release starts from the lock (the build's input).
  `variants/<customer>/compose.yaml` holds the customer's run differences (configuration first), merged into the
  release only, with plain Compose (C3).
- Release tags per customer: undecided (open point 4); the drafts tag `<customer>/v1.2.0`.
- Python dependencies (inference) are not covered by `cdr` (open point 6): the inference repo keeps its
  `requirements*.txt`.

Marked `PROPOSED` where FlexCompose can't do it today.

| Option | The app's recipe | Which services run from source in the dev box |
|---|---|---|
| A2 | `machine/services/app/Dockerfile` | the app (the one workspace service, as today) |
| A14-default | `app/Dockerfile` | per service: a default in the template, overridden per developer |
| A14-all | `app/Dockerfile` | every source-capable service, always |

## Found while drafting

- The machine merges a customer's overrides onto its `dependencies.repos` before `cdr` (cdr reads one top-level
  file): a small `merge-repos` helper in `release.sh`, or one full top-level file per customer (a copy: M13).
- The app's commit for the release build (`APP_REF`) comes from the lock: a small `lock-ref` helper.
- `COPY --from=lock` fails when the app is built on its own without that named context: the app repo needs an
  empty default (`lock/` folder) or a build arg that switches it off (A14-default, A14-all).
- A14-default needs FlexCompose to tell `bootstrap.sh` which services run from source (a generated list file:
  PROPOSED), plus the `source:`/`source_mount:` keys and `--source`/`--image` options.
- A14-all needs the release to drop inference's dev mount and command: Compose's `!reset`, unverified through
  FlexCompose's merge; and inference's package path inside its image (`/app/src`) is assumed.
- Python services from source in `devbox:volume` have no host checkout to bind-mount (open point 1): unsolved in
  all three.
- A2's `bootstrap.sh` resolves the app's tree into the machine repo's checkout, as today; A14's do the same, plus
  `programs/` with a COLCON_IGNORE for Python services.
