A14 draft (round 5), not run. Two variants for the dev-box switch; everything else shared.

Shared (A14):
- flexcompose.yaml stays the one root template. Each service: image + build: (author-written git context at its
  version, sibling F2); the app's base and the release override as today. Customer layers: variants/<c>/ (C2/C3).
- Service repos: recipe (Dockerfile) and dependency declarations (deps.repos / requirements*.txt) at conventional
  paths; nothing about machines, customers or integrations (M11).
- Release: build each service from its git context at its version; lock per variant as a snapshot
  (vcs export --exact; pip: a constraints file from `pip freeze` in the built image) written by release.sh.

Variant A14-flag: `flexcompose generate --source app` (header-remembered) switches app to its checkout; FlexCompose
writes one devcontainer for it. FlexCompose gains: a CLI option, header state, per-service volume, clone step.

Variant A14-gen (no new option): the template marks a service that can run from source
(`flexcompose_options: {workspace: true}` as today, on several services). FlexCompose always writes
  compose.generated.yaml            every service as an image (release-like), dev box base
  compose.source-<svc>.yaml         per workspace service: the dev-box target fragment for that service only
                                    (user, post_start, mounts), its own workspace, its dev image/command
  .devcontainer/<svc>/devcontainer.json  dockerComposeFile: [compose.generated.yaml, compose.source-<svc>.yaml]
Opening a service's devcontainer (VS Code's config picker) runs that service from source; nothing else changes.
FlexCompose gains: per-service volume names and N small output files; no CLI option, no header key (M14).

Workspace placements per source service (own-host-environment, must; work-survives, must):
| placement  | app (first workspace service)                     | another service <svc>                                |
| host       | ${WORKSPACES_DIR:-./workspaces} (unchanged)        | ${WORKSPACES_DIR:-./workspaces}-<svc>                |
| host-src   | volume source_workspace + . at src/ (unchanged)    | volume <svc>_source_workspace + ./<svc-repo> at src/ |
| volume     | volume source_workspace (unchanged)                | volume <svc>_source_workspace                        |
The first workspace service keeps every name it has today, so existing boxes keep their work; new names only for
new services. Which service is "first" is fixed by template order -> needs a rule that adding a service before the
app doesn't move it (name per service from the start: source_workspace stays the app's by an explicit option?).

M10 (two at once), variant A14-gen: two devcontainer windows with different dockerComposeFile lists on one Compose
project: the second window's `up` recreates services without the first window's override, so the first service
falls back to its image. Needs a combined config (.devcontainer/app+inference/) or a project per window -> ~ M10.
Variant A14-flag: `--source app --source inference` writes both into one generated file -> ✓ M10.

Commands (M12), app from source:
- A14-flag: flexcompose generate --source app; Reopen in Container            (1 command + VS Code)
- A14-gen:  flexcompose generate; Reopen in Container, pick "app"              (1 command + VS Code)
- today:    flexcompose generate --target devbox:host-src; Reopen in Container (1 command + VS Code)
