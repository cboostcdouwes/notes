Fixed paths in every service repo (one pattern, M2/M3):
- docker/Dockerfile        stages: dev (toolchain, workspace) and release (no compiled source)
- docker/deps.repos        loose declarations (branches/ranges) of source dependencies; pip services: requirements*.txt
- compose.service.yaml     the service alone: ports, env, devices; other services only as variables (${INFERENCE_URL})
- .devcontainer fragment   the service's own dev settings (extensions, postAttach)
No file names a machine, a customer or another service (M11; a lint can check it).
