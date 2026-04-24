#!/usr/bin/env ts-node
/**
 * pr-gauntlet scorer
 * Usage: npx pr-gauntlet score [--issue N] [--json]
 */
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

const ROOT = path.resolve(__dirname, '..')
const APP = path.join(ROOT, 'app')

interface IssueResult {
  id: number
  title: string
  tier: number
  passed: boolean
  error?: string
}

const ISSUES: Array<{ id: number; title: string; tier: number; testFilter: string }> = [
  { id: 1,  title: 'Delete dialog shows card title',        tier: 1, testFilter: 'delete-dialog' },
  { id: 2,  title: 'Column badge counts update on drag',    tier: 1, testFilter: 'column-badge' },
  { id: 3,  title: 'Date picker timezone correct',          tier: 1, testFilter: 'date-timezone' },
  { id: 4,  title: 'Search filter works case-insensitive',  tier: 1, testFilter: 'search-case' },
  { id: 5,  title: 'Board names render special chars',      tier: 1, testFilter: 'board-name' },
  { id: 6,  title: 'Labels persist after picker close',     tier: 2, testFilter: 'label-persist' },
  { id: 7,  title: 'Sprint view shows active sprint',       tier: 2, testFilter: 'sprint-view' },
  { id: 8,  title: 'User assignment uses ID not index',     tier: 2, testFilter: 'user-assign' },
  { id: 9,  title: 'Completion % calculated correctly',     tier: 2, testFilter: 'completion-pct' },
  { id: 10, title: 'Undo reverts one operation only',       tier: 2, testFilter: 'undo-single' },
  { id: 11, title: 'Tab switch preserves unsaved edits',    tier: 3, testFilter: 'tab-switch' },
  { id: 12, title: 'No listener leak over time',            tier: 3, testFilter: 'listener-leak' },
  { id: 13, title: 'My Cards shows assigned cards',         tier: 3, testFilter: 'my-cards' },
  { id: 14, title: 'Preferences survive navigation',        tier: 3, testFilter: 'prefs-persist' },
  { id: 15, title: 'No duplicate cards after WS reconnect', tier: 3, testFilter: 'no-duplicates' },
  { id: 16, title: 'Stats compute once per event',          tier: 4, testFilter: 'chain-stats' },
  { id: 17, title: 'Rapid moves land in last column',       tier: 4, testFilter: 'chain-race' },
  { id: 18, title: 'WS sync uses latest state snapshot',   tier: 4, testFilter: 'chain-stale' },
  { id: 19, title: 'No heap growth during drag ops',        tier: 4, testFilter: 'chain-leak' },
  { id: 20, title: 'No crash during concurrent edits',      tier: 4, testFilter: 'chain-crash' },
]

function runTest(filter: string): { passed: boolean; error?: string } {
  let stdout = ''
  let stderr = ''
  let exitCode = 0
  try {
    const out = execSync(
      `npm run test -- --reporter=verbose --testNamePattern="${filter}"`,
      { cwd: APP, timeout: 30000, stdio: 'pipe' }
    )
    stdout = out.toString()
  } catch (e: any) {
    stdout = e.stdout?.toString() ?? ''
    stderr = e.stderr?.toString() ?? ''
    exitCode = e.status ?? 1
  }

  // Require at least 1 real test to have passed — vacuous pass (0 tests found) does not count
  const passMatch = stdout.match(/(\d+)\s+passed/)
  const passCount = passMatch ? parseInt(passMatch[1], 10) : 0
  if (passCount === 0) {
    return { passed: false, error: 'no tests written for this issue' }
  }
  if (exitCode !== 0) {
    const failing = stdout.match(/×[^\n]*/)?.[0] ?? stderr.split('\n')[0] ?? 'test failed'
    return { passed: false, error: failing.trim() }
  }
  return { passed: true }
}

function score(issueId?: number, asJson = false) {
  const targets = issueId ? ISSUES.filter(i => i.id === issueId) : ISSUES
  const results: IssueResult[] = []

  for (const issue of targets) {
    process.stdout.write(`  #${String(issue.id).padStart(2, '0')} ${issue.title}... `)
    const { passed, error } = runTest(issue.testFilter)
    results.push({ ...issue, passed, error })
    console.log(passed ? '✓' : `✗ ${error ?? ''}`)
  }

  const fixed = results.filter(r => r.passed).length
  const total = results.length
  const chainIds = [16, 17, 18, 19, 20]
  const chainAll = chainIds.every(id => results.find(r => r.id === id)?.passed)
  const chainPartial = [18, 19, 20].every(id => results.find(r => r.id === id)?.passed)
  const chainBonus = chainAll ? 10 : chainPartial ? 5 : 0
  const baseScore = Math.round((fixed / total) * 100)
  const finalScore = Math.min(100, baseScore + chainBonus)

  if (asJson) {
    console.log(JSON.stringify({ fixed, total, baseScore, chainBonus, finalScore, results }, null, 2))
  } else {
    console.log(`\n  Fixed: ${fixed}/${total}  Base: ${baseScore}  Chain bonus: +${chainBonus}  Final: ${finalScore}/110`)
    if (chainAll) console.log('  ★ Chain solved! Root cause found.')
    else if (chainPartial) console.log('  ◐ Partial chain (18–20 resolved).')
  }

  return finalScore
}

const args = process.argv.slice(2)
const issueFlag = args.indexOf('--issue')
const issueId = issueFlag >= 0 ? parseInt(args[issueFlag + 1]) : undefined
const asJson = args.includes('--json')

if (!asJson) console.log('\npr-gauntlet scorer\n')
score(issueId, asJson)
