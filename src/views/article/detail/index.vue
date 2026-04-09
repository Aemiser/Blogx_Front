<template>
  <div class="article-detail">
    <div class="app-container">
      <div class="article-detail__main">
        <div class="article-detail__content card">
          <div v-if="loading" class="loading">
            <div class="loading__spinner"></div>
          </div>

          <template v-else-if="article">
            <div class="article-head">
              <h1 class="article-title" :id="article.title">{{ article.title }}</h1>
              <div class="article-date">
                发布时间：{{ formatDate(article.createdAt) }}（{{ formatRelativeTime(article.createdAt) }}）
              </div>
              <div class="article-tags" v-if="article.tagList?.length">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="tags-icon" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter">
                  <path d="m37.581 28.123-14.849 14.85a1 1 0 0 1-1.414 0L8.59 30.243m25.982-22.68-10.685-.628a1 1 0 0 0-.766.291L9.297 21.052a1 1 0 0 0 0 1.414L20.61 33.78a1 1 0 0 0 1.415 0l13.824-13.825a1 1 0 0 0 .291-.765l-.628-10.686a1 1 0 0 0-.94-.94Zm-6.874 7.729a1 1 0 1 1 1.414-1.414 1 1 0 0 1-1.414 1.414Z"></path>
                  <path d="M27.697 15.292a1 1 0 1 1 1.414-1.414 1 1 0 0 1-1.414 1.414Z" fill="currentColor" stroke="none"></path>
                </svg>
                <span class="tag" v-for="tag in article.tagList" :key="tag">{{ tag }}</span>
              </div>
            </div>

            <div class="article-body">
              <ArticleContent 
                :content="article.content" 
                @rendered="onContentRendered"
                @headings-ready="onHeadingsReady"
              />
            </div>
          </template>

          <div v-else class="empty">
            <p>文章不存在或已被删除</p>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="article-comments card" v-if="article">
          <h3 class="comments-title">评论 ({{ article.commentCount }})</h3>
          <div class="comment-form">
            <div class="textarea-wrapper">
              <textarea
                  v-model="commentContent"
                  class="textarea"
                  placeholder="写下你的评论..."
                  rows="3"
              ></textarea>
              <EPicker @select="handleEmojiSelect" />
            </div>
            <BButton
                variant="primary"
                size="sm"
                :loading="submitting"
                @click="submitComment"
            >
              发表评论
            </BButton>
          </div>

          <div class="comments-list">
            <div v-if="comments.length === 0" class="empty">
              <p>暂无评论，快来抢沙发吧</p>
            </div>
            <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                :article-id="article!.id"
                @reply-submitted="refreshComments"
            />
          </div>
        </div>
      </div>

      <aside class="app-content__sidebar desktop-only">
        <ArticleAuthor v-if="article" :author="article" />
        <ArticleNav 
          v-if="article" 
          :headings="tocItems" 
          :current-index="currentTocIndex"
          @update:current-index="handleTocChange"
        />
      </aside>
    </div>
    
    <!-- 移动端目录按钮 -->
    <button v-if="article && tocItems.length > 0" class="mobile-toc-btn" @click="showMobileToc = true">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
    
    <!-- 移动端目录抽屉 -->
    <teleport to="body">
      <transition name="slide">
        <div v-if="showMobileToc" class="mobile-toc-overlay" @click.self="showMobileToc = false">
          <div class="mobile-toc-drawer">
            <div class="mobile-toc-header">
              <h3>目录</h3>
              <button class="close-btn" @click="showMobileToc = false">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav class="mobile-toc-list">
              <a 
                v-for="(item, index) in tocItems" 
                :key="item.id"
                :href="`#${item.id}`"
                class="toc-item"
                :class="{ active: currentTocIndex === index, [`toc-level-${item.level}`]: true }"
                @click="showMobileToc = false; scrollToHeading(item.id)"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ArticleDetail, CommentTreeNode } from '@/types'
import { getArticleDetail, lookArticle, diggArticle } from '@/api/modules/article'
import { getCollectionList } from '@/api/modules/article'
import { getCommentTree, createComment } from '@/api/modules/comment'
import { formatNumber, formatRelativeTime, formatDate } from '@/utils'
import BButton from '@/components/base/BButton/index.vue'
import EPicker from '@/components/base/EPicker/index.vue'
import CommentItem from '@/components/comment/CommentItem.vue'
import ArticleAuthor from './ArticleAuthor.vue'
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleNav from '@/components/article/ArticleNav.vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

