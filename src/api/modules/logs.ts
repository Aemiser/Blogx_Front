import request from '../index'
import type {
  LogInfo,
  DataSum,
  DataGrowth,
  SystemResource,
  PaginatedData
} from '@/types'

/**
 * 日志列表
 */
export function getLogList(params?: {
  page?: number
  limit?: number
  logType?: string
  key?: string
  order?: string
  userID?: string
}) {
  return request<PaginatedData<LogInfo>>({
    url: '/api/logs',
    method: 'GET',
    params
  })
}

/**
 * 删除日志
 */
export function deleteLogs(IDList: number[]) {
  return request<any>({
    url: '/api/logs',
    method: 'DELETE',
    data: { IDList }
  })
}

/**
 * 日志读取
 */
export function readLog(id: number) {
  return request<any>({
    url: `/api/logs/${id}`,
    method: 'GET'
  })
}

/**
 * 求和数据
 */
export function getDataSum() {
  return request<DataSum>({
    url: '/api/data/sum',
    method: 'GET'
  })
}

/**
 * 文章统计按年
 */
export function getArticleDataByYear() {
  return request<DataGrowth>({
    url: '/api/data/article/year',
    method: 'GET'
  })
}

/**
 * 增长统计
 */
export function getGrowthData(type: 1 | 2 | 3) {
  return request<DataGrowth>({
    url: '/api/data/growth',
    method: 'GET',
    params: { type }
  })
}

/**
 * 系统资源
 */
export function getSystemResource() {
  return request<SystemResource>({
    url: '/api/data/computer',
    method: 'GET'
  })
}
