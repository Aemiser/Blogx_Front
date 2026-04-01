<template>
  <div class="article-detail">
    <div class="app-container">
      <div class="article-detail__main">
        <div class="article-detail__content card">
          <div v-if="loading" class="loading">
            <div class="loading__spinner"></div>
          </div>

          <template v-else-if="article">
            <h1 class="article-title">{{ article.title }}</h1>

            <div class="article-meta">
              <div class="article-author" @click="goProfile(article.userID)">
                <BAvatar :src="article.userAvatar" :size="40" :alt="article.nickName" />
                <div class="article-author__info">
                  <span class="article-author__name">{{ article.nickName }}</span>
                  <span class="article-author__time">{{ formatRelativeTime(article.createdAt) }}</span>
                </div>
              </div>

              <div class="article-stats">
                <span>{{ formatNumber(article.lookCount) }} 阅读</span>
                <span>{{ article.commentCount }} 评论</span>
                <span>{{ article.diggCount }} 点赞</span>
              </div>
            </div>

            <div class="article-body markdown-body" v-html="renderedContent"></div>

            <div class="article-tags" v-if="article.tagList?.length">
              <span class="tag" v-for="tag in article.tagList" :key="tag">{{ tag }}</span>
            </div>

            <div class="article-actions">
              <button
                  class="action-btn"
                  :class="{ active: article.isDigg }"
                  @click="handleDigg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                <span>点赞</span>
              </button>
              <button
                  class="action-btn"
                  :class="{ active: article.isCollect }"
                  @click="handleCollect"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>收藏</span>
              </button>
              <button class="action-btn" @click="handleShare">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>分享</span>
              </button>
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
            <textarea
                v-model="commentContent"
                class="textarea"
                placeholder="写下你的评论..."
                rows="3"
            ></textarea>
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

      <aside class="app-content__sidebar">
        <ArticleAuthor v-if="article" :author="article" />
        <TableOfContents v-if="article" :content="article.content" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import 'github-markdown-css'
import type { ArticleDetail, CommentTreeNode } from '@/types'
import { getArticleDetail, diggArticle, collectArticle, lookArticle } from '@/api/modules/article'
import { getCommentTree, createComment } from '@/api/modules/comment'
import { formatNumber, formatRelativeTime } from '@/utils'
import BAvatar from '@/components/base/BAvatar/index.vue'
import BButton from '@/components/base/BButton/index.vue'
import CommentItem from '@/components/comment/CommentItem.vue'
import ArticleAuthor from './ArticleAuthor.vue'
import TableOfContents from './TableOfContents.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const article = ref<ArticleDetail | null>(null)
const comments = ref<CommentTreeNode[]>([])
const commentContent = ref('')
const submitting = ref(false)
const articleBodyRef = ref<HTMLElement | null>(null)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str: string, lang: string) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    let highlighted: string

    try {
      if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(str, { language: lang }).value
      } else {
        highlighted = hljs.highlightAuto(str).value
      }
    } catch (e) {
      highlighted = md.utils.escapeHtml(str)
    }

    const langLabel = language.toUpperCase()
    const escapedText = encodeURIComponent(str)

    // 为每行代码添加行号
    const lines = highlighted.split('\n')
    const lineNumbers = lines.map((_, i) => `<span class="line-number">${i + 1}</span>`).join('')
    const codeLines = lines.map(line => `<span class="code-line">${line || ' '}</span>`).join('')

    return `<details class="code-block" open>
      <summary class="code-header">
        <div class="code-dots"><span></span><span></span><span></span></div>
        <div class="code-actions">
          <span class="code-lang">${langLabel}</span>
          <button class="copy-btn" data-code="${escapedText}">复制代码</button>
        </div>
      </summary>
      <div class="code-body">
        <div class="line-numbers">${lineNumbers}</div>
        <pre class="language-${language}"><code class="hljs language-${language}">${codeLines}</code></pre>
      </div>
    </details>`
  }
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return md.render(article.value.content)
})

function setupCopyButtons() {
  nextTick(() => {
    const copyBtns = document.querySelectorAll('.copy-btn')
    copyBtns.forEach(btn => {
      if ((btn as any)._hasListener) return
          ;(btn as any)._hasListener = true

      btn.addEventListener('click', function(this: HTMLElement) {
        const code = decodeURIComponent(this.dataset.code || '')
        navigator.clipboard.writeText(code).then(() => {
          const originalText = this.textContent
          this.textContent = '已复制'
          this.classList.add('copied')
          setTimeout(() => {
            this.textContent = originalText
            this.classList.remove('copied')
          }, 2000)
        })
      })
    })
  })
}

async function fetchArticle() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getArticleDetail(id)
    article.value = res.data

    // 记录浏览
    lookArticle(id).catch(() => {})

    // 获取评论
    fetchComments(id)

    // 设置复制按钮
    nextTick(() => {
      setupCopyButtons()
    })
  } catch (error) {
    console.error('Failed to fetch article:', error)
  } finally {
    loading.value = false
  }
}

