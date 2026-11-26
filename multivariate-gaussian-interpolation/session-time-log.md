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

## 2026-11-25, 23:18: trying the variants in the game (`--try-out`, `--variant`), on the user's word

| From | To | Activity | What |
|---|---|---|---|
| 23:18 | 23:20 | upkeep, design | merge of `work/door`; how the game steps and scores |
| 23:20 | 23:24 | tools | `variant_from_params`; the session through a variant's environment; drawing; the two flags |
| 23:24 | 23:27 | testing, tools | four tests; they imported main's packages: pytest declared for the root project |
| 23:27 | 23:29 | testing | the game's and the variants' tests; frames of each variant rendered and looked at; the gauge made readable |
| 23:29 | 23:30 | writing | the game README, commit, notes |

## 2026-11-25, 23:50: stage 1, a session of four hours

Testing is its own activity.

| From | To | Activity | What |
|---|---|---|---|
| 23:50 | 23:51 | orientation, writing | stage 0 closed in the notes; the change to question 1 in `APPROACH.md` and why |
| 23:51 | 23:53 | analysis | why the time-to-goal is too long: stored experience against the true time and the data's shortest path |
| 23:53 | 23:55 | tools | a multiplier on the time-to-goal's bounds |
| 23:55 | 23:58 | testing | its tests (two rewrites: the first two did not break a bound in time); canaries |
| 23:58 | 23:59 | writing, runs | question 1's section in the maze README; the multiplier runs started (once more: a label with a dot) |
| 23:59 | 00:01 | tools | the truth swaps as parts and environment fields |
| 00:01 | 00:02 | testing | seven tests (test points first inside walls); canaries |
| 00:02 | 00:03 | runs | the swap chains started |
| 00:03 | 00:05 | analysis, design | question 2's first measurement (the store forgets half of what was seen); question 2's remedy after question 3 |
| 00:05 | 00:07 | tools | novel goals, curiosity, newness; the time-to-goal as a matrix |
| 00:07 | 00:10 | testing | five tests; the count test restated for acting's new meaning; canaries; commit |
| 00:10 | 00:12 | analysis | the runs' progress (slow side by side); curiosity counted at 1.57 × 10^9, over the level |
| 00:12 | 00:15 | tools, testing | every state embedded once, 16 candidates, 64 sampled: 9.8 × 10^8; tests, canaries, commit |
| 00:15 | 00:16 | runs, writing | question 3's section; its runs started |
| 00:16 | 00:17 | tools, analysis | a script for the runs' results; the sign without the truth (gap 0.44 to 0.51 on the learned pair) |
| 00:17 | 00:18 | analysis | question 2's interference test: plain, Fourier first layer, Gaussian attention |
| 00:18 | 00:20 | analysis | the multiplier run: full steps 1.01 to 1.03, the learned time 1.08, the sign's gap 0.06; curiosity's first layout |
| 00:20 | 00:21 | writing | findings 27 to 30; the maze README |
| 00:21 | 00:23 | tools, testing | the reference (`--exploring random`); tests; canaries; two commits |
| 00:23 | 00:24 | runs, writing | the race's budget; its two chains started |
| 00:25 | 00:26 | runs | the reference chain started again (a commit had found nothing: a run had swept the edit into its code) |
| 00:26 | 00:29 | tools, testing | the score per step of travel, in its own working tree; a test of its rule; canaries; commit |
| 00:29 | 00:41 | runs | waiting: seven runs share the GPU |
| 00:41 | 00:42 | writing | the work list |
| 00:42 | 01:05 | runs | waiting for the first swaps (three waits) |
| 01:05 | 01:07 | analysis | curiosity on layout-01 against the agent without it; question 2's first test started (keep every step), its section after the run had begun |
| 01:07 | 01:09 | analysis | the swaps and the first race runs on layout-01: both truths together stand still (NaN policy) |
| 01:09 | 01:13 | testing, tools | a failing test, then a length with gradient 0 at zero in the geometry; geometry, door and swap tests; canaries |
| 01:13 | 01:14 | upkeep, runs | the fix merged into `work/stage1`; both truths and the learned baselines started again |
| 01:14 | 01:17 | analysis, writing | the rate 1.0 multiplier; exact steps to each level of seeing from stored positions; the README |
| 01:17 | 01:20 | tools | `--rest-every` in the `scores` tree |
| 01:20 | 01:29 | testing | its tests twice (a deprecation warning showed `~False` used as a mask; fixed); canaries; commit |
| 01:29 | 01:31 | writing | `APPROACH.md` (question 2's remedy after 3's first score; candidates for 3 and 7) and its reasons |
| 01:31 | 01:40 | testing, runs | the full package suite with canaries in the background (13 minutes beside the runs); waiting |
| 01:40 | 01:42 | analysis | curiosity on layout-02: the person's level reached for the first time in stage 1's condition |
| 01:42 | 01:44 | writing | question 3's results, finding 31 |
| 01:44 | 01:53 | testing | the maze package's and the experiments' tests in the background; waiting |
| 01:53 | 01:57 | tools, testing | the maze tests died beside the runs (second time): the GPU grab turned off in their conftest; 56 passed |
| 01:57 | 01:58 | analysis, writing | question 2's first test: keeping every step does not help (finding 32) |
| 01:58 | 02:00 | analysis | the race on the noise mazes; the exact time on layout-02 |
| 02:00 | 02:21 | runs | waiting for the learned agent on layout-01 (three waits) |
| 02:21 | 02:22 | analysis, writing | the swaps on layout-01 against the learned agent; curiosity on layout-03; README and findings 31 and 33 |
| 02:22 | 02:24 | runs | two more tests started: the multiplier on layout-01 with resets, curiosity that never rests |
| 02:24 | 02:27 | upkeep | the stopped run removed with `runs remove`; my uncommitted `APPROACH.md` edit in main found and committed |
| 02:27 | 02:43 | runs | waiting (two waits) |
| 02:43 | 02:45 | analysis, writing | the exact step on layout-02; the race on the television and the random step; findings 33 and 34 |
| 02:45 | 02:48 | analysis, writing | both truths on layout-01 after the fix; never resting (finding 35); `APPROACH.md` and its reasons |
| 02:48 | 02:51 | upkeep, testing | `work/scores` into `work/stage1` into main; canaries on main; the `scores` tree removed |
| 02:51 | 02:53 | writing | machine time per question; the work list |
| 02:53 | 03:01 | runs | never resting queued on layouts 02 and 03 and the noise mazes (detached); waiting for the multiplier on layout-01 |
| 03:01 | 03:06 | writing | the exact time on layout-03; the time log's totals; the report |

