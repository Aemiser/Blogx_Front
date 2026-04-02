<template>
  <div class="collections-page">
    <div class="collections-layout">
      <aside class="collections-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">收藏夹</h3>
        </div>
        <div class="folder-list">
          <div 
            v-for="collection in collections" 
            :key="collection.id" 
            class="folder-item"
            :class="{ active: selectedCollectionId === collection.id }"
            @click="selectCollection(collection.id)"
          >
            <span class="folder-icon">📁</span>
            <div class="folder-info">
              <span class="folder-name">{{ collection.title }}</span>
              <span class="folder-count">{{ collection.ArticleCount }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="articles-main">
        <div class="main-header">
          <h3 class="main-title">{{ currentCollection?.title || '请选择收藏夹' }}</h3>
          <span v-if="currentCollection" class="article-total">{{ articles.length }} 篇文章</span>
        </div>

        <div class="articles-content">
          <div v-if="!selectedCollectionId" class="empty">
            <p>请选择收藏夹</p>
          </div>

          <div v-else-if="loading" class="loading">加载中...</div>
          
          <div v-else-if="articles.length === 0" class="empty">
            <p>暂无收藏文章</p>
          </div>

          <div v-else class="articles-list">
            <div 
              v-for="article in articles" 
              :key="article.id" 
              class="article-item"
              @click="$router.push(`/article/${article.id}`)"
            >
              <div class="article-content">
                <h4 class="article-title">{{ article.title }}</h4>
                <p class="article-abstract">{{ article.abstract || '暂无摘要' }}</p>
                <div class="article-meta">
                  <span class="meta-author">{{ article.nickName }}</span>
                  <span class="meta-item">{{ formatDate(article.createdAt) }}</span>
                  <span class="meta-item">{{ article.lookCount }} 阅读</span>
                  <span class="meta-item">{{ article.diggCount }} 点赞</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCollectionList, getArticleList } from '@/api/modules/article'

const collections = ref<any[]>([])
const selectedCollectionId = ref<number | null>(null)
const articles = ref<any[]>([])
const loading = ref(false)

const currentCollection = computed(() => {
  return collections.value.find(c => c.id === selectedCollectionId.value)
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

async function fetchCollections() {
  try {
    const res = await getCollectionList({
      type: 1,
      page: 1,
      limit: 20
    })
    collections.value = res.data.list
    
    if (collections.value.length > 0) {
      selectCollection(collections.value[0].id)
    }
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }
}

async function selectCollection(collectId: number) {
  selectedCollectionId.value = collectId
  await fetchArticles(collectId)
}

async function fetchArticles(collectId: number) {
  loading.value = true
  try {
    const res = await getArticleList({
      type: 2,
      collectID: collectId,
      page: 1,
      limit: 20
    })
    articles.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCollections()
})
</script>

<style scoped lang="scss">
.collections-page {
  background: #ffffff;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.collections-layout {
  display: flex;
  height: 500px;
}

.collections-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #f4f5f7;
  border-right: 1px solid #e3e5e7;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: $space-4;
  border-bottom: 1px solid #e3e5e7;
  background: #ebebeb;
}

.sidebar-title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.folder-list {
  flex: 1;
  overflow-y: auto;
  padding: $space-2;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-3;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $duration-fast;
  margin-bottom: $space-1;
  background: transparent;

  &:hover {
    background: #e8e9eb;
  }

  &.active {
    background: $primary;
    
    .folder-name,
    .folder-count {
      color: white;
    }

    .folder-count {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.folder-icon {
  font-size: $text-base;
}

.folder-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.folder-name {
  font-size: $text-sm;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-count {
  font-size: $text-xs;
  color: $text-tertiary;
  background: #e3e5e7;
  padding: 2px $space-2;
  border-radius: $radius-full;
  flex-shrink: 0;
}

.articles-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 $space-5;
  border-bottom: 1px solid $border;
  background: $bg-card;
}

.main-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.article-total {
  font-size: $text-sm;
  color: $text-tertiary;
}

.articles-content {
  flex: 1;
  overflow-y: auto;
  padding: $space-4 $space-5;
}

.loading,
.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: $text-tertiary;
  font-size: $text-sm;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.article-item {
  padding: $space-4;
  border-radius: $radius-md;
  background: #f4f5f7;
  cursor: pointer;
  transition: all $duration-fast;
  border: 1px solid transparent;

  &:hover {
    background: #e8e9eb;
    border-color: #e3e5e7;
  }
}

.article-content {
  min-width: 0;
}

.article-title {
  font-size: $text-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-abstract {
  font-size: $text-sm;
  color: $text-secondary;
  margin-bottom: $space-3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
}

.meta-author {
  font-size: $text-xs;
  color: $primary;
}

.meta-item {
  font-size: $text-xs;
  color: $text-tertiary;
}
</style>
