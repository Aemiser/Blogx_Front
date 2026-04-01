/**
 * 表单验证规则
 */
export const validators = {
  required: (message: string = '此项为必填') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message
    }
    if (Array.isArray(value) && value.length === 0) {
      return message
    }
    return true
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `至少输入 ${min} 个字符`
    }
    return true
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `最多输入 ${max} 个字符`
    }
    return true
  },

  email: (message: string = '请输入有效的邮箱地址') => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message
    }
    return true
  },

  phone: (message: string = '请输入有效的手机号') => (value: string) => {
    if (value && !/^1[3-9]\d{9}$/.test(value)) {
      return message
    }
    return true
  },

  url: (message: string = '请输入有效的URL') => (value: string) => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return message
    }
    return true
  },

  password: (message: string = '密码至少6位') => (value: string) => {
    if (value && value.length < 6) {
      return message
    }
    return true
  },

  confirmPassword: (password: string, message: string = '两次输入的密码不一致') => (value: string) => {
    if (value !== password) {
      return message
    }
    return true
  }
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证 URL
 */
export function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url)
}
