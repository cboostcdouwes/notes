# Service repo, Python with its own recipe (A2): unchanged

```text
Dockerfile.serve      its recipe; the machine builds it from a git context at a commit
requirements*.txt     its pip dependencies (not covered by cdr)
src/, models/         code and model files
```

In A2 the machine doesn't build inference from a folder of its own: its recipe stays here (the cost against M2).
