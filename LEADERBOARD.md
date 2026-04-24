# PR-Gauntlet Leaderboard

Scoring: `npx ts-node ../scoring/index.ts` — issues fixed out of 20, with chain bonus.

| Rank | Agent / Stack | Mode | Issues Fixed | Chain Bonus | Score | Cost | Date |
|------|--------------|------|-------------|-------------|-------|------|------|
| 1 | muLLM hard-mode v4 (write tests + fix, GSD harness) | Hard | 14/20 | +10 | 80/110 | $0.68 | 2026-04-23 |
| 2 | muLLM easy-mode (oracle tests pre-committed) | Easy | 11/20 | 0 | 55/110 | $0.12 | 2026-04-23 |

## Benchmark Configurations

### Hard Mode v4 (muLLM GSD harness)
- **Setup**: Write discriminating tests + fix bugs from `v1-bugged` branch (no pre-committed tests)
- **Pipeline**: `cloud_full` test gen → full-clean oracle verification → retry oracle failures → cascade fix `local → cloud_cheap → cloud_full`
- **GSD techniques**: full-clean checkout oracle, oracle-failure retry with error feedback, warmup guard
- **Result**: 14/20 + chain 5/5 bonus → **80/110** at $0.68
- Issues fixed: #01 #02 #04 #06 #08 #09 #12 #13 #14 #16 #17 #18 #19 #20
- Issues not fixed: #03 #05 #07 #10 #11 #15 (oracle tests fail on clean code)

### Easy Mode (oracle tests)
- **Setup**: Oracle tests pre-committed to `easy-mode` branch (fail on buggy, pass on clean)
- **Phase**: Fix-only cascade with same routing: `local → cloud_cheap → cloud_full`
- **Result**: 11/20 fixed at 82% lower cost than Hard Mode v4
- Issues fixed: #01 #02 #03 #04 #07 #09 #11 #12 #13 #14 #15
- Issues not fixed: #05 #06 #08 #10 #16–#20 (chain)

## Issue Difficulty Breakdown

| # | Issue | Difficulty | Hard v4 | Easy Mode | Notes |
|---|-------|-----------|---------|-----------|-------|
| 01 | delete-dialog | T1 | PASS | PASS | local |
| 02 | column-badge | T1 | PASS | PASS | local |
| 03 | date-timezone | T1 | fail | PASS | oracle test fails on clean |
| 04 | search-case | T1 | PASS | PASS | local |
| 05 | board-name | T1 | fail | fail | oracle test fails on clean |
| 06 | label-persist | T2 | PASS | fail | local |
| 07 | sprint-view | T2 | fail | PASS | oracle test fails on clean |
| 08 | user-assign | T2 | PASS | fail | local |
| 09 | completion-pct | T2 | PASS | PASS | local |
| 10 | undo-single | T2 | fail | fail | generated test passes on buggy |
| 11 | tab-switch | T3 | fail | PASS | oracle test fails on clean |
| 12 | listener-leak | T3 | PASS | PASS | local |
| 13 | my-cards | T3 | PASS | PASS | local (oracle retry) |
| 14 | prefs-persist | T3 | PASS | PASS | local (oracle retry) |
| 15 | no-duplicates | T3 | fail | PASS | oracle test fails on clean |
| 16–20 | useSubscription chain | T4 | PASS (5/5) | fail | local fix, +10 bonus |

## Scoring Formula

```
base_score  = issues_fixed × 5
chain_bonus = +10 if all of issues 16–20 resolved
chain_bonus = +5  if issues 18–20 resolved (partial chain)
final_score = base_score + chain_bonus   (max 110)
```

## How to Submit

1. Fork this repo
2. Create a branch: `your-agent-name/attempt-1`
3. Work from `v1-bugged` branch (Hard Mode) or `easy-mode` branch (Easy Mode)
4. Fix as many issues as you can
5. Open a PR against `v1-bugged`
6. CI will run `pr-gauntlet score` and post results as a PR comment

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full submission guidelines.
