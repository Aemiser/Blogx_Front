<template>
  <div class="sidebar-card table-of-contents" v-if="headings.length > 0">
    <h4 class="sidebar-card__title">目录</h4>
    <nav class="toc-nav">
      <a
        v-for="(title, index) in headings"
        :key="title.id"
        class="toc-item"
        :class="[`toc-item--${title.level}`, { active: currentIndex === index }]"
        :style="{ paddingLeft: `${12 + (title.level - 1) * 16}px` }"
        @click.prevent="handleClick(index)"
      >
        {{ title.text }}
      </a>
    </nav>
  </div>

  <div class="sidebar-card article-actions-sidebar">
    <div class="action-buttons">
      <button
        class="action-btn"
        :class="{ active: article?.isDigg }"
        @click="handleDigg"
        :title="`点赞 ${article?.diggCount || 0}`"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" :fill="article?.isDigg ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        <span class="action-count">{{ article?.diggCount || 0 }}</span>
      </button>
      <button
        class="action-btn"
        :class="{ active: article?.isCollect }"
        @click="handleCollectClick"
        :title="`收藏 ${article?.collectCount || 0}`"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" :fill="article?.isCollect ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span class="action-count">{{ article?.collectCount || 0 }}</span>
      </button>
      <button class="action-btn" @click="handleShare" title="分享">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- 收藏夹选择弹窗 -->
  <Teleport to="body">
    <div v-if="isCollectDialogOpen" class="collect-dialog-overlay" @click="closeCollectDialog">
      <div class="collect-dialog" @click.stop>
        <div class="collect-dialog__header">
          <h3 class="collect-dialog__title">选择收藏夹</h3>
          <button class="collect-dialog__close" @click="closeCollectDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="collect-dialog__body">
          <div class="collection-list">
            <div
              v-for="collection in collections"
              :key="collection.id"
              class="collection-item"
              :class="{ active: selectedCollectId === collection.id }"
              @click="selectCollection(collection.id)"
            >
              <div class="collection-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" :fill="selectedCollectId === collection.id ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div class="collection-item__info">
                <div class="collection-item__title">{{ collection.title }}</div>
                <div class="collection-item__count">{{ collection.ArticleCount || 0 }} 篇文章</div>
              </div>
              <div v-if="collection.isDefault" class="collection-item__default">默认</div>
            </div>
          </div>

          <div class="create-collection">
            <div v-if="isCreatingCollection" class="create-collection__form">
                <input
                v-model="newCollectionName"
                type="text"
                class="create-collection__input"
                placeholder="请输入收藏夹名称"
                maxlength="50"
                @keyup.enter="confirmCreateCollection"
              />
              <input
                v-model="newCollectionAbstract"
                type="text"
                class="create-collection__input"
                placeholder="请输入简介"
                maxlength="100"
                @keyup.enter="confirmCreateCollection"
              />
              <div class="create-collection__actions">
                <button class="create-collection__btn create-collection__btn--cancel" @click="cancelCreateCollection">取消</button>
                <button class="create-collection__btn create-collection__btn--confirm" @click="confirmCreateCollection" :disabled="!newCollectionName.trim() || !newCollectionAbstract.trim()">确定</button>
              </div>
            </div>
            <button v-else class="create-collection__toggle" @click="startCreateCollection">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              新建收藏夹
            </button>
          </div>
        </div>
        
        <div class="collect-dialog__footer">
          <button class="collect-dialog__submit" :disabled="!selectedCollectId" @click="confirmCollect">
            确定收藏
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ArticleDetail, Collection } from '@/types'
import { diggArticle, getCollectionList, saveCollection } from '@/api/modules/article'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'
import request from '@/api'

interface TitleItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  headings: TitleItem[]
  currentIndex: number
  article?: ArticleDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:currentIndex', index: number): void
}>()

const router = useRouter()
const userStore = useUserStore()

const isCollectDialogOpen = ref(false)
const collections = ref<Collection[]>([])
const selectedCollectId = ref(0)
const isCreatingCollection = ref(false)
const newCollectionName = ref('')
const newCollectionAbstract = ref('')

const handleClick = (index: number) => {
  const title = props.headings[index]
  if (!title) return
  
  emit('update:currentIndex', index)
  
  requestAnimationFrame(() => {
    const element = document.getElementById(title.id)
    if (element) {
      const headerOffset = 80
      const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  })
}

async function handleDigg() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!props.article) return

  try {
    await diggArticle(props.article.id)
    props.article.isDigg = !props.article.isDigg
    props.article.diggCount += props.article.isDigg ? 1 : -1
  } catch (error) {
    console.error('Failed to digg:', error)
  }
}

