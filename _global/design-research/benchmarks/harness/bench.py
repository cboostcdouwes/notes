#!/usr/bin/env python3
"""Harness for a design-research benchmark run; the process is in ../README.md, *Running with the harness*.

The researcher is a fresh headless Claude Code session (`claude -p`) with the question tool disabled: it writes each
question call to `research/questions.json` and ends its turn. This script runs its turns, puts the skill's round gate
on each question call, turns the answerer's answers into the question tool's result format, and writes the run's
files at the end.

A run's work folder holds:
  research/   the researcher's working directory: its log, rounds file, drafts and questions.json
  relay/      everything the researcher must not see: ground truth, answering rules, prompts, outputs, answers

Subcommands:
  setup  <benchmark-dir> <workdir>          create the work folder and the first prompt
  round  <workdir> <N>                      run the researcher's turn N (N=1 starts the session)
  answer <workdir> <N> <answer>...          answer turn N's question call, one answer per question, in order
  reply  <workdir> <N> <request> <answer>   answer turn N in free text (a review or questions asked outside the tool);
                                           <request> is the researcher's request as quoted to the answerer
  report <workdir> <run-dir>                copy the run's files into the run folder; write replay.md and cost.md
"""

import glob
import hashlib
import json
import os
import shutil
import subprocess
import sys
import uuid
from datetime import date
from pathlib import Path

BENCHMARKS = Path(__file__).resolve().parent.parent
SKILL_DIR = Path.home() / ".claude" / "skills" / "design-research"
VAULT = BENCHMARKS.parents[2]
# Tools the researcher may use without a prompt; anything else is denied in headless mode.
ALLOWED_TOOLS = [
    "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Agent", "Skill",
    "Bash(python3:*)", "Bash(ls:*)", "Bash(cat:*)", "Bash(mkdir:*)", "Bash(wc:*)", "Bash(date:*)", "Bash(cp:*)",
    "Bash(grep:*)",
]
FIRST_PROMPT = """{prompt}

This is a benchmark run, so keep a research log; keep it, and any other files you write, in this folder: {research}

Note on this session: it runs headless, so the question tool (AskUserQuestion) isn't available. Wherever you would call it, write the exact input you would give it (a JSON object {{"questions": [...]}}) to {research}/questions.json, then end your turn. The answers come back in the next message, as the tool would return them. The hook that normally runs on the question tool runs on that file instead; if it blocks, its reason comes back instead of the answers.
"""


def section(text, start, stop_prefix):
    """The lines from the line starting with `start` up to the next line starting with `stop_prefix`."""
    lines = text.splitlines(keepends=True)
    begin = next(i for i, line in enumerate(lines) if line.startswith(start))
    end = next((i for i in range(begin + 1, len(lines)) if lines[i].startswith(stop_prefix)), len(lines))
    return "".join(lines[begin:end])


def skill_fingerprint():
    """sha256 over the skill's file paths and contents (not mtimes), first 12 hex digits."""
    digest = hashlib.sha256()
    for path in sorted(SKILL_DIR.rglob("*")):
        if path.is_file() and "__pycache__" not in path.parts:
            digest.update(str(path.relative_to(SKILL_DIR)).encode() + b"\0" + path.read_bytes() + b"\0")
    return digest.hexdigest()[:12]


def setup(benchmark_dir, workdir):
    benchmark_dir, workdir = Path(benchmark_dir).resolve(), Path(workdir).resolve()
    if VAULT in workdir.parents or workdir == VAULT:
        sys.exit("The work folder must be outside the notes vault, so the researcher can't find earlier runs.")
    research, relay = workdir / "research", workdir / "relay"
    research.mkdir(parents=True, exist_ok=False)
    relay.mkdir()

    readme = (benchmark_dir / "README.md").read_text()
    prompt = section(readme, "## Prompt", "## Ground truth").splitlines()[1].removeprefix("> ").strip()
    (relay / "ground-truth.md").write_text(section(readme, "## Ground truth", "### Public facts"))
    (relay / "running.md").write_text(section((BENCHMARKS / "README.md").read_text(), "## Running\n", "## "))
    (relay / "prompt-1.txt").write_text(FIRST_PROMPT.format(prompt=prompt, research=research))
    (relay / "notes.md").write_text("# Run notes (for score.md)\n")
    newest_change = max(p.stat().st_mtime for p in SKILL_DIR.rglob("*") if p.is_file())
    meta = {
        "benchmark": str(benchmark_dir),
        "date": date.today().isoformat(),
        "session_id": str(uuid.uuid4()),
        "skill_fingerprint": skill_fingerprint(),
        "skill_last_changed": date.fromtimestamp(newest_change).isoformat(),
        "notes_commit": subprocess.run(["git", "-C", str(VAULT), "rev-parse", "--short", "HEAD"],
                                       capture_output=True, text=True, check=True).stdout.strip(),
    }
    (relay / "meta.json").write_text(json.dumps(meta, indent=1))
    print(json.dumps(meta, indent=1))
    print(f"Run folder name: runs/{meta['date']}-{meta['notes_commit']}/")