Totals, 23:50 to 03:06 (minutes, mixed rows split evenly, rounded): waiting on runs 80, testing 43 (of it 18 waiting on
full suites beside the runs, and 9 on a test run twice for a warning), analysis 22, writing 22, tools 17, upkeep 6,
design 2. Runs side by side kept the GPU full from 00:03 on; the multiplier on layout-01 and about a dozen runs were
still going at the end.
| 03:06 | 03:15 | analysis, writing | never resting at its end; the multiplier on layout-01 against the learned agent and the exact time: the time-to-goal gets work |

## 2026-11-26, morning, ending 08:50: the last runs and question 1's close-out, on the user's word

Start times were not taken with `date`; the rows give the order and rough minutes.

| Minutes | Activity | What |
|---|---|---|
| 5 | analysis | the never-resting runs on layouts 02 and 03 and the noise and television mazes against the resting runs |
| 5 | writing, tools | maze README, finding 35, `APPROACH.md`; `rest_every` 0 the default; curiosity tests (2 minutes); commit |
| 2 | upkeep | the `stage1` tree and branch removed; work list |
| 5 | design | which scratch scripts become package parts (`results`, `check`) and which are deleted |
| 8 | tools | `gcrl.checks`, `runs.experience`, the two commands; checked against the scratch scripts on `bound-rate-01` |
| 9 | testing | nine tests (one expectation of mine wrong); the whole package with canaries (6.7 minutes) |
| 3 | upkeep, writing | merge, tree removed, scratch scripts deleted, work list |
