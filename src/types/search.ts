import type { Article } from './article'

/**
 * 搜索文章参数
 */
export interface SearchArticleParams {
  tag: string
  type: 0 | 1 | 2 | 3 | 4
  page: number
  limit: number
  key: string
}

/**
 * 全文搜索参数
 */
export interface FullTextSearchParams {
  key: string
  page: number
  limit: number
}

/**
 * 全文搜索结果
 */
export interface FullTextSearchResult {
  articleID: number
  head: string
  body: string
  flag: string
}

/**
 * 标签聚合
 */
export interface TagAggregation {
  tag: string
  articleCount: number
}

/**
 * AI 分析结果
 */
export interface AIAnalysisResult {
  title: string
  abstract: string
  category: string
  tag: string[]
}

/**
 * 数据统计 - 求和
 */
export interface DataSum {
  flowCount: number
  userCount: number
  articleCount: number
  messageCount: number
  commentCount: number
  newLoginCount: number
  newSignCount: number
}

/**
 * 数据统计 - 按时间
 */
export interface DataGrowth {
  growthRate: number
  growthNum: number
  dateList: string[]
  countList: number[]
}

/**
 * 系统资源
 */
export interface SystemResource {
  cpuPercent: number
  memPercent: number
  diskPercent: number
}
