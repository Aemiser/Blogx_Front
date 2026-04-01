/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * 分页响应
 */
export interface PaginatedData<T> {
  count: number
  list: T[]
}

/**
 * ID 列表参数
 */
export interface IdListParams {
  IDList: number[]
}

/**
 * 排序参数
 */
export type OrderType = 'asc' | 'desc'

/**
 * 用户角色
 */
export enum UserRole {
  NORMAL = 1,
  ADMIN = 2,
  BANNED = 3
}

/**
 * 文章状态
 */
export enum ArticleStatus {
  DRAFT = 1,
  PENDING = 2,
  PUBLISHED = 3,
  REJECTED = 4
}

/**
 * 消息类型
 */
export enum MessageType {
  COMMENT = 1,
  LIKE = 2,
  SYSTEM = 3
}