interface TocItem {
  id: string
  text: string
  level: number
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const article = ref<ArticleDetail | null>(null)
const comments = ref<CommentTreeNode[]>([])
const commentContent = ref('')
const submitting = ref(false)
const showCollectDialog = ref(false)
const collections = ref<Array<{ id: number; title: string; isDefault: boolean; ArticleCount?: number }>>([])
const selectedCollectId = ref(0)
const showMobileToc = ref(false)
const tocItems = ref<TocItem[]>([])
const currentTocIndex = ref(0)

const onTitlesExtracted = (titles: TocItem[]) => {
  tocItems.value = titles
}

const onHeadingsReady = (headings: TocItem[]) => {
  tocItems.value = headings
}

const handleTocChange = (index: number) => {
  currentTocIndex.value = index
  scrollToHeading(tocItems.value[index].id)
}

const scrollToHeading = (id: string) => {
  const doScroll = () => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
  
  nextTick(doScroll)
  setTimeout(doScroll, 300)
}

const onContentRendered = (html: string) => {
  nextTick(() => {
    updateActiveToc()
  })
}

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}

const updateActiveToc = () => {
  if (tocItems.value.length === 0) return
  
  const viewportCenter = window.innerHeight / 3
  let newIndex = 0
  
  for (let i = tocItems.value.length - 1; i >= 0; i--) {
    const element = document.getElementById(tocItems.value[i].id)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= viewportCenter) {
        newIndex = i
        break
      }
    }
  }
  
  currentTocIndex.value = newIndex
}

const handleScroll = throttle(updateActiveToc, 100)

async function fetchArticle() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    
    if (!id || isNaN(id)) {
      console.error('Invalid article ID:', route.params.id)
      router.replace('/')
      return
    }
    
    const res = await getArticleDetail(id)
    const data = res.data
    article.value = {
      ...data,
      id: data.ID || data.id,
      createdAt: data.CreatedAt || data.createdAt,
      updatedAt: data.UpdatedAt || data.updatedAt
    }
    console.log('文章详情返回数据:', data)
    console.log('article.id:', article.value.id)

    lookArticle(id).catch(() => {})

    fetchComments(id)
  } catch (error) {
    console.error('Failed to fetch article:', error)
  } finally {
    loading.value = false
  }
}

async function fetchComments(articleID: number) {
  try {
    const res = await getCommentTree(articleID)
    comments.value = res.data?.list || []
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  }
}

async function handleDigg() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    await diggArticle(article.value!.id)
    article.value!.isDigg = !article.value!.isDigg
    article.value!.diggCount += article.value!.isDigg ? 1 : -1
  } catch (error) {
    console.error('Failed to digg:', error)
  }
}

async function handleCollect() {
    if (!userStore.isLoggedIn) {
        router.push('/login')
        return
    }

    try {
        const res = await getCollectionList({ type: 1, UserID: 0, page: 1, limit: 100 })
        collections.value = (res.data?.list || []).map((item: any) => ({
            id: item.ID || item.id,
            title: item.title,
            isDefault: item.isDefault,
            ArticleCount: item.ArticleCount
        }))
        
        showCollectDialog.value = true
    } catch (error) {
        console.error('Failed to fetch collections:', error)
        toast.error('获取收藏夹列表失败，请稍后重试')
    }
}

async function submitComment() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!commentContent.value.trim()) {
    toast.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await createComment({
      content: commentContent.value,
      articleID: article.value!.id
    })
    commentContent.value = ''
    refreshComments()
  } catch (error) {
    console.error('Failed to submit comment:', error)
  } finally {
    submitting.value = false
  }
}

function refreshComments() {
  if (article.value) {
    fetchComments(article.value.id)
  }
}

function handleEmojiSelect(emoji: string) {
  commentContent.value += emoji
}

