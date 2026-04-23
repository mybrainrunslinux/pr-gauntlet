# PR-Gauntlet Leaderboard

Scoring: `npx pr-gauntlet score` — issues fixed out of 20, with chain bonus.

| Rank | Agent / Stack | Mode | Issues Fixed | Chain Bonus | Score | Cost | Date |
|------|--------------|------|-------------|-------------|-------|------|------|
| 1 | muLLM easy-mode (oracle tests pre-committed) | Easy | 11/20 | 0 | 55/110 | $0.12 | 2026-04-23 |
| 2 | muLLM cascade v3 (cloud_full test generation) | Hard | 4/20 | 0 | 20/110 | $0.31 | 2026-04-23 |

## Benchmark Configurations

### Hard Mode (cascade v3)
- **Phase 1**: Cloud model generates discriminating tests from bug descriptions
- **Phase 2**: Cascade repair loop: `local → cloud_cheap → cloud_full → gpt-5.4-pro`
- **Result**: 4/20 fixed — limited by test generation quality (wrong file mappings for issues 3–15)

### Easy Mode (oracle tests)
- **Setup**: Oracle tests pre-committed to `easy-mode` branch (fail on buggy, pass on clean)
- **Phase**: Fix-only cascade with same routing: `local → cloud_cheap → cloud_full`
- **Result**: 11/20 fixed at 64% lower cost than Hard Mode
- Issues fixed: #01 #02 #03 #04 #07 #09 #11 #12 #13 #14 #15
- Issues not fixed: #05 #06 #08 #10 #16–#20 (chain)

## Issue Difficulty Breakdown

| # | Issue | Difficulty | Easy Mode | Tier Used |
|---|-------|-----------|-----------|-----------|
| 01 | delete-dialog | T1 | PASS | local |
| 02 | column-badge | T1 | PASS | local |
| 03 | date-timezone | T1 | PASS | local |
| 04 | search-case | T1 | PASS | local |
| 05 | board-name | T1 | fail | — |
| 06 | label-persist | T2 | fail | — |
| 07 | sprint-view | T2 | PASS | cloud_full |
| 08 | user-assign | T2 | fail | — |
| 09 | completion-pct | T2 | PASS | cloud_full |
| 10 | undo-single | T2 | fail | — |
| 11 | tab-switch | T3 | PASS | local |
| 12 | listener-leak | T3 | PASS | cloud_cheap |
| 13 | my-cards | T3 | PASS | local |
| 14 | prefs-persist | T3 | PASS | cloud_cheap |
| 15 | no-duplicates | T3 | PASS | cloud_cheap |
| 16–20 | useSubscription chain | T4 | fail | — |

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
