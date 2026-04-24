import { describe, it, expect, vi } from 'vitest'
import { formatDate } from '../../src/utils/storage'

describe('date-timezone', () => {
  it('does not shift date for UTC-offset users', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 300  // UTC-5 (New York)
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')        // must show April 25
      expect(result).not.toContain('24')    // NOT April 24
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('works correctly for UTC users', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => 0  // UTC+0
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('works correctly for users east of UTC', () => {
    const origOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => -120  // UTC+2
    
    try {
      const result = formatDate('2026-04-25')
      expect(result).toContain('25')
    } finally {
      Date.prototype.getTimezoneOffset = origOffset
    }
  })

  it('handles null date input', () => {
    const result = formatDate(null)
    expect(result).toBe('')
  })

  it('handles empty string date input', () => {
    const result = formatDate('')
    expect(result).toBe('')
  })
})
