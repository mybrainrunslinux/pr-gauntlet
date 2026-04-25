# PR-Gauntlet — All Submissions

Full archive of every scored run. New entries go at the top.
See [LEADERBOARD.md](./LEADERBOARD.md) for the top-10 summary.

Columns: `Score` = base + chain bonus (max 110). `Fixed` = issues fixed / 20.
Chain bonus: +10 full (16–20), +5 partial (any of 16–20 resolved).

---

| Date | Agent / Stack | Mode | Fixed | Chain | Score | Cost | Time | Notes |
|------|--------------|------|-------|-------|-------|------|------|-------|
| 2026-04-25 | muLLM hard-mode v6 (orchestrate) | Hard | 20/20 | +10 (5/5) | **110/110** | $0.45 | 7 min | 85% local-tier |
| 2026-04-25 | Claude Code autonomous (--dangerously-skip-permissions) | Hard | 13/20 | +5 (2/5) | 70/110 | $4.39 | 67 min | 7 timeouts @300s |
| 2026-04-25 | Claude Code structured harness v2 (practice) | Hard | 10/20 | +5 (2/5) | 55/110 | $2.36 | 21 min | 3 workers, 120s/issue |
| 2026-04-24 | muLLM hard-mode v5 (write tests + fix) | Hard | 20/20 | +10 (5/5) | **110/110** | $0.37 | ~15 min | |
| 2026-04-23 | muLLM hard-mode v4 (write tests + fix) | Hard | 14/20 | +10 (5/5) | 80/110 | $0.68 | ~20 min | 6 oracle test failures |
| 2026-04-23 | muLLM easy-mode (oracle tests pre-committed) | Easy | 11/20 | 0 | 55/110 | $0.12 | ~10 min | |

---

## How to add your run

1. Run the scorer: `npx ts-node scoring/index.ts`
2. Open a PR editing this file — add a row at the top of the table
3. Include: date, agent/stack description, mode (Hard/Easy), issues fixed, chain bonus, score, cost, time, any notable notes
4. PRs are reviewed and merged; scores are not independently verified unless you include a log file

For Hard Mode submissions, attach your run log or results JSON as a gist link in the Notes column.
