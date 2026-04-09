import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  truncateText,
  stripHtml,
  highlightKeyword
} from '@/utils/format'

describe('Format Utilities', () => {
  describe('formatNumber', () => {
    it('should return number as string for values < 1000', () => {
      expect(formatNumber(500)).toBe('500')
    })

    it('should format thousands with k suffix', () => {
      expect(formatNumber(1500)).toBe('1.5k')
    })

    it('should format ten thousands with w suffix', () => {
      expect(formatNumber(15000)).toBe('1.5w')
    })

    it('should format large numbers correctly', () => {
      expect(formatNumber(100000)).toBe('10.0w')
    })
  })

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should format with custom format', () => {
      const result = formatDate('2024-03-20T14:30:45Z', 'YYYY/MM/DD HH:mm:ss')
      expect(result).toBe('2024/03/20 14:30:45')
    })

    it('should include time components', () => {
      const result = formatDate('2024-06-01T08:15:30Z', 'HH:mm:ss')
      expect(result).toBe('08:15:30')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return 刚刚 for current time', () => {
      const now = new Date().toISOString()
      expect(formatRelativeTime(now)).toBe('刚刚')
    })

    it('should return seconds ago', () => {
      const past = new Date(Date.now() - 30000).toISOString()
      expect(formatRelativeTime(past)).toBe('30秒前')
    })

    it('should return minutes ago', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      expect(formatRelativeTime(past)).toBe('5分钟前')
    })

    it('should return hours ago', () => {
      const past = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(past)).toBe('3小时前')
    })

    it('should return days ago', () => {
      const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(past)).toBe('5天前')
    })

    it('should return months ago', () => {
      const past = new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(past)).toBe('2个月前')
    })

    it('should return years ago', () => {
      const past = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(past)).toBe('2年前')
    })
  })

  describe('formatFileSize', () => {
    it('should return 0 B for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('truncateText', () => {
    it('should return original text if within limit', () => {
      expect(truncateText('Hello', 10)).toBe('Hello')
    })

    it('should truncate text and add ellipsis', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
    })

    it('should handle exact length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello')
    })
  })

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello')
    })

    it('should remove multiple HTML tags', () => {
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test')
    })

    it('should handle text without HTML', () => {
      expect(stripHtml('Plain text')).toBe('Plain text')
    })
  })

  describe('highlightKeyword', () => {
    it('should return original text if no keyword', () => {
      expect(highlightKeyword('Hello World', '')).toBe('Hello World')
    })

    it('should highlight keyword in text', () => {
      const result = highlightKeyword('Hello World', 'World')
      expect(result).toBe('Hello <em class="highlight">World</em>')
    })

    it('should highlight all occurrences case-insensitive', () => {
      const result = highlightKeyword('Test test TEST', 'test')
      expect(result).toBe('<em class="highlight">Test</em> <em class="highlight">test</em> <em class="highlight">TEST</em>')
    })
  })
})