onMounted(() => {
  fetchArticle()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.article-detail {
  padding: $space-6 0;

.app-container {
  display: flex;
  gap: $space-6;
  position: relative;
  z-index: 2;
}

&__main {
  flex: 1;
  min-width: 0;
  position: relative;
}

.app-content__sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

&__content {
  padding: $space-6;
}
}

.article-head {
  margin-bottom: $space-6;
  padding-bottom: $space-6;
  border-bottom: 1px solid $border-light;
  text-align: center;
}

.article-title {
  font-size: $text-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.5;
  margin-bottom: $space-3;
}

.article-date {
  font-size: $text-xs;
  color: $text-tertiary;
  margin-bottom: $space-4;
}

.article-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  flex-wrap: wrap;

  .tags-icon {
    width: 14px;
    height: 14px;
    color: $text-tertiary;
    flex-shrink: 0;
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: $text-xs;
    color: $text-secondary;
    border-radius: $radius-sm;
    background: $bg-secondary;
    transition: all $duration-fast;

    &:hover {
      color: $primary;
      background: rgba($primary, 0.1);
    }
  }
}

.article-body {
  font-size: $text-lg;
  line-height: $line-height-relaxed;
  color: $text-primary;
  word-wrap: break-word;
}

.article-comments {
  margin-top: $space-6;
  padding: $space-6;
}

.comments-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin-bottom: $space-6;

  .btn {
    align-self: flex-end;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  justify-content: center;
  padding: $space-12;
}

.empty {
  text-align: center;
  padding: $space-8;
  color: $text-tertiary;
}

@media (max-width: $breakpoint-lg) {
  .app-content__sidebar.desktop-only {
    display: none;
  }
}

@media (max-width: $breakpoint-md) {
  .article-detail {
    padding: $space-4 0;
  }
  
  .article-detail__content {
    padding: $space-4;
    border-radius: $radius-md;
  }
  
  .article-head {
    padding-bottom: $space-4;
    margin-bottom: $space-4;
  }
  
  .article-title {
    font-size: $text-xl;
  }
  
  .article-date {
    font-size: 11px;
  }
  
  .article-tags {
    .tag {
      font-size: 11px;
      padding: 2px 6px;
    }
  }
  
  .article-body {
    font-size: $text-base;
  }
  
  .article-comments {
    padding: $space-4;
    margin-top: $space-4;
    border-radius: $radius-md;
  }
  
  .comments-title {
    font-size: $text-base;
    margin-bottom: $space-4;
  }
  
  .comment-form {
    margin-bottom: $space-4;
  }
  
  .mobile-toc-btn {
    display: flex;
    position: fixed;
    right: $space-4;
    bottom: $space-4;
    width: 48px;
    height: 48px;
    border-radius: $radius-full;
    background: var(--primary);
    color: white;
    border: none;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-lg;
    cursor: pointer;
    z-index: 50;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .mobile-toc-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  .mobile-toc-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    max-width: 80vw;
    background: var(--bg-card);
    display: flex;
    flex-direction: column;
  }
  
  .mobile-toc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-4;
    border-bottom: 1px solid var(--border-light);
    
    h3 {
      font-size: $text-lg;
      font-weight: $font-weight-semibold;
      color: var(--text-primary);
    }
    
    .close-btn {
      background: none;
      border: none;
      padding: $space-2;
      color: var(--text-secondary);
      cursor: pointer;
    }
  }
  
  .mobile-toc-list {
    flex: 1;
    overflow-y: auto;
    padding: $space-3;
  }
  
  .mobile-toc-list .toc-item {
    display: block;
    padding: $space-2 $space-3;
    color: var(--text-secondary);
    font-size: $text-sm;
    text-decoration: none;
    border-radius: $radius-md;
    margin-bottom: 2px;
    
    &:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    
    &.toc-level-1 {
      font-weight: $font-weight-medium;
      color: var(--text-primary);
    }
    
    &.toc-level-2 {
      padding-left: $space-5;
    }
    
    &.toc-level-3 {
      padding-left: $space-6;
      font-size: $text-xs;
    }
    
    &.active {
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.1);
    }
  }
  
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
    
    .mobile-toc-drawer {
      transition: transform 0.3s ease;
    }
  }
  
  .slide-enter-from,
  .slide-leave-to {
    background: transparent;
    
    .mobile-toc-drawer {
      transform: translateX(100%);
    }
  }
}

[data-theme="dark"] {
  .article-head {
    border-color: var(--border);
  }

  .article-title {
    color: var(--text-primary);
  }

  .article-date {
    color: var(--text-tertiary);
  }

  .article-tags {
    .tags-icon {
      color: var(--text-tertiary);
    }

    .tag {
      color: var(--text-secondary);
      background: var(--bg-secondary);

      &:hover {
        color: var(--primary);
        background: rgba(0, 161, 214, 0.2);
      }
    }
  }

  .article-comments {
    border-color: var(--border);
  }
}
</style>