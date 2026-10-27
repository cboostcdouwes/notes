# Integration: the problem

Started 2026-10-26. The problem as the user states it, before any solution. The research log built on this file is
`machine-release-programs.md` (paused after round 4; its *Status* says where to resume).

## Problem
Right now all dependencies of the application repository are pulled into the integration repo through the .repos files.
A devbox or release may have multiple services, each service will have a separate list of dependencies and a different way of building the image.
I've cloned the repository that should be built into an image in the workspace (`nl-polymx-ai-training`).

## What goes wrong today
It seems that the current integration repo workflow cannot build the image and include it in the compose workflow.

## Notes

## Findings (Claude, 2026-10-26)
Checked against `nl-polymx-ai-training` @ `792e0de` and FlexCompose 1.0.0 (draft in the scratchpad, `draft-ai/`).

The repo brings its own build recipe: `docker/Dockerfile` on `pytorch/pytorch:2.3.1-cuda11.8-cudnn8-runtime`,
`COPY . .`, `pip install -e .`; no ROS, no colcon. The integration repo knows one way to build: clone
`release.repos` inside its own `Dockerfile` and `colcon build` into `/opt/app` on the ROS image. So fetching is not
the problem (vcs import clones it fine); building it its own way, and running it in the stack, is.

| What | Result |
|---|---|
| Dev box: the service with `build: context: nl-polymx-ai-training, dockerfile: docker/Dockerfile` | Works: FlexCompose keeps `build:` on services without `workspace: true`, so `up` builds it from the local checkout |
| Release: a private repo as build context, pinned by commit (`git@github.com:...#<sha>`, `dockerfile: docker/Dockerfile`) | Works in Compose and BuildKit with the developer's SSH agent (spike) |
| Release: `release:build` adds `target: release` to every build | **Breaks**: this Dockerfile has no `release` stage (`target stage "release" could not be found`) |
| Release: `release:build` adds `BASE_IMAGE` = the service's template `image:` | Meaningless here: that `image:` is the name of what it builds, not a base |
| Release pin | Would live twice: in `release.repos` and in the build context's `#<sha>` |
| `no-compiled-source` check | Lives only in the integration repo's `Dockerfile`; a repo's own Dockerfile skips it |
| Model checkpoints (`bundle/*.pt`) | Not in git ("distribute alongside the image or mount at run time", `docs/DEPLOYMENT.md`): an input from outside git, like polymx's patched middleware (D4) |
| What runs on the machine | `docs/DEPLOYMENT.md`: production inference is `polymx-deploy` (ONNX, no torch); this repo is training, portal and benchmarks |

### Answers (user, 2026-10-26)
- On the machine: only the ONNX inference, `nl-polymx-ai-suite-inference` (polymx-deploy). The training repo is not
  released.
- The training repo is developed inside its own container (GPU, torch), not inside the ROS dev box.
- A program's build recipe belongs to the program's own repo. This changes the verified requirement
  `integration-repo` ("package repos hold only code"): to be reworded in REQUIREMENTS.md, after asking.

### `nl-polymx-ai-suite-inference` @ `145211c`
- Two recipes: `Dockerfile` (one-shot CLI) and `Dockerfile.serve` (warm HTTP service, the recommended deployment),
  both on `nvidia/cuda:12.8.1-cudnn-runtime-ubuntu22.04`, `onnxruntime-gpu==1.23.2` pinned (CUDA 12; 1.27+ is
  CUDA 13). Python only, so `no-compiled-source` holds.
- The ONNX models (104 MB) are in git, so no input from outside git here (unlike the training checkpoints).
- It has its own `docker-compose.yml`: service `polymx-serve`, `restart: unless-stopped`, port `127.0.0.1:8080`, a
  bridge network `polymx`, a CUDA cache volume, GPU reservation, `stop_grace_period: 40s`, health check in the
  Dockerfile (`/readyz`). The polymx app runs with `network_mode: host`, so it would reach it on `127.0.0.1:8080`.

### Answers, round 3 (user, 2026-10-26)
- The training repo was added by mistake: only `nl-polymx-ai-suite-inference` matters.
- The inference service runs in the dev box too, as a **released image** (not built from a checkout).
- Who states its service definition (ports, health, GPU, volume): no preference.

### Draft: the inference as a pinned released image (`scratchpad/draft-inference/`)
- A template service with only `image:` (plus `enable_gpu`, port, volume) passes through `devbox:host-src`,
  `release:build` and `release` unchanged: no `target: release`, no `BASE_IMAGE`. **FlexCompose needs no change.**
- `release.sh` breaks: `docker save` fails with `reference does not exist` for an image the PC hasn't pulled. Adding
  `docker compose -f compose.release-build.yaml pull --ignore-buildable` before the save fixes it (TODO *Prebuilt
  images*).
- Not yet there: the inference repo has no release of its own (its compose builds a local `polymx-serve`, no
  registry, no version tag).

Sources: [Compose build spec](https://docs.docker.com/reference/compose-file/build/) (git contexts
`#ref:subdir`), [Compose include](https://docs.docker.com/reference/compose-file/include/) (relative paths resolve
per included file), [Docker blog: Scaling Docker Compose Up](https://www.docker.com/blog/scaling-docker-compose-up/)
(include from other git repos, experimental then), GitHub docs on several dev container configurations per repo.
