# PR-Gauntlet

A benchmark for coding agents, bots, and autonomous development stacks.

**20 crafted GitHub Issues** on a real TypeScript/React application, ranging from crystal-clear one-liners to deeply interdependent bugs that require tracing a root cause across multiple files.

## How It Works

```
┌─────────────┐    ┌────────────────┐    ┌─────────────────┐
│  v0-clean   │───▶│  v1-bugged     │───▶│  your-bot-branch│
│  (passes    │    │  (20 bugs      │    │  (agent fixes   │
│   all tests)│    │   introduced)  │    │   the issues)   │
└─────────────┘    └────────────────┘    └─────────────────┘
                         diff ▲                diff ▲
                    shows what was         shows what agent
                    broken                    changed
```

Fork the repo, point your agent at `v1-bugged`, and let it work through the issues. Run the scorer to see how many it fixed — and diff against `v0-clean` to see *how* it fixed them.

## Scoring

```bash
cd app
npx ts-node ../scoring/index.ts              # all 20 issues
npx ts-node ../scoring/index.ts --issue 7   # single issue
npx ts-node ../scoring/index.ts --json      # machine-readable output
```

Or run tests directly:
```bash
cd app
npm test                       # vitest unit tests
npm run test:e2e               # playwright end-to-end
```

## Issue Tiers

| Tier | Issues | Difficulty |
|------|--------|------------|
| 1 — Clear | 1–5 | Obvious bug, obvious fix |
| 2 — Moderate | 6–10 | Requires understanding state/async patterns |
| 3 — Vague | 11–15 | Symptoms are real; root cause requires investigation |
| 4 — Chain | 16–20 | Issues share a root cause — fix the source, side-effects resolve |

### The Chain (Issues 16–20)

Issues 16–20 are not independent. They share a single root cause in `src/hooks/useSubscription.ts`. An agent that patches each symptom in isolation will not fully resolve any of them. An agent that traces the root cause and fixes the hook will resolve all five as a side effect — including Issue 20, which it never explicitly touched.

This is the benchmark's hardest test: does the agent understand *why* or just *what*?

## Setup

```bash
git clone https://github.com/0101tech/pr-gauntlet
cd pr-gauntlet
npm install
npm run dev          # starts app on localhost:5173 + WS server on :3001
```

Node 20+ required. No external services, no API keys, no Docker required.

## The App: TaskFlow

A collaborative kanban board — TypeScript, React 18, Vite, WebSocket sync, drag-and-drop. Enough surface area to hide real bugs; simple enough to reason about end-to-end.

See [issues/](./issues/) for all 20 issue descriptions.

## Multi-Language Expansion

v1: TypeScript/React (this repo)  
v2: Python/FastAPI + React (same 20 bug taxonomy, different primitives)  
v3+: Go, Rust, Ruby on Rails

The chain primitive is language-specific (React stale closures → asyncio task leaks → goroutine races) but the scoring methodology is identical.

## Continuous Competition

- Fork → branch named `your-agent/attempt-N`
- Submit a PR against `v1-bugged`
- CI runs the scorer and posts results as a PR comment
- Diff vs `v0-clean` is visible in the PR for human review
- **PRs are scored, never merged** — `v1-bugged` is a frozen baseline; branch protection prevents contamination

Top scores: [LEADERBOARD.md](./LEADERBOARD.md)

## License

MIT. Benchmark dataset (issue descriptions + test files) is CC-BY-4.0.
