# Draft D4 (axis D): generic assembly in the machine repo, a service's own steps in its repo

- `machine/Dockerfile`: generic; the override builds it with `context: .`, `additional_contexts: {workspace: $RELEASE_SRC}`.
- `app/release/install.sh`: the QC app's own steps. Its pip dependencies are git repositories: listed in the app's
  `dependencies.repos` (no package.xml, so colcon skips them), so cdr clones them and the lock pins them.
- The app repo has no Dockerfile.
