# Cost of the run

The researcher session only, at list prices, from the last turn's cumulative `modelUsage`; the answerer and the relay are not counted.

| Model | Input | Cache read | Cache write | Output (of which thinking) | Web searches | Price |
|---|---|---|---|---|---|---|
| claude-opus-5-5 | 182 | 14,087,310 | 244,277 | 135,384 (16,010) | 0 | $7.48 |
| claude-haiku-5-5 | 434,531 | 0 | 0 | 29,920 (11,638) | 28 | $0.34 |
| claude-sonnet-5-5 | 52 | 395,655 | 218,919 | 10,897 (480) | 0 | $0.70 |
| **Total** | | | | | | **$8.51** |

| Turn | Session cost so far | Wall-clock |
|---|---|---|
| 1 | $1.04 | 3.3 min |
| 2 | $2.43 | 4.7 min |
| 3 | $3.44 | 2.7 min |
| 4 | $4.93 | 4.5 min |
| 5 | $5.97 | 2.6 min |
| 6 | $6.41 | 1.0 min |
| 7 | $6.95 | 1.2 min |
| 8 | $7.28 | 0.6 min |
| 9 | $7.66 | 0.7 min |
| 10 | $7.85 | 0.4 min |
| 11 | $8.11 | 0.5 min |
| 12 | $8.29 | 0.4 min |
| 13 | $8.51 | 0.3 min |
