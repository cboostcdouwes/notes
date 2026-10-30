# Service repo, colcon (A14-default)

```text
Dockerfile            the app's recipe: stages dev (toolchain) and release (no compiled source)
dependencies.repos    its direct source dependencies (cdr convention)
<packages>/           ROS 2 packages, each with package.xml
```

The release stage imports a lock it gets from outside (the named context `lock`); without one, it resolves this
repo's own `dependencies.repos` with `cdr`, so the app builds on its own (M5). Nothing here names a machine, a
customer or another service (M11).
