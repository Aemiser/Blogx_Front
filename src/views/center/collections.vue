<template>
  <div class="collections-page">
    <div class="collections-layout">
      <aside class="collections-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">收藏夹</h3>
          <button class="add-folder-btn" @click="showCreateDialog = true" title="创建收藏夹">+</button>
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
            <button 
              v-if="!collection.isDefault" 
              class="delete-btn" 
              @click.stop="deleteCollection(collection.id)"
              title="删除"
            >×</button>
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
              :class="{ 'article-item--unpublished': article.noPublish }"
              @click="!article.noPublish && $router.push(`/article/${article.id}`)"
            >
              <div class="article-cover" v-if="article.cover">
                <img :src="getFullImageUrl(article.cover)" :alt="article.title" />
              </div>
              <div class="article-content">
                <h4 class="article-title">{{ article.title }}</h4>
                <p v-if="!article.noPublish" class="article-abstract">{{ article.abstract || '暂无摘要' }}</p>
                <div class="article-meta">
                  <span class="meta-author">{{ article.nickName }}</span>
                  <span class="meta-item">{{ formatDate(article.createdAt) }}</span>
                  <span v-if="!article.noPublish" class="meta-stats">
                    <span class="stat-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {{ article.lookCount }}
                    </span>
                    <span class="stat-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {{ article.diggCount }}
                    </span>
                    <span class="stat-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {{ article.commentCount }}
                    </span>
                    <span class="stat-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      {{ article.collectCount }}
                    </span>
                  </span>
                </div>
                <div v-if="article.noPublish" class="unpublished-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>未发布</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 创建收藏夹弹窗 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>创建收藏夹</h3>
          <span class="dialog-close" @click="showCreateDialog = false">&times;</span>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">收藏夹名称</label>
            <input v-model="newCollection.title" class="input" type="text" placeholder="请输入收藏夹名称" />
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea v-model="newCollection.abstract" class="textarea" placeholder="请输入描述" rows="3"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showCreateDialog = false">取消</button>
          <button class="btn-confirm" @click="handleCreateCollection" :disabled="!newCollection.title.trim()">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { getCollectionList, getArticleList, saveCollection, deleteCollection as deleteCollectionApi } from '@/api/modules/article'
import { getFullImageUrl } from '@/utils/image'

const collections = ref<any[]>([])
const selectedCollectionId = ref<number | null>(null)
const articles = ref<any[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)

const newCollection = reactive({
  title: '',
  abstract: ''
})

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
    
    // 如果没有收藏夹，创建一个默认收藏夹
    if (collections.value.length === 0) {
      await saveCollection({ title: '我的收藏', abstract: '默认收藏夹' })
      const res2 = await getCollectionList({
        type: 1,
        page: 1,
        limit: 20
      })
      collections.value = res2.data.list
    }
    
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

async function handleCreateCollection() {
  if (!newCollection.title.trim()) return
  
  try {
    await saveCollection({
      title: newCollection.title,
      abstract: newCollection.abstract
    })
    showCreateDialog.value = false
    newCollection.title = ''
    newCollection.abstract = ''
    await fetchCollections()
  } catch (error) {
    console.error('Failed to create collection:', error)
    alert('创建失败')
  }
}

async function deleteCollection(id: number) {
  if (!confirm('确定要删除这个收藏夹吗？')) return
  
  try {
    await deleteCollectionApi({ idList: [id] })
    if (selectedCollectionId.value === id) {
      selectedCollectionId.value = null
      articles.value = []
    }
    await fetchCollections()
  } catch (error) {
    console.error('Failed to delete collection:', error)
    alert('删除失败')
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-folder-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: $primary;
  color: white;
  border-radius: $radius-sm;
  cursor: pointer;
  font-size: $text-lg;
  line-height: 1;
  
  &:hover {
    background: $primary-dark;
  }
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
  position: relative;

  &:hover {
    background: #e8e9eb;
    
    .delete-btn {
      opacity: 1;
    }
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

.delete-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  opacity: 0;
  transition: all $duration-fast;
  
  &:hover {
    background: #f44336;
    color: white;
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
  display: flex;
  gap: $space-4;

  &:hover {
    background: #e8e9eb;
    border-color: #e3e5e7;
  }

  &--unpublished {
    opacity: 0.7;
  }
}

.article-cover {
  width: 120px;
  height: 80px;
  border-radius: $radius-sm;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  align-items: center;
  gap: $space-3;
}

.meta-stats {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $text-xs;
  color: $text-tertiary;

  svg {
    opacity: 0.7;
  }
}

.unpublished-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: $space-2;
  padding: 2px 8px;
  background: rgba($warning, 0.1);
  color: $warning;
  border-radius: $radius-sm;
  font-size: $text-xs;
}

.meta-author {
  font-size: $text-xs;
  color: $primary;
}

.meta-item {
  font-size: $text-xs;
  color: $text-tertiary;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: $radius-lg;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 $space-5;
  border-bottom: 1px solid #e3e5e7;

  h3 {
    font-size: $text-lg;
    font-weight: $font-weight-semibold;
    color: #18191c;
  }
}

.dialog-close {
  font-size: $text-2xl;
  color: #9499a0;
  cursor: pointer;
  line-height: 1;
  
  &:hover {
    color: #18191c;
  }
}

.dialog-body {
  padding: $space-5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
  padding: $space-4 $space-5;
  border-top: 1px solid #e3e5e7;
}

.form-group {
  margin-bottom: $space-4;
}

.form-label {
  display: block;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  margin-bottom: $space-2;
  color: #61666d;
}

.input, .textarea {
  width: 100%;
  padding: $space-3;
  border: 1px solid #e3e5e7;
  border-radius: $radius-md;
  font-size: $text-base;
  color: #18191c;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-cancel, .btn-confirm {
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  font-size: $text-sm;
  cursor: pointer;
  transition: all $duration-fast;
}

.btn-cancel {
  background: #f4f5f7;
  border: none;
  color: #61666d;
  
  &:hover {
    background: #e3e5e7;
  }
}

.btn-confirm {
  background: $primary;
  border: none;
  color: white;
  
  &:hover {
    background: $primary-dark;
  }
  
  &:disabled {
    background: #c9ccd0;
    cursor: not-allowed;
  }
}
</style>
