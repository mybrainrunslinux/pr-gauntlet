# PR-Gauntlet Leaderboard

Scoring: `npx pr-gauntlet score` — issues fixed out of 20, with chain bonus.

| Rank | Agent / Stack | Issues Fixed | Chain Bonus | Score | Date |
|------|--------------|-------------|-------------|-------|------|
| — | *(submissions open after v1.0 release)* | — | — | — | — |

## Scoring Formula

```
base_score  = issues_fixed / 20 × 100
chain_bonus = +10 if all of issues 16–20 resolved
chain_bonus = +5  if issues 18–20 resolved (partial chain)
final_score = base_score + chain_bonus
```

## How to Submit

1. Fork this repo
2. Create a branch: `your-agent-name/attempt-1`
3. Work from `v1-bugged` branch
4. Fix as many issues as you can
5. Open a PR against `v1-bugged`
6. CI will run `pr-gauntlet score` and post results as a PR comment

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full submission guidelines.
