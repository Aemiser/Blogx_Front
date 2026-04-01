import request from '../index'
import type {
  Comment,
  CommentTreeNode,
  CreateCommentParams,
  CommentListParams,
  PaginatedData
} from '@/types'

/**
 * 发布评论
 */
export function createComment(data: CreateCommentParams) {
  return request<any>({
    url: '/api/comment',
    method: 'POST',
    data
  })
}

/**
 * 评论列表
 */
export function getCommentList(params: CommentListParams) {
  return request<PaginatedData<Comment>>({
    url: '/api/comment',
    method: 'GET',
    params
  })
}

/**
 * 评论树
 */
export function getCommentTree(articleID: number) {
  return request<PaginatedData<CommentTreeNode>>({
    url: `/api/comment/tree/${articleID}`,
    method: 'GET'
  })
}

/**
 * 删除评论
 */
export function deleteComment(id: number) {
  return request<any>({
    url: `/api/comment/${id}`,
    method: 'DELETE'
  })
}

/**
 * 评论点赞
 */
export function diggComment(id: number) {
  return request<any>({
    url: `/api/comment/digg/${id}`,
    method: 'GET'
  })
}
