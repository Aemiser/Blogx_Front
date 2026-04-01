/**
 * 评论信息
 */
export interface Comment {
  id: number
  createdAt: string
  content: string
  userID: number
  nickName: string
  userAvatar: string
  articleID: number
  articleTitle: string
  articleCover: string
  diggCount: number
  relation: number
  isMe: boolean
}

/**
 * 评论树节点
 */
export interface CommentTreeNode {
  updatedAt: string
  deletedAt: string | null
  rootParentID: number | null
  id: number
  createdAt: string
  content: string
  userID: number
  nickName: string
  userAvatar: string
  articleID: number
  parentID: number | null
  diggCount: number
  applyCount: number
  subComments: CommentTreeNode[] | null
  isDigg?: boolean
  relation?: number
}

/**
 * 发布评论参数
 */
export interface CreateCommentParams {
  content: string
  articleID: number
  parentID?: number
  rootParentID?: number
}

/**
 * 评论列表查询参数
 */
export interface CommentListParams {
  type: 1 | 2 | 3
  key?: string
  articleID?: number
  userID?: number
}
