import request from '../index'
import type {
  SearchArticleParams,
  FullTextSearchParams,
  FullTextSearchResult,
  TagAggregation,
  AIAnalysisResult,
  Article,
  PaginatedData,
  UserSearchResult
} from '@/types'

/**
 * 文章搜索
 */
export function searchArticle(params: SearchArticleParams) {
  return request<PaginatedData<Article>>({
    url: '/api/search/article',
    method: 'GET',
    params
  })
}

/**
 * 全文搜索
 */
export function fullTextSearch(params: FullTextSearchParams) {
  return request<PaginatedData<FullTextSearchResult>>({
    url: '/api/search/text',
    method: 'GET',
    params
  })
}

/**
 * 用户搜索
 */
export function searchUser(params: FullTextSearchParams) {
  return request<PaginatedData<UserSearchResult>>({
    url: '/api/search/user',
    method: 'GET',
    params
  })
}

/**
 * 标签聚合
 */
export function getTagAggregation() {
  return request<PaginatedData<TagAggregation>>({
    url: '/api/search/tags',
    method: 'GET'
  })
}

/**
 * AI 分析正文
 */
export function aiAnalysis(content: string) {
  return request<AIAnalysisResult>({
    url: '/api/ai/analysis',
    method: 'POST',
    data: { content }
  })
}

/**
 * AI 文章助手
 */
export function aiArticle(content: string) {
  return request<string>({
    url: '/api/ai/article',
    method: 'GET',
    params: { content }
  })
}

/**
 * AI 优化文章
 */
export function aiOptimizeArticle(content: string) {
  return request<{ code: number; data: string; msg: string }>({
    url: '/api/ai/import',
    method: 'POST',
    data: { content }
  })
}
