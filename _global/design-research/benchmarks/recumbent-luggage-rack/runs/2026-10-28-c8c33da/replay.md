# Replay: questions and answers

Every question the skill asked, with the options offered and the answer verbatim, in order. Calls 1-5 went through
the question tool (as JSON, gated by `round-gate.py`); from call 6 on the skill asked in free text after drafting the
decision. Answerer: an agent given only the ground truth and *Running*; the user decided missing facts and overruled
two answers (see `score.md`).

## Call 1
1. **Bike type** — "Which recumbent do you have (brand and model if you know it)? This decides which carriers fit at all (R4b)."
   Options: Two-wheeler, long or short wheelbase · Low racer / very low two-wheeler · Trike (tadpole or delta) · Model name below.
   **Answer:** Optima Baron
2. **Load** — "What will you carry, and how heavy is it typically? (R3)"
   Options: Light: commute/shopping, under ~10 kg · Medium: weekend trips, ~10–20 kg · Heavy: touring/camping, over 20 kg · Bulky but light (e.g. a crate).
   **Answer:** Two bags, under 15 kg
3. **Mounts** — "Does your bike already have threaded rack holes, or does the maker sell a rack/fit kit for it? (R4b, R2b)"
   Options: Yes, holes or a maker rack · No holes, no maker rack · Don't know.
   **Answer:** Yes, holes or a maker rack
4. **Riding** — "How do you ride loaded: is stable handling at speed (fast descents, traffic) important? (R1)"
   Options: Yes, fast or hilly rides · Mostly slow, flat, short trips.
   **Answer:** Handling must stay safe
5. **Remarks** — "Anything else: budget, fitting it yourself vs a shop, keeping gear dry or theft-safe when parked (R7b, R8)?"
   Options: No remarks · Remarks below.
   **Answer:** No remarks

Leader at the time of asking: O9 (underseat rack + light rear rack), provisional; O2, O1 runners-up.

## Call 2
1. **Rack/holes** — "Do you already have Optima's own Baron rack, or does the bike only have threaded holes? (An older review says the Baron has no rack eyelets.)"
   Options: I have the Optima rack · Threaded holes, no rack · No holes after all · Not sure.
   **Answer:** Threaded holes, no rack
2. **Your bags** — "What are your two bags: panniers with rack hooks, or something else? (R3c)"
   Options: Panniers with hooks · Other bags / open to new bags.
   **Answer:** Panniers with hooks
3. **Frame** — "How careful must the solution be with the frame and seat: no clamps, drilling or welding? (R2b)"
   Options: No risk to the frame at all · Small marks are fine.
   **Answer:** No permanent changes to the bike
4. **Room** — "On your bike, is there clearly no room for bags under the seat or beside the front wheel? (O2, O9, O10)"
   Options: No room · Some room under the seat · Don't know.
   **Answer:** Depends on the bag(s)
5. **Remarks** — "Anything else?"
   Options: No remarks · Remarks below.
   **Answer:** No remarks