async function fetchComments(articleID: number) {
  try {
    const res = await getCommentTree(articleID)
    comments.value = res.data.list
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
    await collectArticle({ articleID: article.value!.id, collectID: 0 })
    article.value!.isCollect = !article.value!.isCollect
    article.value!.collectCount += article.value!.isCollect ? 1 : -1
  } catch (error) {
    console.error('Failed to collect:', error)
  }
}

function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  alert('链接已复制到剪贴板')
}

async function submitComment() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!commentContent.value.trim()) {
    alert('请输入评论内容')
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

function goProfile(id: number) {
  router.push(`/user/${id}`)
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped lang="scss">
.article-detail {
  padding: $space-6 0;

  .app-container {
    display: flex;
    gap: $space-6;
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__content {
    padding: $space-6;
  }
}

.article-title {
  font-size: $text-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: $space-6;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: $space-6;
  border-bottom: 1px solid $border-light;
  margin-bottom: $space-6;
}

.article-author {
  display: flex;
  align-items: center;
  gap: $space-3;
  cursor: pointer;

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  &__time {
    font-size: $text-xs;
    color: $text-tertiary;
  }
}

.article-stats {
  display: flex;
  gap: $space-4;
  font-size: $text-sm;
  color: $text-tertiary;
}

.article-body {
  font-size: $text-lg;
  line-height: $line-height-relaxed;
  color: $text-primary;
  word-wrap: break-word;

  // 代码块容器
  :deep(.code-block) {
    margin: $space-4 0;
    border-radius: $radius-lg;
    overflow: hidden;
    background: #0d1117;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid #30363d;

    > summary {
      list-style: none;
      cursor: pointer;

      &::-webkit-details-marker {
        display: none;
      }
    }
  }

  // 代码块顶部栏
  :deep(.code-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #161b22;
    border-bottom: 1px solid #30363d;
    min-height: 38px;
  }

  // macOS 风格的三个圆点
  :deep(.code-dots) {
    display: flex;
    gap: 6px;

    span {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &:nth-child(1) {
        background: #ff5f56;
      }

      &:nth-child(2) {
        background: #ffbd2e;
      }

      &:nth-child(3) {
        background: #27ca40;
      }
    }
  }

  // 代码块右侧操作区
  :deep(.code-actions) {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :deep(.code-lang) {
    font-size: 12px;
    color: #8b949e;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  :deep(.copy-btn) {
    padding: 4px 12px;
    background: transparent;
    border: 1px solid #30363d;
    border-radius: 4px;
    color: #8b949e;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #21262d;
      color: #c9d1d9;
      border-color: #8b949e;
    }

    &.copied {
      background: rgba(63, 185, 80, 0.2);
      border-color: #3fb950;
      color: #3fb950;
    }
  }

  // 代码块内容区域
  :deep(.code-body) {
    display: flex;
    overflow-x: auto;
    position: relative;
  }

  // 行号区域
  :deep(.line-numbers) {
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    padding-left: 16px;
    padding-right: 12px;
    border-right: 1px solid #30363d;
    background: rgba(0, 0, 0, 0.1);
    user-select: none;
    text-align: right;
    min-width: 40px;
    flex-shrink: 0;

    .line-number {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #6e7681;
    }
  }

  // 代码块内容
  :deep(pre) {
    margin: 0;
    padding: 16px;
    background: transparent;
    flex: 1;
    overflow-x: auto;

    code {
      display: block;
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      tab-size: 2;
    }
  }

  // 代码行
  :deep(.code-line) {
    display: block;
  }

  // 行内代码
  :deep(code:not(pre code)) {
    background: rgba($primary, 0.1);
    padding: 2px 6px;
    border-radius: $radius-sm;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.85em;
    color: $accent;
    font-weight: $font-weight-medium;
  }
}

.article-tags {
  display: flex;
  gap: $space-2;
  margin-top: $space-6;
  padding-top: $space-6;
  border-top: 1px solid $border-light;
}

.article-actions {
  display: flex;
  gap: $space-4;
  margin-top: $space-6;
  padding-top: $space-6;
  border-top: 1px solid $border-light;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-3 $space-4;
  border: 1px solid $border;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $text-sm;
  transition: all $duration-fast;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &.active {
    background: rgba($primary, 0.1);
    border-color: $primary;
    color: $primary;
  }
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
  .app-content__sidebar {
    display: none;
  }
}

[data-theme="dark"] {
  .article-body {
    color: $dark-text-primary;

    :deep(code:not(pre code)) {
      background: rgba($primary, 0.2);
      color: $accent-light;
    }
  }

  .article-title {
    color: $dark-text-primary;
  }

  .article-meta {
    border-color: $dark-border;
  }

  .article-tags {
    border-color: $dark-border;
  }

  .article-actions {
    border-color: $dark-border;
  }

  .action-btn {
    border-color: $dark-border;
    color: $dark-text-secondary;

    &:hover {
      border-color: $primary;
      color: $primary;
    }
  }

  .article-comments {
    border-color: $dark-border;
  }
}
</style>
