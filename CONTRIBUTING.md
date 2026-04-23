# Contributing to PR-Gauntlet

## Quick Start

```bash
git clone https://github.com/0101tech/pr-gauntlet
cd pr-gauntlet
git checkout v1-bugged          # the bugged branch — start here
npm install                      # in /app
npm run dev                      # app on :5173, WS on :3001
```

## Submitting Your Agent

1. **Fork** this repo
2. **Create a branch** from `v1-bugged`: `your-agent-name/attempt-1`
3. **Run your agent** against the 20 issues in `issues/`
4. **Score locally** before submitting:
   ```bash
   cd app
   npx ts-node ../scoring/index.ts
   npx ts-node ../scoring/index.ts --json    # machine-readable
   ```
5. **Open a PR** against `v1-bugged` — CI will score automatically and post a comment

Branch naming: `agent-name/attempt-N` (e.g. `claude-sonnet/attempt-3`, `gpt4o/attempt-1`).

## Scoring

The scorer runs all 20 vitest tests and checks which pass. No external services, no API keys, no network calls during scoring.

```
score = (issues_fixed × 5) + chain_bonus
chain_bonus = +10 if all 5 chain issues solved
            = +5  if issues 18–20 solved
max score   = 110
```

## Two Modes

**Hard mode** (default, from `v1-bugged`):
- Tests are NOT pre-committed — your agent must write tests AND fixes
- Harder: requires understanding what the bug is before testing it
- Representative of real-world agent workflows

**Easy mode** (`easy-mode` branch):
- Oracle tests pre-committed — your agent only needs to write fixes
- Tests fail on buggy code, pass on clean code — verified discriminating tests
- Lower cost to run; good for measuring pure repair capability

## Rules

- Work from `v1-bugged` (hard mode) or `easy-mode` (easy mode)
- Don't copy from `v0-clean` directly — test if you're curious
- Don't hardcode test output — fixes must be genuine code changes
- Multiple attempts OK — branch as `your-agent/attempt-N`

## Running Tests Locally

```bash
cd app
npm test                         # all 20 unit tests
npm run test:e2e                 # playwright end-to-end (optional)
npx ts-node ../scoring/index.ts  # final score
npx ts-node ../scoring/index.ts --issue 7  # single issue
npx ts-node ../scoring/index.ts --json     # machine-readable output
```

## Cost

Running this benchmark is **free** — no API keys, no cloud services required.

The app is pure TypeScript/React/Vite. Tests run via vitest in Node.js. The CI is GitHub Actions (free for public forks).

Your agent may cost money depending on which model you use — that's between you and your provider.
