# Round 1 generator: own field (LLM agent workflows, multi-agent systems, decision analysis)

Worked out:
W1. Candidate ledger with dispositions (PRISMA flow): ID on arrival from any source (generator, search, user, objection); ends "compared" or "dropped: reason"; count line "found 14, compared 6, dropped 8"; counts reconcile. ~30-80 tok/option + 0.5-1k reconcile.
W2. Mandatory reference rows (Green Book + Pugh datum): one dedicated lookup "what does the platform / canonical guide recommend"; fixed row plus do-minimum; others scored better/same/worse than the datum; "none found, searched X" said. ~3-8k tok, <1 min.
W3. Musts gate + requirement-cited scoring sheet (Kepner-Tregoe, bidirectional traceability): every rank-moving cell names its requirement; reasons without one flagged and removed; requirements no option was scored on flagged; objections through the same sheet. ~3-10k tok/round.
W4. Blinded, order-swapped pairwise judge subagent (MT-Bench swap rule, Idea Arena): anonymised shuffled cards, pairwise both orders; shown beside the researcher's rank. ~25-55k tok, 1-4 min; N².
W5. Equal-evidence option cards: same fields, length and minimum evidence; unknown is "unknown", never worse; under-checked options topped up or marked. 2-6k tok/top-up.
W6. Dominance filter + even swaps (Hammond, Keeney, Raiffa): remove only dominated options, listed with their dominator; show the non-dominated set with trade-offs as swaps; no weights. ~2-6k tok/round.
W7. Objection re-entry loop (ACH diagnosticity): a review objection or named option goes back through ledger and cards; tied to a requirement or a new one confirmed; diagnosticity checked; rank recomputed. ~1-4k + 1-3k/objection.
W8. Generate-dedupe-tournament-evolve loop (AI co-scientist): proximity clustering, Elo tournament judged on requirements, evolution agent. ~60-200k tok, 5-15 min/round.
L5 note: per-option cost measurable from subagent/tool usage reports (~20 tok/option bookkeeping).

Other titles: pre-review self-audit "what would the user say is missing" (weak, Huang et al. 2310.01798); red-team agent "find better than the leader"; outside-view/reference class "what did others with this need use"; Keeney value-focused brainstorming per requirement; judge from another model family; premortem "the user found a better option; which?"; Delphi rounds; randomised presentation order; ranking-reason lint (phrases "first found", "as you suggested", "bonus"); MADR considered options with "rejected because"; report generator coverage (each lens, how many survived); show all, rank none; ask the user's expected answer first, blinded; two-pass review (short "about to compare" list first); stop rule: until a round adds no non-dominated option.

Sources: casrai PRISMA; Green Book reviewers checklist; innovation.world pugh-matrix; valuebasedmanagement KT; arxiv 2306.05685, 2410.13185, 2601.15436, 2502.18864, 2411.14483, 2402.06918; sal.aalto.fi even swaps; adr.github.io/madr; uptrace llm-cost-monitoring.