def load_meta(relay):
    return json.loads((relay / "meta.json").read_text())


def run_gate(relay, questions_file, session_id):
    """The round gate's verdict on a question call, as (allowed, message)."""
    transcripts = glob.glob(str(Path.home() / ".claude" / "projects" / "*" / f"{session_id}.jsonl"))
    if len(transcripts) != 1:
        sys.exit(f"Expected one transcript for session {session_id}, found {transcripts}")
    event = {
        "hook_event_name": "PreToolUse",
        "tool_name": "AskUserQuestion",
        "tool_input": json.loads(questions_file.read_text()),
        "transcript_path": transcripts[0],
        "session_id": session_id,
    }
    result = subprocess.run(["python3", str(SKILL_DIR / "scripts" / "round-gate.py")],
                            input=json.dumps(event), capture_output=True, text=True, check=True)
    output = json.loads(result.stdout) if result.stdout.strip() else {}
    decision = output.get("hookSpecificOutput", {})
    if decision.get("permissionDecision") == "deny":
        return False, decision["permissionDecisionReason"]
    return True, output.get("systemMessage", "")


def round_(workdir, n):
    workdir = Path(workdir).resolve()
    research, relay = workdir / "research", workdir / "relay"
    meta = load_meta(relay)
    session_flag = ["--session-id" if n == 1 else "--resume", meta["session_id"]]
    questions_file = research / "questions.json"
    questions_file.unlink(missing_ok=True)

    command = ["claude", "-p", *session_flag, "--output-format", "json", "--permission-mode", "acceptEdits",
               "--disallowedTools", "AskUserQuestion", "--allowedTools", *ALLOWED_TOOLS]
    with open(relay / f"prompt-{n}.txt") as prompt, open(relay / f"err-{n}.txt", "w") as err:
        result = subprocess.run(command, cwd=research, stdin=prompt, stdout=subprocess.PIPE, stderr=err, text=True)
    (relay / f"out-{n}.json").write_text(result.stdout)
    if result.returncode != 0:
        sys.exit(f"claude exited with {result.returncode}; see relay/err-{n}.txt")
    out = json.loads(result.stdout)
    print(out["result"])
    print(f"\n[turn {n}: {out['subtype']}, {out['num_turns']} turns, session cost so far ${out['total_cost_usd']:.2f}]")

    if not questions_file.exists():
        (relay / f"review-{n}.md").write_text(out["result"])
        print(f"No question call: free text saved to relay/review-{n}.md; answer it with `reply {n}`.")
        return
    shutil.copy(questions_file, relay / f"questions-{n}.json")
    allowed, message = run_gate(relay, questions_file, meta["session_id"])
    if not allowed:
        (relay / f"prompt-{n + 1}.txt").write_text(message)
        (relay / f"round-{n}.json").write_text(json.dumps({"kind": "gate-deny", "reason": message}, indent=1))
        print(f"GATE DENIED; the reason is the next prompt (prompt-{n + 1}.txt):\n{message}")
        return
    print(f"Gate allowed. {message}".strip())
    print(f"Questions for the answerer: relay/questions-{n}.json")
    print(json.dumps(json.loads(questions_file.read_text()), ensure_ascii=False))


def answer(workdir, n, answers):
    relay = Path(workdir).resolve() / "relay"
    questions = json.loads((relay / f"questions-{n}.json").read_text())["questions"]
    if len(questions) != len(answers):
        sys.exit(f"{len(questions)} questions but {len(answers)} answers")
    pairs = ", ".join(f'"{q["question"]}"="{a}"' for q, a in zip(questions, answers))
    # The question tool's own result format, so the researcher reads the answers as it would in a normal session.
    (relay / f"prompt-{n + 1}.txt").write_text(
        f"User has answered your questions: {pairs}. You can now continue with the user's answers in mind.")
    (relay / f"round-{n}.json").write_text(
        json.dumps({"kind": "questions", "questions": questions, "answers": answers}, indent=1, ensure_ascii=False))
    print(f"Wrote prompt-{n + 1}.txt; next: round {n + 1}")


