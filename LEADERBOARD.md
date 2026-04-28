# PR-Gauntlet Leaderboard

Scoring: `npx ts-node ../scoring/index.ts` — issues fixed out of 20, with chain bonus.

> **Top 10 only** — full submission history is in the Benchmark Configurations section below. Once we exceed 10 entries, older results are archived there and only the top 10 by score (tiebreak: lower cost) stay in the main table.

| Rank | Agent / Stack | Mode | Issues Fixed | Chain Bonus | Score | Cost | Date |
|------|--------------|------|-------------|-------------|-------|------|------|
| 1 | TheEngOrg/attempt-1 (bywonton) | Hard | 20/20 | +10 | 110/110 | — | 2026-04-28 |
| 2 | muLLM hard-mode v6 (write tests + fix) | Hard | 20/20 | +10 | 110/110 | $0.45 | 2026-04-25 |
| 3 | muLLM hard-mode v5 (write tests + fix) | Hard | 20/20 | +10 | 110/110 | $0.37 | 2026-04-24 |
| 4 | muLLM hard-mode v4 (write tests + fix) | Hard | 14/20 | +10 | 80/110 | $0.68 | 2026-04-23 |
| 5 | Claude Code autonomous (dangerously-skip-permissions) | Hard | 13/20 | +5 | 70/110 | $4.39 | 2026-04-25 |
| 6 | Claude Code structured harness v2 (practice) | Hard | 10/20 | +5 | 55/110 | $2.36 | 2026-04-25 |
| 7 | muLLM easy-mode (oracle tests pre-committed) | Easy | 11/20 | 0 | 55/110 | $0.12 | 2026-04-23 |

## Benchmark Configurations

### Hard Mode v6 (muLLM orchestrate harness)
- **Setup**: Write discriminating tests + fix bugs from `v1-bugged` branch (no pre-committed tests)
- **Pipeline**: muLLM `/query/orchestrate` — parallel test gen + fix; cascade `local → cloud_cheap → cloud_full`
- **Result**: 20/20 + chain 5/5 bonus → **110/110** at $0.45 (85% local-tier, $0 for 17/20 issues)
- Issues fixed: #01 #02 #03 #04 #05 #06 #07 #08 #09 #10 #11 #12 #13 #14 #15 #16 #17 #18 #19 #20
- Timeouts: none

