# Time per activity, per session

Kept on the user's word of 2026-11-25 ("keep a running list of time spent for each type of activity"). Times are
wall-clock from `date`, rounded to the minute. Activities: *orientation* (reading the work list, rules and code at
the start), *design* (deciding how an item is built or measured), *tools* (code and tests of the package),
*runs* (machine time a run takes while waiting on it), *analysis* (reading results), *writing* (READMEs, findings,
work list), *upkeep* (merges, clean-up).

## 2026-11-25, 22:01: stage 0, step 9 (the explorer)

| From | To | Activity | What |
|---|---|---|---|
| 22:01 | 22:02 | orientation | notes `CLAUDE.md`, `PLAN.md` *A session*, `TODO.md` *Session state*, environment code |
| 22:02 | 22:04 | design | how the explorer moves and when a side counts as blocked; worktree `explorer` |
| 22:04 | 22:07 | tools | `gcrl.explorer`; a trace found it stranded in a wall cell after a step turned around a corner; fixed by walking back |
| 22:07 | 22:08 | tools | eight tests, `uv run gcrl explorer` |
| 22:08 | 22:09 | runs, writing | layouts 01 to 03, two seeds (seconds); maze README *Stage 0, step 9*, package README, finding 25 |
