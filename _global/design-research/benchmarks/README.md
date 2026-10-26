# design-research benchmarks

Design questions whose best answer the user knows, used to measure the design-research skill
(`~/.claude/skills/design-research/`): does a run reach that answer, how early, and by asking the right questions?
A benchmark is replayed after each change to the skill and scored against the same ground truth.

## Benchmarks
| Benchmark | Kind | Runs (skill commit: match, points) |
|---|---|---|
| [recumbent-luggage-rack](recumbent-luggage-rack/) | physical product, no code | [2026-10-25](recumbent-luggage-rack/runs/2026-10-25-fd1de14/score.md) (`fd1de14`: short term, 0 of 2) |

## Layout
```
benchmarks/
  README.md                 this file: the process
  <benchmark>/
    README.md               the benchmark: prompt, ground truth, expected answer and rubric
    runs/<date>-<commit>/   one folder per run: score.md, replay.md, the research log and rounds file, drafts
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
1. **Start a fresh session** with no memory of earlier runs of this benchmark. Note the skill's version: the Notes
   commit of the skill, and its last change.
2. **Give the prompt verbatim.** Say only that it is a benchmark run, so the skill keeps a log. Don't say the answer
   is known.
3. **Answer only from the ground truth.**
   - Give only the facts (single rows of the ground truth) that a question asks about, in the user's words where the
     ground truth quotes them. Don't add neighbouring facts from the same group, and don't anticipate later
     questions: a fact the question doesn't name stays unsaid.
   - In a "Remarks" question, answer only the examples it names; otherwise "No remarks". The first run's user did
     volunteer facts there; replays don't, so the skill has to ask for them.
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

## Scoring
Write `score.md` in the run's folder, and add the run to the *Benchmarks* table above. The score holds:
- **Match:** yes, partial or no, and points by the rubric.
- **Timing:** the log round in which the matching answer first appears as an option and first leads, and whether it
  loses the lead again.
- **Cost of getting there:** question calls and individual questions before it first leads; the run's total rounds
  and question calls.
- **Ground truth by question call:** for each fact, the call (numbered section of `replay.md`) in which it first came
  out, or "never".
- **Hidden requirements:** for each one, whether a question aimed at it found it, and in which call. One that only
  came out through a "Remarks" question's named examples or an "Other" answer counts as found late, not by asking.
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