### Claude Code Autonomous (dangerously-skip-permissions)
- **Setup**: `claude -p "fix issue #N" --dangerously-skip-permissions --max-turns 30` per issue, 300s timeout, git worktree isolation
- **Pipeline**: CC reads issue description, explores repo, writes tests, applies fix, self-verifies
- **Result**: 13/20 + chain partial (2/5: #16 #19) → **70/110** at $4.39 (~10× muLLM cost)
- Issues fixed: #01 #02 #03 #04 #05 #06 #07 #09 #10 #12 #13 #16 #19
- Timeouts (300s): #08 #11 #14 #15 #17 #18 #20
- Note: 300s/issue is the team's cap; some issues may pass with longer timeouts

### Claude Code Structured Harness v2 (practice run)
- **Setup**: 3 workers, 120s timeout, 3 retries; CC generates tests then fixes in two phases
- **Result**: 10/20 + chain partial (2/5: #16 #18) → **55/110** at $2.36
- Issues fixed: #01 #02 #04 #06 #09 #12 #15 #16 #18 #20
- Timeouts (120s): #03 #08 #11 #14

### Hard Mode v5 (muLLM harness)
- **Setup**: Write discriminating tests + fix bugs from `v1-bugged` branch (no pre-committed tests)
- **Pipeline**: `cloud_full` test gen → full-clean oracle verification → retry oracle failures → cascade fix `local → cloud_cheap → cloud_full`
- **Result**: 20/20 + chain 5/5 bonus → **110/110** at $0.37
- Issues fixed: #01 #02 #03 #04 #05 #06 #07 #08 #09 #10 #11 #12 #13 #14 #15 #16 #17 #18 #19 #20

### Hard Mode v4 (muLLM harness)
- **Setup**: Write discriminating tests + fix bugs from `v1-bugged` branch (no pre-committed tests)
- **Pipeline**: `cloud_full` test gen → full-clean oracle verification → retry oracle failures → cascade fix `local → cloud_cheap → cloud_full`
- **Result**: 14/20 + chain 5/5 bonus → **80/110** at $0.68
- Issues fixed: #01 #02 #04 #06 #08 #09 #12 #13 #14 #16 #17 #18 #19 #20
- Issues not fixed: #03 #05 #07 #10 #11 #15 (oracle tests fail on clean code)

### Easy Mode (oracle tests)
- **Setup**: Oracle tests pre-committed to `easy-mode` branch (fail on buggy, pass on clean)
- **Phase**: Fix-only cascade with same routing: `local → cloud_cheap → cloud_full`
- **Result**: 11/20 fixed at 82% lower cost than Hard Mode v4
- Issues fixed: #01 #02 #03 #04 #07 #09 #11 #12 #13 #14 #15
- Issues not fixed: #05 #06 #08 #10 #16–#20 (chain)

## Issue Difficulty Reference

This table is frozen — it shows the canonical difficulty tier for each issue.
Per-submission results are in the Configurations section above; we don't add a column per submission (doesn't scale).

| # | Issue | Difficulty | Canonical Fix Area |
|---|-------|-----------|-------------------|
| 01 | delete-dialog | T1 | React state (onClick handler) |
| 02 | column-badge | T1 | Computed badge label |
| 03 | date-timezone | T1 | Date formatting (UTC→local) |
| 04 | search-case | T1 | String comparison (case-insensitive) |
| 05 | board-name | T1 | Board rename commit |
| 06 | label-persist | T2 | Label save → re-render |
| 07 | sprint-view | T2 | Sprint filter predicate |
| 08 | user-assign | T2 | Assignee state update |
| 09 | completion-pct | T2 | Completion % calculation |
| 10 | undo-single | T2 | Undo stack — shared file |
| 11 | tab-switch | T3 | Tab state isolation |
| 12 | listener-leak | T3 | useEffect cleanup |
| 13 | my-cards | T3 | My Cards filter — shared file |
| 14 | prefs-persist | T3 | Preferences localStorage key |
| 15 | no-duplicates | T3 | Dedup on card add |
| 16–20 | useSubscription chain | T4 | Single missing unsubscribe call |

Solved rates across all runs to date: T1 91%, T2 76%, T3 72%, T4 60% (chain full 3/5 runs).

## Speed Comparison

| Agent | Score | Cost | Time | Cost/Issue | Time/Issue |
|-------|-------|------|------|------------|------------|
| muLLM v6 | 110/110 | $0.45 | **7 min** | $0.022 | **21s** |
| CC structured v2 | 55/110 | $2.36 | 21 min | $0.236 | 63s |
| CC autonomous | 70/110 | $4.39 | **67 min** | $0.338 | 200s |

muLLM runs 3 workers in parallel with local-first routing: 85% of fixes ($0 cost) happen on the local 30B model in under 10s each. Cloud is only called for test generation and a handful of complex fixes. CC autonomous uses a single worker with a 300s per-issue timeout — 7 issues timed out entirely. Even CC structured (3 workers, 120s timeout) costs 5× more than muLLM for half the score.

The routing dividend: muLLM routes 17/20 issues to local inference, paying cloud rates only for test oracle generation and 3 genuinely complex fixes. Total cloud spend: $0.10 out of $0.45 (22%). The remaining $0.35 is test-generation infra cost that could be cut further with a cached oracle.

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
6. CI will run the scorer and post results as a PR comment
7. PRs are scored but not merged — `v1-bugged` stays frozen as the permanent baseline

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full submission guidelines.
