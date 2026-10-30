---
name: problem-formulation
description: Understand a problem together with the user before any solution is explored. Restates the request without its proposed solution, takes stock of the user's situation (what exists now, what is wrong with it, time horizons, what they value, what it is part of), inventories the requirements with their reasons and verifies the deciding ones, and ends with a problem statement the user has confirmed. Use it only when another skill calls for it, or when the user asks to frame or pin down a problem before solving it. Don't use it on your own initiative for a request, a bug or a question whose problem is already clear.
---

# Problem formulation

Understand the problem with the user before anyone looks for a solution. A frame built alone anchors every option
after it, and facts only the user has (what they have, what is wrong with it, what they value) otherwise arrive as
objections to a draft, or never.

No solutions here: no search for options, no generator agents, no drafts, no recommendation. Reading the project and
looking up facts about the situation is fine. A solution the user proposed is recorded as theirs, unjudged.

## Where it writes

A research log (format: PENDING, see the review question), where the user's or the project's instructions put
notes; resume one whose *Problem* matches. This skill fills *Problem*, *Situation*, *Related decisions*, *Success
criteria*, *Requirements* and *Open questions*; a skill that called it continues the same log.

## Steps

1. **Read first**: the request, the project, the notes, earlier logs, what the design already decided and why. Never
   ask what these answer; ask to confirm what you read instead.
2. **Restate the problem without the proposed solution** ("use Redis for sessions" becomes "sessions survive a
   restart and are shared by N instances"). Record the proposal under *Problem* as the user's proposal.
3. **Write the situation as you understand it**, each fact marked with where you read it, or "assumed".
4. **Ask about the situation**, as much as step 3 left open. When reading answered every point below, go straight to
   step 6: the problem written back and one confirmation question. Otherwise ask each point step 3 marked "assumed"
   or left out, in this order; a request that reads clear can still hide its situation:
   - what exists now (what they have, what they already use), and how and where it is used;
   - what is wrong with it: for whom, how often, since when;
   - when it has to work, for how long, and what comes after (time horizons);
   - what they value beyond the stated need (cost, effort, looks, learning, ...);
   - what it is part of, and what it waits on or blocks;
   - what happens if nothing is done.
5. **Inventory the requirements** (`requirements.md`): each a need with its reason, source, priority and whether it is
   verified. Ask about the deciding unverified ones before the hand-over.
6. **Write the problem back** as one block: problem, situation, what it is part of, success criteria, deciding
   requirements, out of scope. Ask the user to correct it, and what it leaves out that they would miss.
7. **Repeat** steps 4-6 until the user confirms the block without corrections. Then make the first line under
   *Problem*: `Confirmed by the user: <date>`.

Ask steps 4-6 in as few calls as the answers allow: when step 3 left nothing open, one call holds the write-back,
the deciding requirements and the confirmation. Ask through the question tool, with a last question headed
"Remarks". For a situation question the options name kinds of answer ("Something exists but falls short", "Nothing
yet"), never a guess at the user's facts. Don't answer your own questions with defaults: an assumption picked for the user is exactly what
this skill exists to find.

## Hand-over

- Called by another skill: return to it with the confirmed log.
- Asked for by the user: stop after the confirmation and offer the next step (a design research, a fix, nothing).

A later answer that changes the problem removes the confirmation line; run steps 4-7 again for what changed.
