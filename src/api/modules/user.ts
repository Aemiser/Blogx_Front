import request from '../index'
import type {
  UserInfo,
  LoginParams,
  RegisterParams,
  SendEmailParams,
  ChangePasswordParams,
  ResetPasswordParams,
  BindEmailParams,
  UpdateUserParams,
  AdminUpdateUserParams,
  UserListItem,
  UserBaseInfo,
  FocusUser,
  FansUser,
  RecommendAuthor,
  PaginatedData
} from '@/types'

/**
 * 发送邮件
 */
export function sendEmail(data: SendEmailParams) {
  return request<{ emailID: string }>({
    url: '/api/user/send_email',
    method: 'POST',
    data
  })
}

/**
 * 用户名密码登录
 */
export function login(data: LoginParams) {
  return request<string>({
    url: '/api/user/login',
    method: 'POST',
    data
  })
}

/**
 * 用户详情（自己的）
 */
export function getUserDetail() {
  return request<UserInfo>({
    url: '/api/user/detail',
    method: 'GET'
  })
}

/**
 * 用户信息（公开）
 */
export function getUserBase(id: number) {
  return request<UserBaseInfo>({
    url: '/api/user/base',
    method: 'GET',
    params: { id }
  })
}

/**
 * QQ 登录
 */
export function qqLogin() {
  return request<any>({
    url: '/api/user/qq',
    method: 'GET'
  })
}

/**
 * 邮箱注册
 */
export function register(data: RegisterParams) {
  return request<string>({
    url: '/api/user/email',
    method: 'POST',
    data
  })
}

/**
 * 修改密码
 */
export function changePassword(data: ChangePasswordParams) {
  return request<any>({
    url: '/api/user/password',
    method: 'PUT',
    data
  })
}

/**
 * 重置密码
 */
export function resetPassword(data: ResetPasswordParams) {
  return request<any>({
    url: '/api/user/password/reset',
    method: 'PUT',
    data
  })
}

/**
 * 绑定邮箱
 */
export function bindEmail(data: BindEmailParams) {
  return request<any>({
    url: '/api/user/email/bind',
    method: 'PUT',
    data
  })
}

/**
 * 更新用户信息
 */
export function updateUser(data: UpdateUserParams) {
  return request<any>({
    url: '/api/user',
    method: 'PUT',
    data
  })
}

/**
 * 用户列表（管理员）
 */
export function getUserList(params?: { page?: number; limit?: number; key?: string }) {
  return request<PaginatedData<UserListItem>>({
    url: '/api/user',
    method: 'GET',
    params
  })
}

/**
 * 管理员更新用户信息
 */
export function adminUpdateUser(data: AdminUpdateUserParams) {
  return request<any>({
    url: '/api/user/admin',
    method: 'PUT',
    data
  })
}

/**
 * 更新用户角色（管理员）
 */
export function updateUserRole(userID: number, role: number) {
  return request<any>({
    url: '/api/user/admin',
    method: 'PUT',
    data: { userID, role }
  })
}

/**
 * 文章置顶
 */
export function articleTop(data: { articleID: number; type: 1 | 2 }) {
  return request<any>({
    url: '/api/user/article/top',
    method: 'POST',
    data
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request<any>({
    url: '/api/user/logout',
    method: 'DELETE'
  })
}

/**
 * 关注用户
 */
export function followUser(focusUserID: number) {
  return request<any>({
    url: '/api/focus',
    method: 'POST',
    data: { focusUserID }
  })
}

/**
 * 取消关注
 */
export function unfollowUser(focusUserID: number) {
  return request<any>({
    url: '/api/focus',
    method: 'DELETE',
    data: { focusUserID }
  })
}

/**
 * 关注列表
 */
export function getFollowingList(userID: number, key?: string) {
  return request<any>({
    url: '/api/focus/my_focus',
    method: 'GET',
    params: { userID, key }
  })
}

/**
 * 粉丝列表
 */
export function getFansList(userID: number) {
  return request<any>({
    url: '/api/focus/my_fans',
    method: 'GET',
    params: { userID }
  })
}

/**
 * 推荐作者
 */
export function getRecommendAuthors(page: number, limit: number) {
  return request<PaginatedData<RecommendAuthor>>({
    url: '/api/article/auth_recommend',
    method: 'GET',
    params: { page, limit }
  })
}
