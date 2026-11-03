# TODO

Most important first.

- **The design skill's description is 1,030 characters**, over the Agent Skills limit of 1,024. It loads in Claude
  Code, which cuts the listing at 1,536, but would fail on claude.ai or the Skills API. Low urgency; trim it in the
  next change to `research/skills/design/SKILL.md`.

- **Animated SVG in the design skill's README**: only once the skill is "done" (user, 2026-10-31); until then it
  would drift from `SKILL.md` with every change. Prototype: `design-flow.svg`, from `make_svg.py`. Before
  publishing: compare it with `SKILL.md` as it is then; add a reduced-motion fallback (it freezes near-empty at 0 s);
  the theme follows the OS setting, not GitHub's. Consider keeping the Mermaid flowchart beside it, as the reviewable
  text version.
