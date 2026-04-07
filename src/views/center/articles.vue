<template>
  <div class="articles-page">
    <div class="card">
      <div class="page-header">
        <h2 class="section-title">发布的文章</h2>
        <BButton variant="primary" size="sm" @click="$router.push('/editor')">
          写文章
        </BButton>
      </div>
      <div v-if="articles.length === 0" class="empty">
        <p>暂无文章</p>
      </div>
      <div v-else class="articles-list">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <div class="article-cover" v-if="article.cover" @click="article.status === 3 && $router.push(`/article/${article.id}`)">
            <img :src="getFullImageUrl(article.cover)" alt="封面" />
          </div>
          <div class="article-info">
            <div class="article-header">
              <h3 
                class="article-title" 
                :class="{ clickable: article.status === 3 }"
                @click="article.status === 3 && $router.push(`/article/${article.id}`)"
              >
                {{ article.title }}
              </h3>
              <span class="article-status" :class="getStatusClass(article.status)">
                {{ getStatusText(article.status) }}
              </span>
            </div>
            <p class="article-abstract">{{ article.abstract || '暂无摘要' }}</p>
            <div class="article-meta">
              <span class="meta-item">{{ formatDate(article.createdAt) }}</span>
              <span class="meta-item">{{ article.lookCount }}次浏览</span>
              <span class="meta-item">{{ article.diggCount }}点赞</span>
              <span class="meta-item">{{ article.commentCount }}评论</span>
            </div>
          </div>
          <div class="article-actions">
            <BButton variant="ghost" size="sm" @click="$router.push(`/editor/${article.id}`)">编辑</BButton>
            <BButton variant="ghost" size="sm" @click="toggleTop(article)">
              {{ article.userTop || article.adminTop ? '取消置顶' : '置顶' }}
            </BButton>
            <BButton variant="ghost" size="sm" @click="deleteArticle(article.id)">删除</BButton>
          </div>
        </div>
      </div>
      <div ref="loadMoreRef" class="load-more">
        <span v-if="loading">加载中...</span>
        <span v-else-if="hasMore">下拉加载更多</span>
        <span v-else>没有更多了</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getArticleList, deleteArticle as deleteArticleApi } from '@/api/modules/article'
import { articleTop } from '@/api/modules/user'
import BButton from '@/components/base/BButton/index.vue'

const articles = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function fetchArticles(isLoadMore = false) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getArticleList({
      type: 2,
      page: page.value,
      limit: 20
    })
    if (isLoadMore) {
      const list = res.data.list.map((item: any) => ({
        ...item,
        id: item.ID || item.id
      }))
      articles.value.push(...list)
    } else {
      const list = res.data.list.map((item: any) => ({
        ...item,
        id: item.ID || item.id
      }))
      articles.value = list
    }
    hasMore.value = res.data.list.length >= 20
    if (hasMore.value) {
      page.value++
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

function getFullImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const baseUrl = window.location.origin
  return baseUrl + '/' + path.replace(/^\//, '')
}

function getStatusText(status: number) {
  const statusMap: Record<number, string> = {
    1: '草稿',
    2: '审核中',
    3: '已发布',
    4: '未通过'
  }
  return statusMap[status] || '未知'
}

function getStatusClass(status: number) {
  const classMap: Record<number, string> = {
    1: 'status-draft',
    2: 'status-pending',
    3: 'status-published',
    4: 'status-rejected'
  }
  return classMap[status] || ''
}

function setupObserver() {
  if (!loadMoreRef.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !loading.value) {
      fetchArticles(true)
    }
  }, { threshold: 0.1 })
  observer.observe(loadMoreRef.value)
}

function toggleTop(article: any) {
  articleTop({
    articleID: article.id,
    type: 1
  }).then(() => {
    fetchArticles()
  }).catch((error) => {
    console.error('Failed to toggle top:', error)
  })
}

function deleteArticle(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return
  deleteArticleApi(id).then(() => {
    fetchArticles()
  }).catch((error) => {
    console.error('Failed to delete article:', error)
  })
}

onMounted(() => {
  fetchArticles()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.articles-page {
  .card {
    padding: $space-6;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-6;
}

.section-title {
  font-size: $text-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: $space-4;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-secondary;
  transition: all $duration-fast;

  &:hover {
    background: $bg-hover;
  }
}

.article-cover {
  width: 120px;
  height: 80px;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
  background: $bg-tertiary;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-header {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-bottom: $space-1;
}

.article-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      color: $primary;
    }
  }
}

.article-status {
  font-size: $text-xs;
  padding: 2px $space-2;
  border-radius: $radius-sm;
  font-weight: $font-weight-medium;
}

.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-pending {
  background: #dbeafe;
  color: #1e40af;
}

.status-published {
  background: #dcfce7;
  color: #166534;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.article-abstract {
  font-size: $text-sm;
  color: $text-secondary;
  margin-bottom: $space-2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  gap: $space-4;
}

.meta-item {
  font-size: $text-xs;
  color: $text-tertiary;
}

.article-actions {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}

.load-more {
  text-align: center;
  padding: $space-4;
  color: $text-tertiary;
  font-size: $text-sm;
}
</style>
