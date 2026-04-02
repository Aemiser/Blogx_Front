import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { storage, globalToken } from '@/utils'
import type { ApiResponse } from '@/types'

const service: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const gToken = globalToken.get()
    const sToken = storage.getToken()
    const token = gToken || sToken
    
    const isPublicApi = config.url?.startsWith('/api/site/')
    
    if (token && !isPublicApi) {
      config.headers['token'] = token
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    if (res.code !== 0) {
      // 检查这个API是否是需要认证的API
      const isPublicApi = response.config.url?.startsWith('/api/site/')
      
      // 公共API返回错误不处理token
      if (!isPublicApi) {
        // 只在明确的token相关错误时清除token
        const isTokenError = res.code === 1001 || 
          (res.msg && (res.msg.includes('token为空') || res.msg.includes('token已过期')))
        
        if (isTokenError) {
          const hasToken = globalToken.get() || storage.getToken()
          if (hasToken) {
            console.log('Token error but token exists, keeping it')
            // 不清除token，因为token确实存在，可能是后端问题
          }
        }
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    }

    return res
  },
  (error) => {
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

export default service

export function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service(config)
}
