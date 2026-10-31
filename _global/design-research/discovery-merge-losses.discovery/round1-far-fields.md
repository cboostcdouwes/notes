# Round 1 generator: far fields (systematic reviews, law, medicine, procurement, intelligence, audit, SAR, nature)

Worked out:
F1. Candidate flow register (PRISMA / NEPA): every candidate from any source ends as compared, dropped (reason, requirement) or merged; flow count line at the comparison. ~25 tok/option/round + ~80/round.
F2. Mandatory baseline rows (Green Book BAU / do-minimum, NEPA no-action): fixed rows "platform's documented recommendation", "field default", "do nothing"; an unfillable row says why. 1-3 lookups round 1 (~1.5-4k tok).
F3. Standard of care, comply-or-explain: the conventional answer is the default; another option outranks it only by naming the requirement it beats it on; review objections too. ~40 tok/non-default option/round.
F4. Completeness tracing at hand-off (audit): end-of-round pass over raw material (search results, subagent reports, user messages), every named candidate traced into the comparison. ~3-15k in, 1-2k out, 30-120 s/round.
F5. Criteria-locked evaluation (FAR 15.305, Kepner-Tregoe): ranks only from per-requirement ratings; uncovered gains "unscored"; a review objection maps to a requirement or becomes a new verified one, then all options re-scored. ~100 tok/option/round.
F6. Blind-audition scorer: subagent ranks normalised, shuffled options without provenance, timing or note volume; ranks shown side by side. ~150 tok/option + 2-6k/round.
F7. ACH matrix with equal scrutiny: each finding checked against every option; non-diagnostic findings flagged; thin columns "under-examined". ~80 tok/option/round + 0.5-2k per gap filled.
F8. Search-effort ledger (SAR POA/POD): effort spent and chance-best shown separately; rank only on the second; next checks where chance × under-examined is highest. ~20 tok/option/round.

Other titles: ballot rotation (never discovery order); devil's advocate for the strongest dropped option; honeybee quorum; pre-registration of criteria and baselines; double-entry reconciliation; chain-of-custody log; red team naming the option the user would bring; patent prior-art search for "the standard way"; M&M conference after a user-found miss; pilot's before-comparison checklist; second opinion (independent first-line recommendation); jury instruction; sealed bids; immune negative selection of rank reasons.

Sources: prisma-statement.org/prisma-2020-flow-diagram; 40 CFR 1502.14; Green Book 2020; acquisition.gov/far/15.305; Heuer, Psychology of Intelligence Analysis ch. 8; navcen.uscg.gov Theory_of_Search.pdf; nber.org/papers/w5903; accountingtools.com tracing; rmf.harvard.edu guideline deviation.
