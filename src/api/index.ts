import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { storage, globalToken } from '@/utils'

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
    
    const isPublicApi = config.url?.startsWith('/api/user/login') || 
                        config.url?.startsWith('/api/user/register') ||
                        config.url?.startsWith('/api/user/send_email')
    
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
  (response) => {
    const res = response.data as any

    const successCodes = [0, 1001, 200]
    if (res.code !== undefined && !successCodes.includes(res.code)) {
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

export function request<T>(config: AxiosRequestConfig): Promise<any> {
  return service(config)
}
