#!/usr/bin/env python3
"""Generate an animated SVG of one research:design run: chat, tools/subagents, and the files they write."""

from html import escape
from pathlib import Path

# Scene start times in seconds; every other time is relative to one of these, so a scene can be lengthened alone.
S = {"intro": 0, "p1": 3, "p2a": 10, "p3": 13, "p4": 25, "p5": 37, "p2b": 46, "p6": 53}
T = 66.5  # loop length
END = 65.3  # everything fades out here so the loop restarts clean
FADE = 0.4
W, H = 900, 600

css, body = [], []
counter = 0


def keyframes(points):
    """points: [(seconds, {prop: value})]; returns a class name animating through them."""
    global counter
    counter += 1
    name = f"k{counter}"
    points = sorted(points, key=lambda p: p[0])
    if points[0][0] > 0:
        points.insert(0, (0, points[0][1]))
    if points[-1][0] < T:
        points.append((T, points[-1][1]))
    frames = []
    for t, props in points:
        decl = ";".join(f"{k}:{v}" for k, v in props.items())
        frames.append(f"{t / T * 100:.3f}%{{{decl}}}")
    css.append(f"@keyframes {name}{{{''.join(frames)}}}")
    css.append(f".{name}{{animation:{name} {T}s linear infinite}}")
    return name


def window(start, end=END, dim_at=None):
    pts = [(start, {"opacity": 0}), (start + FADE, {"opacity": 1})]
    if dim_at:
        pts += [(dim_at, {"opacity": 1}), (dim_at + FADE, {"opacity": 0.3})]
    last = 0.3 if dim_at else 1
    pts += [(end, {"opacity": last}), (end + FADE, {"opacity": 0})]
    return keyframes(pts)


def windows(spans):
    """Opacity 1 during each (start, end) span, 0 between them."""
    pts = []
    for start, end in spans:
        pts += [(start, {"opacity": 0}), (start + FADE, {"opacity": 1}),
                (end, {"opacity": 1}), (end + FADE, {"opacity": 0})]
    return keyframes(pts)


def move(start, end, frm, to, hide_after=0.6):
    fx, fy = frm
    tx, ty = to
    tr = lambda x, y: {"transform": f"translate({x}px,{y}px)"}
    return keyframes([
        (start - 0.01, {"opacity": 0, **tr(fx, fy)}),
        (start, {"opacity": 1, **tr(fx, fy)}),
        (end, {"opacity": 1, **tr(tx, ty)}),
        (end + hide_after, {"opacity": 0, **tr(tx, ty)}),
    ])


def text(x, y, s, cls="t", anchor="start", extra=""):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}" {extra}>{escape(s)}</text>'


def group(cls, inner):
    body.append(f'<g class="{cls}">{inner}</g>')


# ---------- static frame ----------
body.append(f'<rect width="{W}" height="{H}" class="bg"/>')
body.append(text(20, 28, "research:design — one research, end to end", "title"))

PHASES = [
    ("1 Problem", [(S["p1"], S["p2a"])]),
    ("2 Requirements", [(S["p2a"], S["p3"]), (S["p2b"], S["p6"])]),
    ("3 Options", [(S["p3"], S["p4"])]),
    ("4 Evaluate", [(S["p4"], S["p5"])]),
    ("5 Report", [(S["p5"], S["p2b"])]),
    ("6 Decision", [(S["p6"], END)]),
]
for i, (label, spans) in enumerate(PHASES):
    x = 20 + i * 145
    body.append(f'<rect x="{x}" y="42" width="137" height="24" rx="12" class="pill"/>')
    body.append(text(x + 68, 58, label, "pilltext", "middle"))
    group(windows(spans), f'<rect x="{x}" y="42" width="137" height="24" rx="12" class="pillon"/>'
          + text(x + 68, 58, label, "pilltexton", "middle"))

PANELS = [(20, 230, "Chat"), (265, 310, "Researcher's tools and subagents"), (590, 290, "Files")]
for x, w, label in PANELS:
    body.append(text(x + 4, 92, label, "panelhead"))
    body.append(f'<rect x="{x}" y="100" width="{w}" height="440" rx="8" class="panel"/>')

body.append(f'<rect x="590" y="580" width="22" height="12" rx="3" class="box"/>'
            f'<rect x="593" y="583" width="16" height="6" rx="2" class="box"/>')
body.append(text(618, 590, "double border = fresh subagent, never sees the chat", "small"))

# ---------- chat ----------
def bubble(y, lines, start, end, who="claude"):
    h = 10 + 14 * len(lines)
    x, w = (55, 185) if who == "user" else (30, 195)
    inner = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" class="{who}"/>'
    for i, line in enumerate(lines):
        inner += text(x + 8, y + 17 + 14 * i, line, "chat")
    group(window(start, end), inner)


