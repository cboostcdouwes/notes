# design-research benchmarks

Design questions whose best answer the user knows, used to measure the design-research skill
(`~/.claude/skills/design-research/`): does a run reach that answer, how early, and by asking the right questions?
A benchmark is replayed after each change to the skill and scored against the same ground truth.

## Benchmarks
| Benchmark | Kind | Runs (skill commit: match, points) |
|---|---|---|
| [recumbent-luggage-rack](recumbent-luggage-rack/) | physical product, no code | [2026-10-25](recumbent-luggage-rack/runs/2026-10-25-fd1de14/score.md) (`fd1de14`: short term, 0 of 2, rubric then of 2); [2026-10-28](recumbent-luggage-rack/runs/2026-10-28-c8c33da/score.md) (skill `17dcd49`, not in git: short term, 0 of 3) |

## Layout
```
benchmarks/
  README.md                 this file: the process
  harness/
    bench.py                runs the researcher, the gate and the relay; writes the run's files (see below)
    answerer-brief.md       the answerer agent's prompt and the messages it gets during a run
  <benchmark>/
    README.md               the benchmark: prompt, ground truth, expected answer and rubric
    runs/<date>-<commit>/   one folder per run: score.md, replay.md, cost.md, run-notes.md, review-N.md, the
                            research log and rounds file, drafts
```

The benchmark's README describes the benchmark only: all evidence needed to run and score it, nothing about runs.
Each run folder holds what that run produced and its score, so runs can be compared.

## Creating a benchmark
1. **Pick a question whose answer the user knows** and can judge, ideally one where the obvious first answer is
   wrong or incomplete. Write the prompt verbatim, as a user would ask it, with no hints.
2. **Run it once with the user as the answerer** (see *Running*). The user answers the skill's questions from what
   they know and gives no hints.
3. **After the run, the user reveals the expected answer.** Ask the user for:
   - what counts as a match, and any accepted alternatives;
   - what earns extra points;
   - the reasons behind the expected answer that the run didn't find (these are hidden requirements);
   - every fact about the situation the run didn't reach.
4. **Write the benchmark's README:**
   - the prompt;
   - the ground truth, one single fact per row, numbered by topic with a letter per fact (G1a, G1b, ...), so an
     answerer can give exactly what a question asks for;
   - what is not known;
   - public facts a run can find;
   - the rubric, and the hidden requirements a run should find by asking.

   Score the first run in its own folder (see *Scoring*).

## Running
1. **Start a fresh session** with no memory of earlier runs of this benchmark. Note the skill's version: its content
   fingerprint and last change, and the Notes commit (`harness/bench.py setup` records them).
2. **Give the prompt verbatim.** Say only that it is a benchmark run, so the skill keeps a log. Don't say the answer
   is known.
3. **Answer only from the ground truth.**
   - Give only the facts (single rows of the ground truth) that a question asks about, in the user's words where the
     ground truth quotes them. Don't add neighbouring facts from the same group, and don't anticipate later
     questions: a fact the question doesn't name stays unsaid.
   - **Be lazy: give as little as the question allows.** Pick an offered option without added text when one is
     true. Use "Other" only when none is, and then give only the fact that makes it true. Answer a broad question
     ("what do you carry?", "tell me about your setup") with the one most direct fact; the skill has to ask again
     for more. When unsure whether a fact is asked for, leave it out.
   - Answer every "Remarks" question with "No remarks", even when it names examples. The examples differ between
     runs, so answering them makes runs incomparable; the skill has to ask for each fact in a question of its own.
   - When the skill asks to review a draft or decision, and the answer goes under "Other" or in notes, give the
     most relevant fact: the one that makes the draft wrong, not one that only sounds related.
   - For anything listed as not known, answer "don't know".
   - If a question needs a fact the ground truth lacks, the user decides it and adds it to the ground truth with the
     date, so later runs get the same answer.
4. **The answerer can be the user or an agent** given only the benchmark README's ground truth and this section. An
   agent answerer must not see the expected answer or the rubric. Note who answered in the run's `score.md`.
5. **Keep the run's files in `runs/<date>-<commit>/`:**
   - `replay.md`: every question call, with the options offered and the answer verbatim, and the leader at the time
     of asking;
   - the research log and its rounds file;
   - the drafts.
6. **Let the run end normally:** the skill's stop condition and the decision review. Don't stop it when the leader
   matches.

## Running with the harness
Three parties: the **researcher** (a fresh headless Claude Code session running the skill), the **answerer** (an
agent playing the user), and the **operator** (the Claude session the user works with, which runs `bench.py`, relays
between the two, and asks the user when a fact is missing). The operator has read the expected answer, so it never
answers or hints itself; it only relays and checks answers against the rules above.

Why headless: a subagent can't start its own subagents (the skill's checks) and can't ask questions; a `claude -p`
session can do the first, and the harness replaces the second. The question tool is disabled; the researcher writes
each question call to `research/questions.json`, and `bench.py` runs the skill's `round-gate.py` on it against the
session's real transcript, as the hook would. Answers go back in the tool's own result format.

