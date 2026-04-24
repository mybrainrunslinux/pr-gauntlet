import { describe, it, expect, vi } from 'vitest'
import { formatDate } from '../../src/utils/storage'

describe('date-timezone', () => {
  it('should not shift date for users west of UTC (UTC-5)', () => {
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
    
    // Mock UTC-5 timezone (New York)
    Date.prototype.getTimezoneOffset = vi.fn(() => 300) // 300 minutes = 5 hours behind UTC
    
    try {
      const result = formatDate('2026-04-25')
      
      // The bug causes this to show "Apr 24, 2026" instead of "Apr 25, 2026"
      expect(result).toContain('25')        // must show April 25
      expect(result).not.toContain('24')    // NOT April 24
      expect(result).toBe('Apr 25, 2026')   // exact expected format
    } finally {
      // Restore original method
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset
    }
  })

  it('should not shift date for users west of UTC (UTC-8)', () => {
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
    
    // Mock UTC-8 timezone (Pacific Time)
    Date.prototype.getTimezoneOffset = vi.fn(() => 480) // 480 minutes = 8 hours behind UTC
    
    try {
      const result = formatDate('2026-04-25')
      
      expect(result).toContain('25')
      expect(result).not.toContain('24')
      expect(result).toBe('Apr 25, 2026')
    } finally {
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset
    }
  })

  it('should work correctly for users east of UTC (UTC+2)', () => {
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
    
    // Mock UTC+2 timezone (positive offset means behind UTC, negative means ahead)
    Date.prototype.getTimezoneOffset = vi.fn(() => -120) // -120 minutes = 2 hours ahead of UTC
    
    try {
      const result = formatDate('2026-04-25')
      
      expect(result).toContain('25')
      expect(result).toBe('Apr 25, 2026')
    } finally {
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset
    }
  })

  it('should work correctly for UTC users', () => {
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
    
    // Mock UTC timezone
    Date.prototype.getTimezoneOffset = vi.fn(() => 0)
    
    try {
      const result = formatDate('2026-04-25')
      
      expect(result).toContain('25')
      expect(result).toBe('Apr 25, 2026')
    } finally {
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset
    }
  })

  it('should handle null input gracefully', () => {
    const result = formatDate(null)
    expect(result).toBe('')
  })

  it('should handle empty string input gracefully', () => {
    const result = formatDate('')
    expect(result).toBe('')
  })
})
