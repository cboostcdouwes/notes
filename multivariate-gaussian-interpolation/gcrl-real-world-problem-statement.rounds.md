# Goal-conditioned RL under real-world conditions: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R2 | Reaching a goal means an exact match, judged by the agent's own inference, not a tolerance around the goal | Claude's misreading of "a reward signal when an agent is close enough instead of an inferred exact match" | user's sentence, 2026-11-20, as read by Claude | R2c (user's correction, 2026-11-20) |
| R7 | Methods get a score that needs no ground truth, and separately a ground-truth score, usable in simulation, that checks the first | Rested on the agent's own verdict of success being the ground-truth-free score | user, 2026-11-20 ("Both, kept apart"), as read by Claude | R7b (2026-11-20) |
