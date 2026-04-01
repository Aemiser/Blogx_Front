import request from '../index'
import type {
  SiteInfo,
  UpdateSiteInfoParams,
  EmailConfig,
  QQConfig,
  QiniuConfig,
  AIConfig
} from '@/types'

/**
 * 站点信息
 */
export function getSiteInfo() {
  return request<SiteInfo>({
    url: '/api/site/site',
    method: 'GET'
  })
}

/**
 * 更新站点信息
 */
export function updateSiteInfo(data: UpdateSiteInfoParams) {
  return request<any>({
    url: '/api/site/site',
    method: 'PUT',
    data
  })
}

/**
 * 邮箱配置
 */
export function getEmailConfig() {
  return request<EmailConfig>({
    url: '/api/site/email',
    method: 'GET'
  })
}

/**
 * 更新邮箱配置
 */
export function updateEmailConfig(data: Partial<EmailConfig>) {
  return request<any>({
    url: '/api/site/email',
    method: 'PUT',
    data
  })
}

/**
 * QQ 配置
 */
export function getQQConfig() {
  return request<QQConfig>({
    url: '/api/site/qq',
    method: 'GET'
  })
}

/**
 * 更新 QQ 配置
 */
export function updateQQConfig(data: Partial<QQConfig>) {
  return request<any>({
    url: '/api/site/qq',
    method: 'PUT',
    data
  })
}

/**
 * 七牛配置
 */
export function getQiniuConfig() {
  return request<QiniuConfig>({
    url: '/api/site/qiniu',
    method: 'GET'
  })
}

/**
 * 更新七牛配置
 */
export function updateQiniuConfig(data: Partial<QiniuConfig>) {
  return request<any>({
    url: '/api/site/qiniu',
    method: 'PUT',
    data
  })
}

/**
 * AI 配置
 */
export function getAIConfig() {
  return request<AIConfig>({
    url: '/api/site/ai',
    method: 'GET'
  })
}

/**
 * 更新 AI 配置
 */
export function updateAIConfig(data: Partial<AIConfig>) {
  return request<any>({
    url: '/api/site/ai',
    method: 'PUT',
    data
  })
}

/**
 * QQ 登录 URL
 */
export function getQQLoginUrl() {
  return request<string>({
    url: '/api/site/qq_url',
    method: 'GET'
  })
}
