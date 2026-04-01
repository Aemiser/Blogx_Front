import type { UserRole } from './common'

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  createdAt: string
  username: string
  nickname: string
  avatar: string
  abstract: string
  email: string
  registerSource: number
  codeAge: number
  role: UserRole
  userID: number
  likeTags: string[] | null
  updataUsernameDate: string | null
  openCollect: boolean
  openFollow: boolean
  openFans: boolean
  homeStyleID: number
  lookCount: number
  userPassword: boolean
}

/**
 * 用户基础信息（公开）
 */
export interface UserBaseInfo {
  nickname: string
  avatar: string
  codeAge: number
  lookCount: number
  likeCount: number
  followCount: number
  fansCount: number
  collectCount: number
  articleCount: number
  place: string
  openCollect: boolean
  openFollow: boolean
  openFans: boolean
  homeStyleID: number
  relation: number
}

/**
 * 登录参数
 */
export interface LoginParams {
  val: string
  pwd: string
  captchaID?: string
  captchaCode?: string
}

/**
 * 注册参数
 */
export interface RegisterParams {
  emailID: string
  code: string
  pwd: string
}

/**
 * 发送邮件参数
 */
export interface SendEmailParams {
  type: number
  email: string
  captchaID: string
  captchaCode: string
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPwd: string
  pwd: string
}

/**
 * 重置密码参数
 */
export interface ResetPasswordParams {
  emailID: string
  emailCode: string
  pwd: string
}

/**
 * 绑定邮箱参数
 */
export interface BindEmailParams {
  emailID: string
  emailCode: string
}

/**
 * 更新用户参数
 */
export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  abstract?: string
}

/**
 * 管理员更新用户参数
 */
export interface AdminUpdateUserParams {
  userID: number
  username?: string
  nickname?: string
  avatar?: string
  abstract?: string
  role?: UserRole
}

/**
 * 用户列表项
 */
export interface UserListItem {
  id: number
  nickname: string
  username: string
  avatar: string
  ip: string
  addr: string
  articleCount: number
  indexCount: number
  createdAt: string
  lastLoginDate: string
  role: UserRole
}

/**
 * 关注用户
 */
export interface FocusUser {
  focusUserID: number
  focusUserNickname: string
  focusUserAvatar: string
  focusUserAbstract: string
  createAt: string
}

/**
 * 粉丝用户
 */
export interface FansUser {
  fansUserID: number
  fansUserNickname: string
  fansUserAvatar: string
  fansUserAbstract: string
  createAt: string
}

/**
 * 推荐作者
 */
export interface RecommendAuthor {
  userID: number
  userNickname: string
  userAvatar: string
  userAbstract: string
}
