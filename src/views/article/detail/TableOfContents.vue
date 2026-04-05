<template>
  <div class="sidebar-card table-of-contents" v-if="headings.length > 0">
    <h4 class="sidebar-card__title">目录</h4>
    <nav class="toc-nav">
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        class="toc-item"
        :class="[`toc-item--${heading.level}`, { active: activeId === heading.id }]"
        @click.prevent="scrollToHeading(heading.id)"
      >
        {{ heading.text }}
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
          <!-- 收藏夹列表 -->
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

          <!-- 创建新收藏夹 -->
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ArticleDetail, Collection } from '@/types'
import { diggArticle, collectArticle, getCollectionList, saveCollection } from '@/api/modules/article'
import { useUserStore } from '@/stores/user'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content: string
  article?: ArticleDetail | null
}>()

const router = useRouter()
const userStore = useUserStore()
const headings = ref<Heading[]>([])
const activeId = ref('')

// 收藏夹弹窗相关
const isCollectDialogOpen = ref(false)
const collections = ref<Collection[]>([])
const selectedCollectId = ref<number>(0)

// 创建收藏夹相关
const isCreatingCollection = ref(false)
const newCollectionName = ref('')
const newCollectionAbstract = ref('')

function parseHeadings(content: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const result: Heading[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')

    result.push({ id, text, level })
  }

  headings.value = result
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

function updateActiveHeading() {
  const headingElements = headings.value.map(h => document.getElementById(h.id))
  const scrollTop = window.scrollY + 100

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const element = headingElements[i]
    if (element && element.offsetTop <= scrollTop) {
      activeId.value = headings.value[i].id
      return
    }
  }

  if (headings.value.length > 0) {
    activeId.value = headings.value[0].id
  }
}

async function fetchCollections() {
  if (!userStore.isLoggedIn) return
  
  try {
    const res = await getCollectionList({ type: 1, page: 1, limit: 100 }) // type: 1 for own collections
    collections.value = res.data.list || []
    
    // 如果有默认收藏夹，自动选中
    const defaultCollection = collections.value.find(c => c.isDefault)
    if (defaultCollection) {
      selectedCollectId.value = defaultCollection.id
    } else if (collections.value.length > 0) {
      selectedCollectId.value = collections.value[0].id
    }
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }
}

function openCollectDialog() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  if (!props.article) return
  
  fetchCollections()
  isCollectDialogOpen.value = true
}

// 处理收藏点击
async function handleCollectClick() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  if (!props.article) return
  
  // 如果已收藏，则取消收藏（使用文章所在收藏夹ID）
  if (props.article.isCollect) {
    await handleCancelCollect()
  } else {
    // 未收藏，打开收藏弹窗
    openCollectDialog()
  }
}

// 取消收藏 - 使用文章所在收藏夹的collectID
async function handleCancelCollect() {
  if (!props.article) return
  
  try {
    await collectArticle({ 
      articleID: props.article.id, 
      collectID: props.article.collectID!
    })
    
    // 更新文章收藏状态
    props.article.isCollect = false
    props.article.collectID = 0
    props.article.collectCount -= 1
  } catch (error) {
    console.error('Failed to cancel collect:', error)
    alert('取消收藏失败')
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
    // 重新获取收藏夹列表
    await fetchCollections()
    cancelCreateCollection()
  } catch (error) {
    console.error('Failed to create collection:', error)
    alert('创建收藏夹失败')
  }
}

async function confirmCollect() {
  if (!props.article || !selectedCollectId.value) return
  
  try {
    await collectArticle({ 
      articleID: props.article.id, 
      collectID: selectedCollectId.value 
    })
    
    // 更新文章收藏状态
    if (!props.article.isCollect) {
      props.article.isCollect = true
      props.article.collectCount += 1
      props.article.collectID = selectedCollectId.value
    }
    
    closeCollectDialog()
  } catch (error) {
    console.error('Failed to collect:', error)
    alert('收藏失败')
  }
}

function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  alert('链接已复制到剪贴板')
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

watch(() => props.content, (newContent) => {
  if (newContent) {
    parseHeadings(newContent)
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', updateActiveHeading)
  updateActiveHeading()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})
</script>

<style scoped lang="scss">
.table-of-contents {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  margin-bottom: $space-4;
  position: sticky;
  top: $space-4;
}

.sidebar-card__title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $space-4;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  max-height: 400px;
  overflow-y: auto;
}

.toc-item {
  display: block;
  padding: $space-2 $space-3;
  font-size: $text-sm;
  color: $text-secondary;
  text-decoration: none;
  border-radius: $radius-sm;
  border-left: 2px solid transparent;
  transition: all $duration-fast;
  line-height: 1.4;

  &:hover {
    color: $primary;
    background: $bg-hover;
  }

  &.active {
    color: $primary;
    border-left-color: $primary;
    background: rgba($primary, 0.1);
  }

  &--1 {
    padding-left: $space-3;
    font-weight: $font-weight-medium;
  }

  &--2 {
    padding-left: $space-5;
  }

  &--3 {
    padding-left: $space-6;
    font-size: $text-xs;
  }

  &--4,
  &--5,
  &--6 {
    padding-left: $space-8;
    font-size: $text-xs;
  }
}

