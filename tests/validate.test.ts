import { describe, it, expect } from 'vitest'
import { validators, isValidEmail, isValidPhone, isValidUrl } from '@/utils/validate'

describe('Validators', () => {
  describe('required', () => {
    const validate = validators.required()

    it('should fail for undefined', () => {
      expect(validate(undefined)).toBe('此项为必填')
    })

    it('should fail for null', () => {
      expect(validate(null)).toBe('此项为必填')
    })

    it('should fail for empty string', () => {
      expect(validate('')).toBe('此项为必填')
    })

    it('should fail for empty array', () => {
      expect(validate([])).toBe('此项为必填')
    })

    it('should pass for non-empty string', () => {
      expect(validate('hello')).toBe(true)
    })

    it('should pass for number 0', () => {
      expect(validate(0)).toBe(true)
    })

    it('should use custom message', () => {
      const validateCustom = validators.required('Custom message')
      expect(validateCustom('')).toBe('Custom message')
    })
  })

  describe('minLength', () => {
    const validate = validators.minLength(3)

    it('should fail for string shorter than min', () => {
      expect(validate('ab')).toBe('至少输入 3 个字符')
    })

    it('should pass for string with exact min length', () => {
      expect(validate('abc')).toBe(true)
    })

    it('should pass for string longer than min', () => {
      expect(validate('abcd')).toBe(true)
    })

    it('should pass for empty string', () => {
      expect(validate('')).toBe(true)
    })
  })

  describe('maxLength', () => {
    const validate = validators.maxLength(5)

    it('should fail for string longer than max', () => {
      expect(validate('abcdef')).toBe('最多输入 5 个字符')
    })

    it('should pass for string with exact max length', () => {
      expect(validate('abcde')).toBe(true)
    })

    it('should pass for string shorter than max', () => {
      expect(validate('abc')).toBe(true)
    })
  })

  describe('email', () => {
    const validate = validators.email()

    it('should pass for valid email', () => {
      expect(validate('test@example.com')).toBe(true)
    })

    it('should fail for invalid email without @', () => {
      expect(validate('testexample.com')).toBe('请输入有效的邮箱地址')
    })

    it('should fail for invalid email with spaces', () => {
      expect(validate('test @example.com')).toBe('请输入有效的邮箱地址')
    })

    it('should pass for empty string', () => {
      expect(validate('')).toBe(true)
    })
  })

  describe('phone', () => {
    const validate = validators.phone()

    it('should pass for valid Chinese phone number', () => {
      expect(validate('13812345678')).toBe(true)
    })

    it('should fail for invalid phone number', () => {
      expect(validate('12345678901')).toBe('请输入有效的手机号')
    })

    it('should fail for phone number starting with 2', () => {
      expect(validate('23812345678')).toBe('请输入有效的手机号')
    })
  })

  describe('url', () => {
    const validate = validators.url()

    it('should pass for valid http URL', () => {
      expect(validate('http://example.com')).toBe(true)
    })

    it('should pass for valid https URL', () => {
      expect(validate('https://example.com')).toBe(true)
    })

    it('should fail for URL without protocol', () => {
      expect(validate('example.com')).toBe('请输入有效的URL')
    })
  })

  describe('password', () => {
    const validate = validators.password()

    it('should pass for password with 6+ chars', () => {
      expect(validate('123456')).toBe(true)
    })

    it('should fail for password with less than 6 chars', () => {
      expect(validate('12345')).toBe('密码至少6位')
    })
  })

  describe('confirmPassword', () => {
    const validate = validators.confirmPassword('password123')

    it('should pass when passwords match', () => {
      expect(validate('password123')).toBe(true)
    })

    it('should fail when passwords do not match', () => {
      expect(validate('different')).toBe('两次输入的密码不一致')
    })
  })
})

describe('Standalone validation functions', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(isValidEmail('user@domain.com')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should return true for valid phone', () => {
      expect(isValidPhone('13912345678')).toBe(true)
    })

    it('should return false for invalid phone', () => {
      expect(isValidPhone('11111111111')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should return true for valid URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should return false for invalid URL', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
    })
  })
})