Leader at the time of asking: O1 (Optima's own Baron rack); O12 (Optima Lowracer bag) runner-up.

## Call 3
1. **Holes** (multi-select) — "Where are the threaded holes on your Baron? This decides whether a universal rack's legs and struts can reach them (R4b)."
   Options: At the rear dropouts (by the axle) · On the seat bracket or behind the seat · Elsewhere / not sure.
   **Answer:** At the rear dropouts (by the axle), On the seat bracket or behind the seat
2. **Time frame** — "How soon do you need it? An Optima rack would be second-hand and none is listed now (R10)."
   Options: Soon (weeks) · I can wait a few months.
   **Answer:** Optima made no rack for the Baron
3. **Fitting** — "Do you want to fit it yourself, or have a recumbent dealer fit or adapt it? (R7b)"
   Options: Myself · A dealer · Either.
   **Answer:** Myself
4. **Clearance** — "Are heel clearance and getting on and off a hard limit for you, or just nice to have? (R5)"
   Options: Hard limit · Nice to have.
   **Answer:** Hard limit
5. **Remarks** — "Anything else (keeping your current panniers, quick removal, rain or theft)?"
   Options: No remarks · Remarks below.
   **Answer:** No remarks

Leader at the time of asking: O3 (universal rack on the threaded holes); O1, O16 (custom rack) runners-up.

## Call 4
1. **Budget/wait** — "Which matters more to you: a cheap rack you can buy now (about €50–150, but the fit must be measured first), or a custom rack made for your Baron (exact fit, likely more expensive and weeks of waiting)? (R10)"
   Options: Cheap and now · Sure fit, can wait and pay more.
   **Answer:** don't know
2. **Seat holes** — "Do you know what the threaded holes on the seat bracket are for? The Optima manual has a section 'Fitting the Seat and Rack', which suggests they were made for a rack."
   Options: Made for a rack / accessories · Part of the seat mounting · Don't know.
   **Answer:** Part of the seat mounting
3. **Decision** — "Draft decision: a Topeak Uni Super Tourist DX 2.0 (26 kg, adjustable legs) bolted to the dropout and seat-bracket holes; measure first with fitting-plan.md; a custom bolt-on rack if the seat leaves no room. Rejected: clamps, seat mounts, welding (permanent), underseat/front racks (no Baron product), the Optima bag (unknown capacity), trailer, backpack. Is this right?"
   Options: Yes · No / change something.
   **Answer:** Those bolts are too far forward for a stable strut from the rack
4. **Extras** (multi-select) — "Do any of these matter to you: taking the bags off quickly, keeping them dry or theft-safe, keeping your current panniers? (R6, R8, R9)"
   Options: Quick removal · Dry / theft-safe · Keep my panniers · None of these.
   **Answer:** Keep my panniers
5. **Remarks** — "Anything else?"
   Options: No remarks · Remarks below.
   **Answer:** No remarks

Leader at the time of asking: O3 (Topeak Uni Super Tourist DX 2.0, struts to the seat-bracket holes), draft decision; O16 runner-up.

## Call 5
1. **Rear stays** — "Does your Baron have stays (tubes) running from the rear dropouts up towards the frame, at about the height where a rack top would sit? If so, roughly how thick are they? This decides between clamping the rack's struts to them (O3s) and a custom rack (O16)."
   Options: Yes, round stays (give diameter in notes) · Yes, but odd shape or very thin · No stays there · Not sure.
   **Answer:** The rear fork tubes are round; diameter: don't know
2. **Manual** — "Do you have the Optima Baron manual? Its section 'Fitting the Seat and Rack' (pages 11–12, not readable online) would show where Optima attached its own rack."
   Options: Yes, I'll look · No manual.
   **Answer:** The manual's rack pages show a different bike
3. **Clamps OK?** — "Are rubber-lined clamps on the stays acceptable under 'no permanent changes'? They come off without a trace when fitted correctly, but overtightening can dent thin aluminium. (R2b)"
   Options: Yes, carefully fitted · No clamps at all.
   **Answer:** Yes, carefully fitted
4. **Remarks** — "Anything else?"
   Options: No remarks · Remarks below.
   **Answer:** No remarks

Leader at the time of asking: O3s (universal rack, struts clamped to the rear stays); O16 otherwise.

## Call 6
Free text after the drafted decision. Request:
> **Please review in your own words:** do the *Why* and *Rejected* reasons match yours, and is anything wrong or missing? If you agree, I'll mark the decision "Reviewed". An objection that changes the choice sends it back into another round.

**Answer:** The budget is low: under 50 euros.

Leader at the time of asking: O3s, drafted decision (Topeak rack, Tubus clamps on the rear fork tubes).

## Call 7
Free text after the drafted decision. Request:
> **Please review:** does this match what you want, and is anything wrong or missing? If it's right, I'll mark the decision as reviewed.

**Answer:** I already own another, sound rack that fits the lugs.

Leader at the time of asking: O3s with a budget rack (XLC/Procraft/ROSE).

## Call 8
Free text after the drafted decision. Request:
> **Please review:** does this match what you want, and is anything else missing? If not, I'll mark the decision as reviewed.

**Answer:** That rack has no struts of its own.

Leader at the time of asking: O3s with the user's own rack.

## Call 9
Free text after the drafted decision. Request:
> Two checks: was the rack made to stand without struts, or were they lost? Does the front of the rack top have a hole or tab for a strut? Please review: if you can answer the two checks and nothing else is missing, I'll mark the decision as reviewed.

**Answer:** Check 1: The struts that came with the rack are way too short to reach the frame's tubes. Check 2: Yes, the front of the rack top has holes/tabs for struts.

Leader at the time of asking: O3s with the user's rack and bought Tubus struts.

## Call 10
Free text after the drafted decision. Request:
> **Please review:** is the decision complete now? If so, I'll mark it as reviewed. After a few weeks of riding, tell me how it holds up: clamp slip, handling, clearance.

**Answer:** I have no easy access to a long strip of material.

Leader at the time of asking: O3s; struts: Tubus 350 mm or hardware-store strip.

## Call 11
Free text after the drafted decision. Request:
> 1. How long does each strut need to be? 2. Are your rack's own struts flat with holes, or round rods?

**Answer:** Q1: It is around about 35 cm. Q2: Round rods bent to 45 degrees, flat ends with holes through them.

Leader at the time of asking: O3s; struts: Tubus 350 mm, or lengthened own struts / perforated strip.

## Call 12
Free text after the drafted decision. Request:
> **Please review:** is the decision complete now? If so, I'll mark it as reviewed. After a few weeks of riding, tell me how it holds up: clamp slip, handling, clearance.

**Answer:** Yes, it's complete.

Leader at the time of asking: O3s with two Tubus 350 mm struts.

## Call 13
No question: the skill marked the decision "Reviewed (2026-10-28)" and ended the run.
