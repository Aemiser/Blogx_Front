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
          <div class="article-info">
            <h3 class="article-title">{{ article.title }}</h3>
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
              {{ article.isTop ? '取消置顶' : '置顶' }}
            </BButton>
            <BButton variant="ghost" size="sm" @click="deleteArticle(article.id)">删除</BButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleList, deleteArticle as deleteArticleApi } from '@/api/modules/article'
import { articleTop } from '@/api/modules/user'
import BButton from '@/components/base/BButton/index.vue'

const articles = ref<any[]>([])

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

async function fetchArticles() {
  try {
    const res = await getArticleList({
      type: 2,
      page: 1,
      limit: 20
    })
    articles.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  }
}

async function toggleTop(article: any) {
  try {
    await articleTop({
      articleID: article.id,
      type: 1
    })
    fetchArticles()
  } catch (error) {
    console.error('Failed to toggle top:', error)
  }
}

async function deleteArticle(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return
  try {
    await deleteArticleApi(id)
    fetchArticles()
  } catch (error) {
    console.error('Failed to delete article:', error)
  }
}

onMounted(() => {
  fetchArticles()
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
  justify-content: space-between;
  align-items: center;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-secondary;
  transition: all $duration-fast;

  &:hover {
    background: $bg-hover;
  }
}

.article-info {
  flex: 1;
}

.article-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.article-abstract {
  font-size: $text-sm;
  color: $text-secondary;
  margin-bottom: $space-2;
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
  gap: $space-2;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