p1, p2a, p3, p4, p5, p2b, p6 = (S[k] for k in ("p1", "p2a", "p3", "p4", "p5", "p2b", "p6"))

bubble(110, ["Let's use X for Y."], 0.5, p2a, "user")
bubble(140, ["What exists now, and what", "goes wrong with it?"], p1 + 2, p2a)
bubble(186, ["Today we …; it breaks when …"], p1 + 3.2, p2a, "user")
bubble(218, ["The problem, as I understand it:", "… Is that right?"], p1 + 5, p2a)
bubble(264, ["Yes, confirmed."], p1 + 6, p2a, "user")
bubble(110, ["R2 names a mechanism: reworded", "as a need; the mechanism", "becomes option O2."], p2a + 0.3, p3)
bubble(110, ["Problem confirmed. Looking for", "options before judging any."], p3 + 0.3, p5)
bubble(156, ["Leader drafted; putting the", "draft through its real use."], p4 + 2, p5)
bubble(110, ["Round 1 report: what changed,", "recommendation, runner-up,", "what the checks found."], p5 + 6, p6)
group(window(p5 + 7, p6),
      '<rect x="30" y="172" width="195" height="74" rx="8" class="card"/>'
      + text(38, 189, "Q1 (R3, unverified) Must it …?", "chat")
      + text(38, 205, "○ yes, a must   ○ no", "chatmuted")
      + text(38, 223, "Remarks", "chat")
      + text(38, 238, "○ none   ○ below", "chatmuted"))
bubble(254, ["Q1: no. Remarks: it must also …"], p2b, p6, "user")
bubble(286, ["R3 dropped; your remark adds", "R5. Re-scoring."], p2b + 1.3, p6)
bubble(332, ["Round 2: options, checks, report,", "questions … nothing new turns", "up, so the rounds stop."], p2b + 4, p6)
bubble(110, ["Decision (draft): choice, why,", "rejected, gaps, plan."], p6 + 1.5, END)
bubble(156, ["Agreed."], p6 + 4, END, "user")
bubble(188, ["Decision reviewed.", "Implementing step 1."], p6 + 6, END)

# ---------- tools and subagents ----------
def box(y, h, title, sub, start, dim_at=None, agent=False, dashed=False):
    x, w = 280, 280
    cls = "box dashed" if dashed else "box"
    inner = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" class="{cls}"/>'
    if agent:
        inner += f'<rect x="{x + 3}" y="{y + 3}" width="{w - 6}" height="{h - 6}" rx="4" class="{cls}"/>'
    inner += text(x + 12, y + 15, title, "boxtitle")
    if sub:
        inner += text(x + 12, y + 28, sub, "small")
    group(window(start, dim_at=dim_at), inner)


box(110, 34, "skill: research:problem-formulation", "starts the log, asks about situation + requirements", p1, p2a)
group(window(p3 + 0.5, dim_at=p4), text(282, 166, "given only Problem + Requirements and a lens:", "small"))
box(172, 34, "generator · own field", "blind to the project", p3 + 0.5, p4, agent=True)
box(210, 34, "generator · far field, same purpose", "one per lens", p3 + 0.8, p4, agent=True)
box(248, 34, "generator · own field + project code", "only for a large problem in a project", p3 + 1.1, p4,
    agent=True, dashed=True)
for y in (172, 210, 248):
    group(window(p3 + 3, p3 + 5.5), text(552, y + 15, "working…", "working", "end"))
box(290, 22, "scripts/add-candidates.py → a row per option", None, p3 + 7, p4)
box(320, 22, "scripts/log-sections.py → one extract per check", None, p4 + 4, p5)
box(350, 34, "bias check", "not told the leader; sees no verdicts", p4 + 5.8, p5, agent=True)
box(388, 34, "rejection check", "told the leader; tests each rejection", p4 + 6, p5, agent=True)
box(436, 34, "hook: round-gate.py", "on the question tool: blocks until the checklist is done", p5 + 4, p6)
group(window(p5 + 5.5, dim_at=p6), text(552, 451, "✓ allowed", "good", "end"))
box(490, 28, "Implement, step by step", None, p6 + 6.5)

# ---------- files ----------
FX = 602
group(window(p1 + 0.3), text(FX, 122, "<notes>/", "file"))
group(window(p1 + 0.5), text(FX + 12, 142, "<topic>.md", "filebold") + text(FX + 100, 142, "the research log", "small"))
SECTIONS = ["Problem", "Situation", "Requirements", "Options", "Matrix", "Evaluation",
            "Sources", "Round checklist", "Rounds", "Decision"]
