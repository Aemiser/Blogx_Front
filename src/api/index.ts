import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { storage, globalToken } from '@/utils'

const service: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const errorCodeMessages: Record<number, string> = {
  0: '操作成功',
  1001: '参数错误',
  1002: '服务错误',
  1003: '操作失败',
  1004: '未授权，请先登录',
  1005: '禁止访问',
  1006: '资源不存在',
  4001: '用户不存在',
  4002: '用户已存在',
  4003: '用户已被禁用',
  4004: '用户名或密码错误',
  4005: '登录已过期，请重新登录',
  4006: '无效的登录',
  4007: '无权限操作',
  4008: '该用户名已被使用',
  4009: '用户名30天内只能修改一次',
  4010: 'QQ用户不允许修改昵称和头像',
  4011: '用户信息修改失败',
  4012: '用户未开放收藏',
  7001: '分类已存在',
  7002: '创建收藏夹错误',
  7003: '分类不存在',
  7004: '更新收藏夹错误',
  7005: '删除收藏夹错误',
  7006: '文章不存在',
  7007: '收藏夹已满',
  7008: '文章创建失败',
  7009: '文章更新失败',
  7010: '文章删除失败',
  7011: '点赞失败',
  7012: '文章浏览记录失败',
  7013: '文章审核失败',
  7014: '文章未开放评论',
  7015: '标签不存在',
  7016: '分类不存在',
  8001: '评论不存在',
  8002: '评论创建失败',
  8003: '评论删除失败',
  8004: '评论点赞失败',
  8005: '父评论不存在',
  9001: '消息不存在',
  9002: '消息创建失败',
  9003: '消息已读失败',
  9004: '消息删除失败',
  9005: '通知不存在',
  9101: 'Banner不存在',
  9102: 'Banner创建失败',
  9103: 'Banner更新失败',
  9104: 'Banner删除失败',
  9105: '标签不存在',
  9106: '标签创建失败',
  9107: '标签删除失败',
  9201: '图片上传失败',
  9202: '图片不存在',
  9203: '图片删除失败',
  9204: '图片格式错误',
  9205: '图片大小超出限制',
  9206: '图片转存失败',
  9301: '会话不存在',
  9302: '消息不存在',
  9303: '消息发送失败',
  9304: '消息删除失败',
  9305: '消息已读失败',
  9401: '未找到相关结果',
  9402: '搜索失败',
  9501: '日志不存在',
  9502: '日志删除失败',
  9503: '日志查询失败',
  9601: 'AI服务错误',
  9602: 'AI内容生成失败',
  9603: 'AI标题生成失败',
  9604: 'AI文章导入失败',
  9605: 'AI文章分析失败',
  9701: '不能关注自己',
  9702: '已关注该用户',
  9703: '未关注该用户',
  9704: '关注失败',
  9705: '取消关注失败',
}

function getErrorMessage(code: number): string {
  return errorCodeMessages[code] || '操作失败，请稍后重试'
}

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
      const msg = getErrorMessage(res.code)
      return Promise.reject(new Error(msg))
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