.article-actions-sidebar {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  position: sticky;
  top: calc($space-4 + 420px);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: $space-4;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $space-1;
  padding: $space-2;
  border: 1px solid $border;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $text-sm;
  transition: all $duration-fast;
  cursor: pointer;
  background: transparent;

  &:hover {
    border-color: $primary;
    color: $primary;
    background: rgba($primary, 0.1);
  }

  &.active {
    border-color: $primary;
    color: $primary;
  }

  .action-count {
    font-size: $text-xs;
    color: $text-tertiary;
  }
}

// 收藏夹弹窗样式
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
  background: $bg-card;
  border-radius: $radius-lg;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.collect-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4 $space-6;
  border-bottom: 1px solid $border;
}

.collect-dialog__title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0;
}

.collect-dialog__close {
  background: none;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  padding: $space-1;
  border-radius: $radius-sm;
  transition: all $duration-fast;

  &:hover {
    color: $text-primary;
    background: $bg-hover;
  }
}

.collect-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: $space-4 $space-6;
}

.collection-list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-bottom: $space-4;
}

.collection-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $duration-fast;
  border: 2px solid transparent;

  &:hover {
    background: $bg-hover;
  }

  &.active {
    background: rgba($primary, 0.1);
    border-color: $primary;
    color: $primary;
  }
}

.collection-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.collection-item__info {
  flex: 1;
  min-width: 0;
}

.collection-item__title {
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: inherit;
  margin-bottom: $space-1;
}

.collection-item__count {
  font-size: $text-xs;
  color: $text-tertiary;
}

.collection-item__default {
  font-size: $text-xs;
  padding: $space-1 $space-2;
  background: $primary;
  color: white;
  border-radius: $radius-sm;
}

.create-collection {
  border-top: 1px solid $border;
  padding-top: $space-4;
}

.create-collection__toggle {
  display: flex;
  align-items: center;
  gap: $space-2;
  width: 100%;
  padding: $space-3;
  background: none;
  border: 2px dashed $border;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $text-sm;
  cursor: pointer;
  transition: all $duration-fast;

  &:hover {
    border-color: $primary;
    color: $primary;
  }
}

.create-collection__form {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.create-collection__input {
  width: 100%;
  padding: $space-3;
  border: 1px solid $border;
  border-radius: $radius-md;
  font-size: $text-sm;
  background: $bg-primary;
  color: $text-primary;

  &:focus {
    outline: none;
    border-color: $primary;
  }

  &::placeholder {
    color: $text-tertiary;
  }
}

.create-collection__actions {
  display: flex;
  gap: $space-3;
  justify-content: flex-end;
}

.create-collection__btn {
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  font-size: $text-sm;
  cursor: pointer;
  transition: all $duration-fast;
}

.create-collection__btn--cancel {
  background: none;
  border: 1px solid $border;
  color: $text-secondary;

  &:hover {
    background: $bg-hover;
  }
}

.create-collection__btn--confirm {
  background: $primary;
  border: none;
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.collect-dialog__footer {
  padding: $space-4 $space-6;
  border-top: 1px solid $border;
  display: flex;
  justify-content: flex-end;
}

.collect-dialog__submit {
  padding: $space-3 $space-6;
  background: $primary;
  border: none;
  border-radius: $radius-md;
  color: white;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $duration-fast;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

[data-theme="dark"] {
  .table-of-contents,
  .article-actions-sidebar {
    background: $dark-bg-card;
  }

  .sidebar-card__title {
    color: $dark-text-primary;
  }

  .toc-item {
    color: $dark-text-secondary;

    &:hover {
      color: $primary;
      background: $dark-bg-hover;
    }

    &.active {
      background: rgba($primary, 0.2);
    }
  }

  .action-btn {
    border-color: $dark-border;
    color: $dark-text-secondary;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    .action-count {
      color: $dark-text-tertiary;
    }
  }

  .collect-dialog {
    background: $dark-bg-card;
  }

  .collect-dialog__header {
    border-color: $dark-border;
  }

  .collect-dialog__title {
    color: $dark-text-primary;
  }

  .collect-dialog__close {
    color: $dark-text-secondary;

    &:hover {
      color: $dark-text-primary;
      background: $dark-bg-hover;
    }
  }

  .collection-item {
    &:hover {
      background: $dark-bg-hover;
    }
  }

  .collection-item__count {
    color: $dark-text-tertiary;
  }

  .create-collection {
    border-color: $dark-border;
  }

  .create-collection__toggle {
    border-color: $dark-border;
    color: $dark-text-secondary;

    &:hover {
      border-color: $primary;
      color: $primary;
    }
  }

  .create-collection__input {
    background: $dark-bg-card;
    border-color: $dark-border;
    color: $dark-text-primary;

    &::placeholder {
      color: $dark-text-tertiary;
    }
  }

  .create-collection__btn--cancel {
    border-color: $dark-border;
    color: $dark-text-secondary;

    &:hover {
      background: $dark-bg-hover;
    }
  }

  .collect-dialog__footer {
    border-color: $dark-border;
  }
}
</style>
