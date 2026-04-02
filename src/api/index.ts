import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { storage } from '@/utils'
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
    const token = storage.getToken()
    if (token) {
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
      // token 不存在或已过期
      if (res.code === 1001) {
        storage.clear()
        alert('请登录')
        window.location.href = '/login'
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
