# Service repo, colcon (A2): code only

```text
dependencies.repos    the app's direct source dependencies (cdr convention): commits, release branches or main
<packages>/           ROS 2 packages, each with package.xml
```

No Dockerfile: the app's recipe lives in the machine repo (`services/app/`). Nothing here names a machine, a
customer or another service (M11). The app's build changes that need a recipe change are made in every machine repo
that builds it.