SY = {name: 162 + 18 * i for i, name in enumerate(SECTIONS)}
for name, y in SY.items():
    group(window(p1 + 0.5), text(FX + 24, y, "## " + name, "section"))

BADGES = {
    "Problem": [("need, no solution words", p1 + 1, p1 + 6.5), ("✓ confirmed by the user", p1 + 6.5, END)],
    "Situation": [("facts: read or assumed", p1 + 2, END)],
    "Requirements": [("R1–R4: reason, priority", p1 + 3.5, p2a + 1), ("R2 reworded as a need", p2a + 1, p2b + 1.5),
                     ("R3 dropped, R5 added", p2b + 1.5, END)],
    "Options": [("O1: the user's proposal", p1 + 4.5, p2a + 1.8), ("+ O2 from R2's mechanism", p2a + 1.8, p3 + 8.5),
                ("+ F1–F9 from generators", p3 + 8.5, p3 + 10), ("+ do nothing, libraries…", p3 + 10, END)],
    "Matrix": [("✓ ✗ ~ ? per requirement", p4 + 0.5, p2b + 3.5), ("re-scored with R5", p2b + 3.5, END)],
    "Evaluation": [("rejection records, harms", p4 + 1.5, p4 + 10), ("+ the checks' findings", p4 + 10, END)],
    "Sources": [("claims cross-checked", p3 + 10.5, END)],
    "Round checklist": [("0 / 21 ticked", p5, p5 + 1.2), ("9 / 21 ticked", p5 + 1.2, p5 + 2.4),
                        ("21 / 21 ✓", p5 + 2.4, END)],
    "Rounds": [("R1: ranking change", p5 + 3.5, p2b + 5.5), ("R2: no change → stop", p2b + 5.5, END)],
    "Decision": [("Draft", p6 + 0.5, p6 + 5.5), ("Reviewed ✓", p6 + 5.5, END)],
}
for name, badges in BADGES.items():
    for label, start, end in badges:
        group(window(start, end), text(FX + 150, SY[name], label, "badge"))

group(window(p5 + 3.5), text(FX + 12, 356, "<topic>.rounds.md", "filebold"))
group(window(p5 + 3.5, p2b + 5.5), text(FX + 150, 356, "## Round 1", "badge"))
group(window(p2b + 5.5), text(FX + 150, 356, "## Round 1, ## Round 2", "badge"))
group(window(p2b + 2.8), text(FX + 150, 369, "## Dropped: R3", "badge"))
group(window(p3 + 5.5), text(FX + 12, 388, "<topic>.discovery/", "filebold") + text(FX + 150, 388, "generator reports", "small"))
REPORTS = [("own-field.md", 404), ("far-field.md", 420), ("project.md", 436)]
for i, (name, y) in enumerate(REPORTS):
    group(window(p3 + 6 + 0.2 * i), text(FX + 24, y, name, "file"))
group(window(p4 + 2.5), text(FX, 466, "<scratch>/", "file") + text(FX + 12, 482, "leader-draft/", "filebold")
      + text(FX + 150, 482, "outside the project", "small"))
group(window(p4 + 4.6), text(FX, 506, "/tmp/", "file"))
group(window(p4 + 4.8, dim_at=p5), text(FX + 12, 520, "bias extract", "filebold")
      + text(FX + 112, 520, "no Matrix, Evaluation, Verdict", "small"))
group(window(p4 + 5.1, dim_at=p5), text(FX + 12, 534, "rejection extract", "filebold")
      + text(FX + 150, 534, "+ who leads", "small"))

# ---------- moving chips ----------
def chip(label, start, end, frm, to, kind="chip"):
    w = 7 * len(label) + 14
    inner = (f'<rect x="{-w / 2}" y="-9" width="{w}" height="18" rx="9" class="{kind}"/>'
             + text(0, 4, label, "chiptext", "middle"))
    group(move(start, end, frm, to), inner)


chip("mechanism → option", p2a + 0.8, p2a + 1.8, (700, 190), (700, 208))
for i, y in enumerate((189, 227, 265)):
    chip("Problem + Requirements", p3 + 1.4 + 0.3 * i, p3 + 2.9 + 0.3 * i, (680, 198), (430, y))
for i, (y_gen, y_file) in enumerate(((189, 400), (227, 416), (265, 432))):
    chip("report", p3 + 5 + 0.2 * i, p3 + 6.2 + 0.2 * i, (500, y_gen), (700, y_file))
for i in range(3):
    chip("F-option rows", p3 + 7.6 + 0.3 * i, p3 + 8.5 + 0.3 * i, (680, 416), (680, 216))
