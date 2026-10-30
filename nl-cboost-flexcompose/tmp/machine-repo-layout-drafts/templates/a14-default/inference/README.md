# Service repo, Python with its own recipe (A14-default): unchanged

```text
Dockerfile.serve      its recipe; the machine builds it from a git context at a commit
requirements*.txt     its pip dependencies (not covered by cdr: open point 6)
src/, models/
```

From source in a dev box: the machine mounts this checkout over the image's package (`pip install -e .` once), so
no rebuild for code changes. Nothing changes in this repo.
