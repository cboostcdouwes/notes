A10 draft (round 4), not run. Two repo kinds, one rule each:
- A service repo follows one envelope and names no other service (M11).
- The machine repo is the only root: it picks versions, locks them per customer, and nothing below it may override.
The dev box is computed from the release definition plus a developer's untracked workspace file.

Walkthroughs:
- Release for customer-a: release.sh customer-a -> FlexCompose merges machine.yaml + variants/customer-a/compose.yaml,
  builds each service from its git context at the locked commit with its own docker/Dockerfile (target release),
  feeding the locked dependency set (variants/customer-a/lock/<svc>.repos) as a named context; bundle as today.
- Dev box, app from source: flexcompose.work.yaml (untracked) says app: ../nl-polymx-automated-qc-application.
  FlexCompose generates: app as build: from that path (target dev), its own workspace volume <project>_app_workspace,
  .devcontainer/app/devcontainer.json; inference and the rest as images at the variant's lock. A second entry
  (inference: ../inference) adds a second container, workspace and devcontainer (M7, M10).
- Lock: `flexcompose lock customer-a` resolves each service's loose deps (docker/deps.repos branches) to commits
  (vcs export --exact) into variants/customer-a/lock/; a clash check reports one shared package at two versions
  across services (packml_ros2 today) instead of letting colcon fail.
- Shared fix for all customers: edit machine.yaml (or re-lock the base); a customer layer holds only its differences.
