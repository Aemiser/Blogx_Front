import type { MessageType } from './common'

/**
 * 站内信配置
 */
export interface SiteMsgConf {
  userID: number
  openCommentMessage: boolean
  openDiggMessage: boolean
  openPrivateChat: boolean
}

/**
 * 更新站内信配置参数
 */
export interface UpdateSiteMsgConfParams {
  openCommentMessage?: boolean
  openDiggMessage?: boolean
  openPrivateChat?: boolean
}

/**
 * 站内信消息
 */
export interface SiteMessage {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  Type: MessageType
  message: string
  revuser_id: number
  actionuser_id: number
  actionuser_nickname: string
  actionuser_avatar: string
  article_id: number
  article_title: string
  comment_id: number
  title: string
  content: string
  linktitle: string
  linkhref: string
  is_read: boolean
  Relation: number
}

/**
 * 未读消息数量
 */
export interface UnreadMessageCount {
  commentMsgCount: number
  diggMsgCount: number
  systemMsgCount: number
  privateMsgCount: number
}

/**
 * 全局消息
 */
export interface GlobalNotification {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  title: string
  content: string
  icon: string
  href: string
  isRead: boolean
}

/**
 * 创建全局消息参数
 */
export interface CreateGlobalNotificationParams {
  title: string
  content: string
  icon?: string
  href?: string
}

/**
 * 用户全局消息操作参数
 */
export interface UserGlobalNotificationParams {
  id: number
  type: 1 | 2
}

/**
 * 聊天会话
 */
export interface ChatSession {
  SU: number
  RU: number
  MaxDate: string
  Count: number
  NewChatID: number
}

/**
 * 聊天记录
 */
export interface ChatRecord {
  id: number
  createdAt: string
  content: string
  sendUserID: number
  revUserID: number
  isRead: boolean
}
