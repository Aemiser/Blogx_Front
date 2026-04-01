import request from '../index'
import type {
  Article,
  ArticleDetail,
  CreateArticleParams,
  UpdateArticleParams,
  ArticleListParams,
  ArticleExamineParams,
  ArticleCollectParams,
  BatchUncollectParams,
  RecommendArticle,
  HistoryItem,
  Category,
  CategoryOption,
  TagOption,
  Collection,
  UpdateCollectionParams,
  DeleteCollectionParams,
  PaginatedData
} from '@/types'

/**
 * 发布文章
 */
export function createArticle(data: CreateArticleParams) {
  return request<any>({
    url: '/api/article',
    method: 'POST',
    data
  })
}

/**
 * 更新文章
 */
export function updateArticle(data: UpdateArticleParams) {
  return request<any>({
    url: '/api/article',
    method: 'PUT',
    data
  })
}

/**
 * 文章列表
 */
export function getArticleList(params: ArticleListParams) {
  return request<PaginatedData<Article>>({
    url: '/api/article',
    method: 'GET',
    params
  })
}

/**
 * 文章详情
 */
export function getArticleDetail(id: number) {
  return request<ArticleDetail>({
    url: `/api/article/${id}`,
    method: 'GET'
  })
}

/**
 * 删除文章
 */
export function deleteArticle(id: number) {
  return request<any>({
    url: `/api/article/${id}`,
    method: 'DELETE'
  })
}

/**
 * 管理员删除文章
 */
export function adminDeleteArticle(IDList: number[]) {
  return request<any>({
    url: '/api/article',
    method: 'DELETE',
    data: { IDList }
  })
}

/**
 * 文章审核
 */
export function examineArticle(data: ArticleExamineParams) {
  return request<any>({
    url: '/api/article/examine',
    method: 'POST',
    data
  })
}

/**
 * 文章点赞
 */
export function diggArticle(id: number) {
  return request<any>({
    url: `/api/article/digg/${id}`,
    method: 'GET'
  })
}

/**
 * 文章收藏
 */
export function collectArticle(data: ArticleCollectParams) {
  return request<any>({
    url: '/api/article/collect',
    method: 'POST',
    data
  })
}

/**
 * 批量取消收藏
 */
export function batchUncollect(data: BatchUncollectParams) {
  return request<any>({
    url: '/api/article/collect',
    method: 'DELETE',
    data
  })
}

/**
 * 文章浏览
 */
export function lookArticle(articleID: number) {
  return request<any>({
    url: '/api/article/look',
    method: 'POST',
    data: { articleID }
  })
}

/**
 * 浏览历史
 */
export function getHistory(params: { type?: 1 | 2; userID?: number; limit?: number; page?: number }) {
  return request<PaginatedData<HistoryItem>>({
    url: '/api/history',
    method: 'GET',
    params
  })
}

/**
 * 分类列表
 */
export function getCategoryList(params: { type: 1 | 2 | 3; UserID?: number }) {
  return request<PaginatedData<Category>>({
    url: '/api/category',
    method: 'GET',
    params
  })
}

/**
 * 创建/编辑分类
 */
export function saveCategory(data: { ID?: number; title: string }) {
  return request<any>({
    url: '/api/category',
    method: 'POST',
    data
  })
}

/**
 * 删除分类
 */
export function deleteCategory(IDList: number[]) {
  return request<any>({
    url: '/api/category',
    method: 'DELETE',
    data: { IDList }
  })
}

/**
 * 分类选项
 */
export function getCategoryOptions() {
  return request<CategoryOption[]>({
    url: '/api/category/options',
    method: 'GET'
  })
}

/**
 * 标签选项
 */
export function getTagOptions() {
  return request<TagOption[]>({
    url: '/api/article/tag/options',
    method: 'GET'
  })
}

/**
 * 推荐文章
 */
export function getRecommendArticles(limit: number) {
  return request<PaginatedData<RecommendArticle>>({
    url: '/api/article/article_recommend',
    method: 'GET',
    params: { limit }
  })
}

/**
 * 收藏夹列表
 */
export function getCollectionList(params: { type: 1 | 2 | 3; UserID?: number; page: number; limit: number }) {
  return request<PaginatedData<Collection>>({
    url: '/api/collect',
    method: 'GET',
    params
  })
}

/**
 * 创建/更新收藏夹
 */
export function saveCollection(data: UpdateCollectionParams) {
  return request<any>({
    url: '/api/collect',
    method: 'POST',
    data
  })
}

/**
 * 删除收藏夹
 */
export function deleteCollection(data: DeleteCollectionParams) {
  return request<any>({
    url: '/api/collect',
    method: 'DELETE',
    data
  })
}
