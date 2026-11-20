# Goal-conditioned RL under real-world conditions: rounds

## Replaced requirements
| # | Requirement | Reason | Source | Replaced by (round) |
|---|---|---|---|---|
| R2 | Reaching a goal means an exact match, judged by the agent's own inference, not a tolerance around the goal | Claude's misreading of "a reward signal when an agent is close enough instead of an inferred exact match" | user's sentence, 2026-11-20, as read by Claude | R2c (user's correction, 2026-11-20) |
| R7 | Methods get a score that needs no ground truth, and separately a ground-truth score, usable in simulation, that checks the first | Rested on the agent's own verdict of success being the ground-truth-free score | user, 2026-11-20 ("Both, kept apart"), as read by Claude | R7b (2026-11-20) |
| R5 | Interaction has two phases: free exploration in which no goals are given, then evaluation on goals given only then | User: "I'd like to have a free-form exploration phase before evaluating on goals; goals are not provided by the environment during training rollouts" | user, 2026-11-20, as read by Claude | R5b (user: "Training and evaluation are not two separate phases", 2026-11-20) |
| R5b | Training and evaluation are one stream of interaction, not two phases; goals are not provided by the system | User: "Training and evaluation are not two separate phases"; reason not stated | user, 2026-11-20, as read by Claude | R5c (user: "Evaluation is done in separate environments and can be run at any time", 2026-11-20) |
| R4 | The learner can't freely put the system in a chosen start state | Real resets are costly or absent | user, 2026-11-20 | R4b (user: "The agent does not request a reset; the environment can reset the agent at any time without outside control", 2026-11-20) |

## Dropped requirements
| # | Requirement | Why it isn't one (user's reason) | Source | Round |
|---|---|---|---|---|
| R13 | What a goal is, and what the match with it is exact in, is a parameter of the statement: full observations, parts of them and goals in a latent space all fit | User: "Partial or latent space goals are removed, simplify further." (no reason given beyond simplicity) | user, 2026-11-20 | 2026-11-20 |
| R3 | The total amount of interaction is bounded, and the bound is part of the problem | User: "Completely remove the budget." (no reason given; the original request did name "limited rollouts") | user, 2026-11-20 | 2026-11-20 |