chip("extract", p4 + 4.3, p4 + 4.9, (690, 230), (690, 516))
chip("extract + leader", p4 + 4.6, p4 + 5.2, (690, 230), (690, 530))
chip("bias extract", p4 + 5.9, p4 + 7, (660, 516), (440, 367))
chip("rejection extract", p4 + 6.1, p4 + 7.2, (660, 530), (440, 405))
chip("findings", p4 + 9, p4 + 10, (440, 367), (680, 252), "chipgood")
chip("findings", p4 + 9.2, p4 + 10.2, (440, 405), (680, 252), "chipgood")
chip("Round 1 entry", p5 + 3, p5 + 3.6, (680, 306), (680, 352))
chip("R3 row", p2b + 2, p2b + 2.8, (690, 194), (690, 366))

# ---------- captions ----------
CAPTIONS = [
    (0, p1, "A design question arrives in the chat."),
    (p1, p2a, "Phase 1 · problem-formulation starts the log and confirms the problem with the user."),
    (p2a, p3, "Phase 2 · each requirement is a need with a reason and priority; a mechanism in one becomes an option."),
    (p3, p3 + 7, "Phase 3 · fresh generator subagents, given only Problem + Requirements, look for options."),
    (p3 + 7, p4, "Each report is saved; add-candidates.py makes every option its own row. Then the researcher adds its own."),
    (p4, p4 + 4, "Phase 4 · score every option, write rejection records and harms, draft the leader."),
    (p4 + 4, p5, "log-sections.py cuts one extract per check: the bias check never learns which option leads."),
    (p5, p5 + 6, "Phase 5 · the round checklist is ticked; the round-gate hook blocks questions until it is done."),
    (p5 + 6, p2b, "The report and the questions go to the user, with Remarks last."),
    (p2b, p2b + 3.5, "Phase 2 again · the answers drop, add or replace requirements; dropped rows move to rounds.md."),
    (p2b + 3.5, p6, "Next round: re-score, new options, checks, report. Rounds stop when nothing new turns up."),
    (p6, p6 + 6.5, "Phase 6 · the decision is drafted and reviewed in open chat."),
    (p6 + 6.5, END, "Only after the review: implement, step by step."),
]
for start, end, s in CAPTIONS:
    group(window(start, end), text(W / 2, 566, s, "caption", "middle"))

STYLE = """
:root{--bg:#ffffff;--panel:#f6f8fa;--border:#d0d7de;--text:#1f2328;--muted:#656d76;--accent:#0969da;
--accent-bg:#ddf4ff;--good:#1a7f37;--good-bg:#dafbe1;--user:#8250df;--user-bg:#fbefff}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--panel:#161b22;--border:#30363d;--text:#e6edf3;
--muted:#8b949e;--accent:#4493f8;--accent-bg:#0c2d6b;--good:#3fb950;--good-bg:#0f3d1e;--user:#a371f7;--user-bg:#2c1d4a}}
text{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;fill:var(--text)}
.bg{fill:var(--bg)}
.title{font-size:16px;font-weight:600}
.panelhead{font-size:12px;font-weight:600;fill:var(--muted)}
.panel{fill:var(--panel);stroke:var(--border)}
.pill{fill:none;stroke:var(--border)}
.pillon{fill:var(--accent);stroke:var(--accent)}
.pilltext{font-size:11px;fill:var(--muted)}
.pilltexton{font-size:11px;fill:#fff;font-weight:600}
.chat{font-size:11px}
.chatmuted{font-size:11px;fill:var(--muted)}
.claude{fill:var(--bg);stroke:var(--border)}
.user{fill:var(--user-bg);stroke:var(--user)}
.card{fill:var(--bg);stroke:var(--accent);stroke-width:1.5}
.box{fill:var(--bg);stroke:var(--accent)}
.dashed{stroke-dasharray:4 3}
.boxtitle{font-size:11px;font-weight:600}
.small{font-size:10px;fill:var(--muted)}
.working{font-size:10px;fill:var(--accent);font-style:italic}
.good{font-size:11px;fill:var(--good);font-weight:600}
.file,.filebold,.section{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}
.filebold{font-weight:600}
.section{fill:var(--muted)}
.badge{font-size:10px;fill:var(--accent)}
.chip{fill:var(--accent-bg);stroke:var(--accent)}
.chipgood{fill:var(--good-bg);stroke:var(--good)}
.chiptext{font-size:10px;font-weight:600}
.caption{font-size:13px}
"""

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">'
       '<title>research:design workflow</title>'
       '<desc>Animated walk through one design research: the chat, the tools and subagents, and the files each step writes.</desc>'
       f'<style>{STYLE}{"".join(css)}</style>{"".join(body)}</svg>')
out = Path(__file__).with_name("design-flow.svg")
out.write_text(svg, encoding="utf-8")
print(out)