async function handleCollectClick() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!props.article) return

  if (props.article.isCollect) {
    await handleCancelCollect()
  } else {
    openCollectDialog()
  }
}

async function handleCancelCollect() {
  if (!props.article) return
  
  try {
    await request({
      url: '/api/article/collect',
      method: 'POST',
      data: {
        articleID: props.article.id,
        collectID: props.article.collectID!
      }
    })
    
    props.article.isCollect = false
    props.article.collectID = 0
    props.article.collectCount -= 1
    toast.success('取消收藏成功')
  } catch (error) {
    console.error('Failed to cancel collect:', error)
    toast.error('取消收藏失败')
  }
}

async function openCollectDialog() {
  if (!props.article) return
  
  try {
    const res = await getCollectionList({ type: 1, page: 1, limit: 100 })
    collections.value = res.data.list || []
    
    if (collections.value.length === 0) {
      await saveCollection({ title: '我的收藏', abstract: '默认收藏夹' })
      const res2 = await getCollectionList({ type: 1, page: 1, limit: 100 })
      collections.value = res2.data.list || []
    }
    
    const defaultCollection = collections.value.find(c => c.isDefault)
    if (defaultCollection) {
      selectedCollectId.value = defaultCollection.id
    } else if (collections.value.length > 0) {
      selectedCollectId.value = collections.value[0].id
    }
    
    isCollectDialogOpen.value = true
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }
}

function closeCollectDialog() {
  isCollectDialogOpen.value = false
  selectedCollectId.value = 0
  cancelCreateCollection()
}

function selectCollection(id: number) {
  selectedCollectId.value = id
}

function startCreateCollection() {
  isCreatingCollection.value = true
  newCollectionName.value = ''
  newCollectionAbstract.value = ''
}

function cancelCreateCollection() {
  isCreatingCollection.value = false
  newCollectionName.value = ''
  newCollectionAbstract.value = ''
}

async function confirmCreateCollection() {
  const title = newCollectionName.value.trim()
  if (!title) return
  
  try {
    await saveCollection({ title, abstract: newCollectionAbstract.value.trim() })
    await openCollectDialog()
    cancelCreateCollection()
  } catch (error) {
    console.error('Failed to create collection:', error)
    toast.error('创建收藏夹失败')
  }
}

async function confirmCollect() {
  if (!props.article || !selectedCollectId.value) return
  
  try {
    await request({
      url: '/api/article/collect',
      method: 'POST',
      data: {
        articleID: props.article.id,
        collectID: selectedCollectId.value
      }
    })
    
    if (!props.article.isCollect) {
      props.article.isCollect = true
      props.article.collectCount += 1
      props.article.collectID = selectedCollectId.value
    }
    
    closeCollectDialog()
    toast.success('收藏成功')
  } catch (error) {
    console.error('Failed to collect:', error)
    toast.error('收藏失败')
  }
}

function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  toast.success('链接已复制到剪贴板')
}
</script>

<style scoped>
.table-of-contents {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
}

.article-actions-sidebar {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
}

.sidebar-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toc-item.active {
  color: var(--primary);
  background: rgba(var(--primary-rgb, 102, 126, 234), 0.1);
  font-weight: 500;
}

.toc-item--1 { font-weight: 600; }
.toc-item--2 { font-size: 13px; }
.toc-item--3 { font-size: 12px; opacity: 0.8; }

.article-actions-sidebar {
  background: var(--bg-card);
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 0.2s;
  cursor: pointer;
  background: transparent;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.action-btn.active {
  color: var(--primary);
}

.action-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 收藏夹弹窗样式 */
.collect-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.collect-dialog {
  background: var(--bg-card);
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.collect-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
}

.collect-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.collect-dialog__close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.collect-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.collection-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.collection-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
}

.collection-item:hover {
  background: var(--bg-hover);
}

.collection-item.active {
  background: rgba(var(--primary-rgb, 102, 126, 234), 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

.collection-item__info {
  flex: 1;
  min-width: 0;
}

.collection-item__title {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  margin-bottom: 4px;
}

.collection-item__count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.collection-item__default {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--primary);
  color: white;
  border-radius: 4px;
}

.create-collection {
  border-top: 1px solid var(--border-light);
  padding-top: 16px;
}

.create-collection__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: none;
  border: 2px dashed var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.create-collection__toggle:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.create-collection__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.create-collection__input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.create-collection__input:focus {
  outline: none;
  border-color: var(--primary);
}

.create-collection__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.create-collection__btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.create-collection__btn--cancel {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.create-collection__btn--confirm {
  background: var(--primary);
  border: none;
  color: white;
}

.create-collection__btn--confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.collect-dialog__footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
}

.collect-dialog__submit {
  padding: 12px 24px;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.collect-dialog__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>