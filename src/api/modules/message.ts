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
 * @param t 消息类型: 1-回复与评论(1,2), 2-点赞与收藏(3,5,7), 3-系统(9)
 * @param page 页码
 * @param pageSize 每页数量
 */
export function getSiteMsgList(t?: 1 | 2 | 3, page = 1, pageSize = 20) {
  return request<PaginatedData<SiteMessage>>({
    url: '/api/site_msg',
    method: 'GET',
    params: { t, page, page_size: pageSize }
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
 * @param recUserID 对方用户ID (后端参数名是recUserID)
 * @param type 消息类型 1文本 2图片 3MD
 * @param page 页码
 * @param limit 每页数量
 */
export function getChatRecord(recUserID: number, type: 1 | 2 | 3 = 1, page = 1, limit = 20) {
  return request<PaginatedData<ChatRecord>>({
    url: '/api/chat/record',
    method: 'GET',
    params: { 
      recUserID: String(recUserID), 
      type: String(type),
      page: String(page),
      limit: String(limit),
      _t: Date.now()
    }
  })
}

/**
 * 会话列表
 */
export function getChatSessionList(page = 1, limit = 20) {
  return request<{ list: ChatSession[]; count: number }>({
    url: '/api/chat/session',
    method: 'GET',
    params: { page, limit }
  })
}

/**
 * 删除聊天消息（批量）
 */
export function deleteChatMessages(idList: number[]) {
  return request<any>({
    url: '/api/chat',
    method: 'DELETE',
    data: { idList }
  })
}

/**
 * 删除与指定用户的所有聊天记录
 */
export function deleteUserChatHistory(userID: number) {
  return request<any>({
    url: `/api/chat/user/${userID}`,
    method: 'DELETE'
  })
}

/**
 * 标记消息为已读
 */
export function markMessageAsRead(chatID: number) {
  return request<any>({
    url: `/api/chat/read/${chatID}`,
    method: 'POST'
  })
}

/**
 * 获取聊天用户信息
 */
export function getChatUserInfo(userID: number) {
  return request<any>({
    url: '/api/chat/userinfo',
    method: 'GET',
    params: { userID }
  })
}
