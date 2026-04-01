import request from '../index'
import type { Captcha } from '@/types'

/**
 * 获取验证码
 */
export function getCaptcha() {
  return request<Captcha>({
    url: '/api/captcha',
    method: 'GET'
  })
}