### Setup
1. `python3 harness/bench.py setup <benchmark-dir> <workdir>`. The work folder must be outside the notes vault (the
   script refuses otherwise) and new: use the operator's scratchpad. It creates:
   - `research/`: the researcher's working directory, empty, so it finds no earlier logs;
   - `relay/`: `ground-truth.md` (the benchmark's *Ground truth* up to *Public facts*: no rubric), `running.md` (the
     *Running* section), `prompt-1.txt` (the prompt verbatim, the log folder, and the note that the question tool is
     replaced), `meta.json` (session id, skill fingerprint and last change, Notes commit), `notes.md`.
   It prints the run folder's name: `runs/<date>-<Notes commit>/`.
2. Start the answerer: a fresh general-purpose agent with the prompt in `harness/answerer-brief.md`. Keep the same
   agent for the whole run. If the rules change mid-run, start the run over with a fresh researcher and answerer.

### Each turn
1. `python3 harness/bench.py round <workdir> <N>`, in the background (a turn takes up to 5 minutes; the first is
   N=1). It runs `claude -p` in `research/` with the tools allowed in `ALLOWED_TOOLS`, saves `relay/out-N.json`, and
   prints the researcher's message. Then one of three things:
   - **Question call, gate allowed:** it prints the questions as compact JSON. Send them to the answerer ("Round N
     questions:" and the JSON).
   - **Question call, gate denied:** the deny reason is already the next prompt. Run turn N+1.
   - **No question call** (a review request or questions in free text): the message is in `relay/review-N.md`. Send
     the answerer its path and the request quoted verbatim.
2. **Check the answerer's answers** before sending, against *Running* step 3: an option picked where one is true;
   only the facts asked for; "No remarks"; a review answered with the fact that makes the draft wrong; facts marked
   never offered kept back. When an answer breaks a rule or looks wrong, ask the user; send the user's version and
   tell the answerer what replaced its answer. Record every such case in `relay/notes.md`.
3. **Missing facts:** for each "NEEDS USER DECISION", ask the user (the question tool, with likely answers as
   options). Add the answer to the benchmark's ground truth as single-fact rows with the date, and to
   `relay/ground-truth.md`; tell the answerer the new rows; then let it answer again.
4. Send the answers:
   - question call: `python3 harness/bench.py answer <workdir> <N> "<answer 1>" "<answer 2>" ...`, one per question,
     in order: the option label as given, labels joined with ", " for multi-select, or the "Other" text;
   - free text: `python3 harness/bench.py reply <workdir> <N> "<request as quoted>" "<answer>"`.
5. Run turn N+1. Repeat until the researcher marks its decision "Reviewed" and ends the run.

### After the run
1. `python3 harness/bench.py report <workdir> <run-dir>` copies the log and rounds file, the other files the
   researcher wrote (as `draft-*.md`), the free-text messages (`review-N.md`) and the run notes into the run folder,
   and writes `replay.md` and `cost.md` (tokens and price per model, and per turn, from `modelUsage`).
2. Fill in the leader at each call in `replay.md` from the log's *Rounds* list.
3. Write `score.md` (see *Scoring*): name the answerer, the operator's overrides and the ground-truth changes, and
   check the open `_global/TODO.md` items about the skill against the run.
4. Add the run to the *Benchmarks* table, and the replay targets to `_global/TODO.md`.

## Scoring
Write `score.md` in the run's folder, and add the run to the *Benchmarks* table above. The score holds:
- **Match:** yes, partial or no, and points by the rubric.
- **Solution price:** what the decision costs to carry out, next to the expected answer's price.
- **Cost of the run:** the researcher session's tokens and price per model, at list prices (from `modelUsage` in a
  headless run, or `/cost`); say what is left out (answerer, relay).
- **Timing:** the log round in which the matching answer first appears as an option and first leads, and whether it
  loses the lead again.
- **Cost of getting there:** question calls and individual questions before it first leads; the run's total rounds
  and question calls.
- **Ground truth by question call:** for each fact, the call (numbered section of `replay.md`) in which it first came
  out, or "never".
- **Hidden requirements:** for each one, whether a question aimed at it found it, and in which call. One that only
  came out through an "Other" answer counts as found late, not by asking.
- **Rejection errors:** rejections that pushed out the matching answer or an accepted alternative, and whether a
  check caught them.
- **Replay targets:** what a better run would have done, worded as behaviour the skill should show.

Compare runs on the same benchmark only when the ground truth was the same. Note any ground-truth additions in the
run's section.

## Turning results into skill changes
Replay targets go into the vault's `_global/TODO.md` under the design-research skill. A skill change is researched
like any design change. It is accepted when a replay of the benchmarks scores at least as well, on match, points,
timing and cost, as the run before it. One benchmark run is a single sample, so treat a change in score as a hint,
not proof.
