import type { ArticleStatus } from './common'

/**
 * 文章信息
 */
export interface Article {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  title: string
  abstract: string
  content: string
  categoryID: number | null
  tagList: string[]
  cover: string
  userID: number
  lookCount: number
  diggCount: number
  commentCount: number
  collectCount: number
  openComment: boolean
  status: ArticleStatus
  userTop: boolean
  adminTop: boolean
  nickName: string
  userAvatar: string
  categoryTitle: string | null
}

/**
 * 文章详情
 */
export interface ArticleDetail extends Article {
  username: string
  nickname: string
  useravatar: string
  categoryTitlt: string | null
  isDigg: boolean
  isCollect: boolean
  collectID: number
}

/**
 * 创建文章参数
 */
export interface CreateArticleParams {
  title: string
  content: string
  tagList: string[]
  status: ArticleStatus
  categoryID?: number
  cover?: string
  abstract?: string
  openComment?: boolean
}

/**
 * 更新文章参数
 */
export interface UpdateArticleParams extends CreateArticleParams {
  id: number
}

/**
 * 文章列表查询参数
 */
export interface ArticleListParams {
  type: 1 | 2 | 3
  userID?: number
  categoryID?: number
  page: number
  limit: number
  order?: string
  status?: ArticleStatus
  collectID?: number
  key?: string
}

/**
 * 文章审核参数
 */
export interface ArticleExamineParams {
  articleID: number
  status: ArticleStatus
  msg?: string
}

/**
 * 文章收藏参数
 */
export interface ArticleCollectParams {
  articleID: number
  collectID: number
}

/**
 * 批量取消收藏参数
 */
export interface BatchUncollectParams {
  collectID: number
  articleIDList: number[]
}

/**
 * 文章浏览参数
 */
export interface ArticleLookParams {
  articleID: number
}

/**
 * 文章置顶参数
 */
export interface ArticleTopParams {
  articleID: number
  type: 1 | 2
}

/**
 * 推荐文章
 */
export interface RecommendArticle {
  id: number
  title: string
  lookCount: number
}

/**
 * 浏览历史
 */
export interface HistoryItem {
  id: number
  lookData: string
  title: string
  cover: string
  nickname: string
  avatar: string
  userID: number
  articleID: number
}

/**
 * 分类信息
 */
export interface Category {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  title: string
  userID: number
  ArticleCount: number
}

/**
 * 分类选项
 */
export interface CategoryOption {
  label: string
  value: number
}

/**
 * 标签选项
 */
export interface TagOption {
  label: string
  value: string
}

/**
 * 收藏夹
 */
export interface Collection {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  title: string
  abstract: string
  cover: string
  isDefault: boolean
  userID: number
  ArticleCount: number
  articleList?: Article[]
}

/**
 * 更新收藏夹参数
 */
export interface UpdateCollectionParams {
  ID?: number
  title: string
  abstract?: string
}

/**
 * 删除收藏夹参数
 */
export interface DeleteCollectionParams {
  idList: number[]
}
