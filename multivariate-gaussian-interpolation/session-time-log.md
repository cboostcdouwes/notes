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
| 22:09 | 22:10 | analysis | step 8's leftover: the interval time-to-goal's sort, timed against a dense layer on one core |
| 22:10 | 22:12 | tools | a sort-free union length: checked against an exact merge and finite differences; committed step 9 |
| 22:12 | 22:17 | tools, runs | the union length in the package with three tests; step 8's CPU timing again (about 2 minutes); canaries stored again |
| 22:17 | 22:19 | writing | finding 24, the starting point's count, the package README; two commits |
| 22:19 | 22:21 | design | step 10: where the package assumes the observation is the position (nowhere but names); variants as wrappers |
| 22:21 | 22:25 | tools | `noise`, `television`, `random-step` variants, the setting `variant`, nine tests (one found the variants drew other starts than the plain maze) |
| 22:25 | 22:29 | tools | the variants' keys passed on unchanged; the tests compiled (4 minutes to 17 s) |
| 22:29 | 22:31 | runs, writing | the explorer on the noise variants; maze README *Stage 0, step 10*; notes |
| 22:31 | 22:32 | tools | close-out check: the CPU timing script used a second time, so `python -m gcrl.operations` with two tests |
| 22:32 | 22:34 | design, tools | step 11's tool: one gradient step per K advances, collecting and learning built and counted apart; commit of step 10's variants |
| 22:34 | 22:35 | tools | two tests; canaries unchanged; best agent in stage 1's condition counted at 8.1 × 10^8 per step; commit |
| 22:35 | 22:50 | runs | step 11's three runs, 4.5 minutes each; meanwhile the work list and the door's design |
| 22:46 | 22:56 | analysis | the two first runs, then the third (two waits that looked in the wrong folder cost a few minutes) |
| 22:56 | 22:58 | writing | maze README *Stage 0, step 11*, finding 26, work list; commit |

Totals (minutes, rounded; overlapping runs counted once under *runs*): orientation 1, design 5, tools 19,
runs 15, analysis 11, writing 6.

Testing and verification, counted afterwards from the session (the table above files it under *tools*): about 15
minutes waited on, a quarter of the hour. Waiting for tests: the variant tests twice before they were compiled
(4 and 3.7 minutes), the canaries three times (about 4 minutes), smaller test files (about 1 minute). Checking the
sort-free union length against an exact merge and finite differences: about 2 minutes. Two full suites ran in the
background beside other work (about 8 minutes, not waited on). No run was a confirmation.

## 2026-11-25, 23:01: the merge and the one-way door (stage 0, step 10), on the user's word

Testing is its own activity from here on.

| From | To | Activity | What |
|---|---|---|---|
| 23:01 | 23:03 | upkeep | merge of `work/explorer`; the testing time of the session before, counted afterwards |
| 23:03 | 23:08 | design | the door's place, step and directed distance; the maze geometry read |
| 23:08 | 23:09 | tools | `gcrl_maze.door` |
| 23:09 | 23:10 | testing | six tests on a small map with one loop (12 s) |
| 23:10 | 23:11 | tools, design | the variant; `layout-02` had no corridor on a loop: passages of any width; four layouts have no loop at all |
| 23:11 | 23:12 | testing | three tests through the interface; a check that the test's walk reaches the door (it does, twice) |
| 23:12 | 23:16 | testing | the whole suite with the canaries (3.7 minutes); READMEs written meanwhile |
| 23:16 | 23:17 | writing | commit, work list |

Totals: design 6, tools 3, testing 6 (of them 4 waiting on the full suite), writing 2, upkeep 2.
