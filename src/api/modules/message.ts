import request from '../index'
import type {
  SiteMsgConf,
  UpdateSiteMsgConfParams,
  SiteMessage,
  UnreadMessageCount,
  GlobalNotification,
  CreateGlobalNotificationParams,
  UserGlobalNotificationParams,
  ChatSession,
  ChatRecord,
  PaginatedData
} from '@/types'

/**
 * 获取站内信配置
 */
export function getSiteMsgConf() {
  return request<SiteMsgConf>({
    url: '/api/site_msg/conf',
    method: 'GET'
  })
}

/**
 * 更新站内信配置
 */
export function updateSiteMsgConf(data: UpdateSiteMsgConfParams) {
  return request<any>({
    url: '/api/site_msg/conf',
    method: 'PUT',
    data
  })
}

/**
 * 站内信列表
 */
export function getSiteMsgList(t?: 1 | 2 | 3) {
  return request<PaginatedData<SiteMessage>>({
    url: '/api/site_msg',
    method: 'GET',
    params: { t }
  })
}

/**
 * 站内信读取
 */
export function readSiteMsg(id: number, t: number) {
  return request<any>({
    url: '/api/site_msg',
    method: 'POST',
    data: { id, t }
  })
}

/**
 * 删除站内信
 */
export function deleteSiteMsg(id: number, t: number) {
  return request<any>({
    url: '/api/site_msg',
    method: 'DELETE',
    data: { id, t }
  })
}

/**
 * 未读消息数量
 */
export function getUnreadCount() {
  return request<UnreadMessageCount>({
    url: '/api/site_msg/user',
    method: 'GET'
  })
}

/**
 * 创建全局消息
 */
export function createGlobalNotification(data: CreateGlobalNotificationParams) {
  return request<any>({
    url: '/api/global_notification',
    method: 'POST',
    data
  })
}

/**
 * 全局消息列表
 */
export function getGlobalNotificationList(type: 1 | 2) {
  return request<PaginatedData<GlobalNotification>>({
    url: '/api/global_notification',
    method: 'GET',
    params: { type }
  })
}

/**
 * 用户全局消息操作
 */
export function userGlobalNotification(data: UserGlobalNotificationParams) {
  return request<any>({
    url: '/api/global_notification/user',
    method: 'POST',
    data
  })
}

/**
 * 管理员删除全局消息
 */
export function adminDeleteGlobalNotification(idList: number[]) {
  return request<any>({
    url: '/api/global_notification/',
    method: 'DELETE',
    data: { idList }
  })
}

/**
 * 聊天记录
 */
export function getChatRecord(userID: number) {
  return request<PaginatedData<ChatRecord>>({
    url: '/api/chat/record',
    method: 'GET',
    params: { userID }
  })
}

/**
 * 会话列表
 */
export function getChatSessionList() {
  return request<PaginatedData<ChatSession>>({
    url: '/api/chat/session',
    method: 'GET'
  })
}

/**
 * 删除聊天消息
 */
export function deleteChatMessage(id: number) {
  return request<any>({
    url: `/api/chat/${id}`,
    method: 'DELETE'
  })
}

/**
 * 删除会话
 */
export function deleteChatSession(userID: number) {
  return request<any>({
    url: `/api/chat/user/${userID}`,
    method: 'DELETE'
  })
}

/**
 * 读取消息
 */
export function readChatMessage(id: number) {
  return request<any>({
    url: `/api/chat/read/${id}`,
    method: 'POST'
  })
}