def reply(workdir, n, request, text):
    relay = Path(workdir).resolve() / "relay"
    (relay / f"prompt-{n + 1}.txt").write_text(text)
    (relay / f"round-{n}.json").write_text(
        json.dumps({"kind": "free-text", "request": request, "answer": text}, indent=1, ensure_ascii=False))
    print(f"Wrote prompt-{n + 1}.txt; next: round {n + 1}")


def replay_markdown(relay):
    lines = ["# Replay: questions and answers", "",
             "Every question the skill asked, with the options offered and the answer verbatim, in order. A call is "
             "one researcher turn that ended in a question call (gated by `round-gate.py`) or in free text. "
             "Fill in the leader at each call from the log's *Rounds* list.", ""]
    n = 1
    while (relay / f"round-{n}.json").exists():
        entry = json.loads((relay / f"round-{n}.json").read_text())
        lines.append(f"## Call {n}")
        if entry["kind"] == "questions":
            for i, (question, given) in enumerate(zip(entry["questions"], entry["answers"]), 1):
                multi = " (multi-select)" if question.get("multiSelect") else ""
                lines.append(f"{i}. **{question['header']}**{multi} — \"{question['question']}\"")
                lines.append("   Options: " + " · ".join(o["label"] for o in question["options"]) + ".")
                lines.append(f"   **Answer:** {given}")
        elif entry["kind"] == "free-text":
            lines += [f"Free text (the full message is in `review-{n}.md`). The researcher's request:", "",
                      "> " + entry["request"].replace("\n", "\n> "), "", f"**Answer:** {entry['answer']}"]
        else:
            lines += ["The round gate denied the question call; its reason went back to the researcher:", "",
                      "> " + entry["reason"].replace("\n", "\n> ")]
        lines += ["", "Leader at the time of asking: (from the log).", ""]
        n += 1
    return "\n".join(lines) + "\n"


def cost_markdown(relay):
    outs = sorted(relay.glob("out-*.json"), key=lambda p: int(p.stem.split("-")[1]))
    last = json.loads(outs[-1].read_text())
    rows = ["| Model | Input | Cache read | Cache write | Output (of which thinking) | Web searches | Price |",
            "|---|---|---|---|---|---|---|"]
    for model, usage in last["modelUsage"].items():
        rows.append(f"| {model} | {usage['inputTokens']:,} | {usage['cacheReadInputTokens']:,} | "
                    f"{usage['cacheCreationInputTokens']:,} | {usage['outputTokens']:,} "
                    f"({usage.get('thinkingTokens', 0):,}) | {usage.get('webSearchRequests', 0)} | "
                    f"${usage['costUSD']:.2f} |")
    rows.append(f"| **Total** | | | | | | **${last['total_cost_usd']:.2f}** |")
    turns = ["| Turn | Session cost so far | Wall-clock |", "|---|---|---|"]
    for out in outs:
        data = json.loads(out.read_text())
        turns.append(f"| {out.stem.split('-')[1]} | ${data['total_cost_usd']:.2f} | {data['duration_ms'] / 60000:.1f} min |")
    return ("# Cost of the run\n\nThe researcher session only, at list prices, from the last turn's cumulative "
            "`modelUsage`; the answerer and the relay are not counted.\n\n" + "\n".join(rows) + "\n\n"
            + "\n".join(turns) + "\n")


def report(workdir, run_dir):
    workdir, run_dir = Path(workdir).resolve(), Path(run_dir).resolve()
    research, relay = workdir / "research", workdir / "relay"
    run_dir.mkdir(parents=True, exist_ok=True)
    for path in research.glob("*.md"):
        is_log = path.name.endswith(".rounds.md") or (path.with_suffix(".rounds.md")).exists()
        shutil.copy(path, run_dir / (path.name if is_log else f"draft-{path.name}"))
    (run_dir / "replay.md").write_text(replay_markdown(relay))
    (run_dir / "cost.md").write_text(cost_markdown(relay))
    shutil.copy(relay / "notes.md", run_dir / "run-notes.md")
    for review in relay.glob("review-*.md"):
        if review.stem.removeprefix("review-").isdigit():
            shutil.copy(review, run_dir)
    print(f"Wrote {run_dir}: the log and rounds file, draft-*.md, review-*.md, replay.md, cost.md, run-notes.md. "
          "Fill in the leaders in replay.md, then write score.md.")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    command, args = sys.argv[1], sys.argv[2:]
    if command == "setup" and len(args) == 2:
        setup(*args)
    elif command == "round" and len(args) == 2:
        round_(args[0], int(args[1]))
    elif command == "answer" and len(args) >= 3:
        answer(args[0], int(args[1]), args[2:])
    elif command == "reply" and len(args) == 4:
        reply(args[0], int(args[1]), args[2], args[3])
    elif command == "report" and len(args) == 2:
        report(*args)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
