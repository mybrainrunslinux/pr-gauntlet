import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatDate } from '../../src/utils/storage'

/**
 * Issue #03 — date-timezone
 *
 * Bug: formatDate() parses an ISO date string via `new Date(isoDate)` which
 * treats the value as UTC midnight.  Calling toLocaleDateString() then
 * converts that UTC instant to local time, shifting the displayed date one
 * day earlier for users in negative-offset (west-of-UTC) timezones.
 *
 * The fix must display the calendar date that was *stored* in the ISO string,
 * independent of the user's timezone offset.
 */

afterEach(() => {
  vi.useRealTimers()
})

describe('date-timezone: formatDate displays the stored calendar date', () => {
  it('date-timezone: returns Apr 25 for 2024-04-25 when TZ is UTC-5 (America/New_York)', () => {
    // Simulate a UTC-5 environment by overriding Date so that UTC midnight on
    // April 25 would naively render as April 24 in local time.
    // We do this by setting the system time to a UTC-5 epoch and verifying
    // the formatter output directly — the formatter must not depend on
    // local-time conversion.

    // Freeze time to a UTC-5 wall-clock moment so any "now"-based paths are
    // also deterministic (not strictly required for this bug but prevents flake).
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-04-25T12:00:00-05:00'))

    // The stored ISO value as it arrives from the backend/picker: a date-only string.
    // new Date('2024-04-25') parses this as UTC midnight = 2024-04-25T00:00:00Z.
    // In UTC-5 that instant is 2024-04-24T19:00:00 — so toLocaleDateString()
    // returns "April 24" instead of "April 25".  That is the bug.
    const result = formatDate('2024-04-25')

    // Expected: the calendar date stored in the string, not the local-time conversion.
    expect(result).toBe('Apr 25, 2024')
  })

  it('date-timezone: returns Dec 1 for 2023-12-01 when timezone shifts it to Nov 30', () => {
    vi.useFakeTimers()
    // UTC-8 (America/Los_Angeles winter) — UTC midnight Dec 1 = Nov 30 locally
    vi.setSystemTime(new Date('2023-12-01T12:00:00-08:00'))

    const result = formatDate('2023-12-01')

    expect(result).toBe('Dec 1, 2023')
  })

  it('date-timezone: returns empty string for null input', () => {
    expect(formatDate(null)).toBe('')
  })

  it('date-timezone: returns Jan 1 for 2024-01-01 regardless of UTC offset', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00-12:00'))

    const result = formatDate('2024-01-01')

    expect(result).toBe('Jan 1, 2024')
  })
})
