import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate } from '../../src/utils/storage'

describe('date-timezone', () => {
  let originalTimezone: string

  beforeEach(() => {
    // Store original timezone
    originalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  afterEach(() => {
    // Reset any timezone mocking
    vi.unstubAllGlobals()
  })

  it('should display correct date for users west of UTC', () => {
    // Mock user being in New York timezone (UTC-5)
    vi.stubGlobal('Intl', {
      ...Intl,
      DateTimeFormat: vi.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'America/New_York' }),
        format: (date: Date) => date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          timeZone: 'America/New_York'
        })
      }))
    })

    // ISO date string for April 25, 2026 (stored as date-only)
    const isoDate = '2026-04-25'
    
    // User selected April 25, so should display April 25
    const result = formatDate(isoDate)
    
    // This will FAIL with buggy code because new Date('2026-04-25') 
    // parses as UTC midnight, then toLocaleDateString() in NYC timezone
    // shows April 24 (since UTC midnight April 25 = 8pm April 24 in NYC)
    expect(result).toBe('Apr 25, 2026')
  })

  it('should display correct date for users east of UTC', () => {
    // Mock user being in Tokyo timezone (UTC+9)
    vi.stubGlobal('Intl', {
      ...Intl,
      DateTimeFormat: vi.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'Asia/Tokyo' }),
        format: (date: Date) => date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          timeZone: 'Asia/Tokyo'
        })
      }))
    })

    const isoDate = '2026-04-25'
    const result = formatDate(isoDate)
    
    // This should work fine even with buggy code because UTC midnight April 25
    // is 9am April 25 in Tokyo, so still shows correct date
    expect(result).toBe('Apr 25, 2026')
  })

  it('should display correct date for UTC users', () => {
    // Mock user being in UTC timezone
    vi.stubGlobal('Intl', {
      ...Intl,
      DateTimeFormat: vi.fn(() => ({
        resolvedOptions: () => ({ timeZone: 'UTC' }),
        format: (date: Date) => date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          timeZone: 'UTC'
        })
      }))
    })

    const isoDate = '2026-04-25'
    const result = formatDate(isoDate)
    
    // UTC users should see correct date even with buggy code
    expect(result).toBe('Apr 25, 2026')
  })

  it('should handle null date input', () => {
    const result = formatDate(null)
    expect(result).toBe('')
  })

  it('should handle empty string date input', () => {
    const result = formatDate('')
    expect(result).toBe('')
  })
})
