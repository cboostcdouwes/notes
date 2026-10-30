# Draft: changes to design-research for the split

## SKILL.md
- Description: drop "Separates the problem from the proposed solution, ranks requirements by MoSCoW ..."; add "starts
  with the problem-formulation skill".
- Phase 1 and Phase 2 (lines 41-68, ~430 words) become:

  ```
  ## Phase 1: The problem
  Run the problem-formulation skill first, unless the log's *Problem* starts with "Confirmed by the user". Nothing
  of Phase 3 runs before that line exists. During the rounds, new and changed
  requirements follow `../problem-formulation/requirements.md`; an answer that changes *Problem* removes the line
  and goes back to problem-formulation for what changed.
  ```
- Round checklist: "Problem and success criteria (first round)" becomes "Problem: confirmed by the user (line in
  *Problem*)". The requirement items stay: requirements still change during the rounds.
- Phases renumbered.

## Files
- `requirements.md` moves to `problem-formulation/` (design-research refers to it there).
- `log-template.md`: adds a *Situation* section after *Problem*, and the confirmation line.
- No new hook (user, round 2). The round checklist's item "Problem: confirmed by the user" is enforced by the
  existing round gate like every other item, at the first round's question call.
- `README.md`: flowchart starts with problem-formulation.

## Size
SKILL.md core: about -280 words (~-690 tokens), from ~4,723 to ~4,030 estimated tokens.
problem-formulation/SKILL.md: ~620 words (~1,000 tokens).
