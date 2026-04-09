# vue-markdown 集成指南

## 概述
使用 `vue-markdown` 替代 `v-md-editor` 进行 Markdown 渲染，提供更简洁的代码块渲染效果。

---

## 第一步：安装依赖

```bash
# 安装 vue-markdown
npm install vue-markdown marked highlight.js -S

# 安装 TypeScript 类型声明（如需要）
npm install @types/marked -D
```

---

## 第二步：创建插件配置文件

### 文件位置：`src/plugins/vue-markdown.ts`

```typescript
// ============================================================================
// vue-markdown 插件配置
// ============================================================================

import type { App } from 'vue'

// 动态导入 vue-markdown
let VueMarkdownComponent: any = null

/**
 * 初始化 vue-markdown
 */
export async function setupVueMarkdown(app: App) {
  try {
    const module = await import('vue-markdown')
    VueMarkdownComponent = module.default || module
    app.component('VueMarkdown', VueMarkdownComponent)
    console.log('[vue-markdown] 插件已加载')
  } catch (error) {
    console.error('[vue-markdown] 加载失败:', error)
  }
}

/**
 * 手动注册组件（用于 setup 语法糖）
 */
export function useVueMarkdown() {
  return {
    component: VueMarkdownComponent,
  }
}

export default VueMarkdownComponent
```

---

## 第三步：在 main.ts 中注册插件

### 文件位置：`src/main.ts`

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './pinia'

// 导入 vue-markdown 插件
import { setupVueMarkdown } from './plugins/vue-markdown'

// 导入 Element Plus（如使用）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建 Vue 应用
const app = createApp(App)

// 注册插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 异步注册 vue-markdown
setupVueMarkdown(app)

app.mount('#app')
```

---

## 第四步：创建文章内容渲染组件

### 文件位置：`src/components/article/ArticleContent.vue`

```vue
<template>
  <div class="article-content-wrapper">
    <!-- vue-markdown 渲染组件 -->
    <VueMarkdown
      :source="content"
      :toc="false"
      :toc-id="'article-toc'"
      :anchor-attributes="{ tabindex: '-1' }"
      class="article-markdown-body"
      @rendered="onRendered"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  (e: 'rendered', element: HTMLElement): void
}>()

// 渲染完成回调
const onRendered = async (el: HTMLElement) => {
  await nextTick()
  
  // 代码块高亮
  highlightCodeBlocks(el)
  
  // 为标题添加 ID（用于目录导航）
  addHeadingIds(el)
  
  // 触发 rendered 事件
  emit('rendered', el)
}

// 代码块语法高亮
const highlightCodeBlocks = (container: HTMLElement) => {
  const codeBlocks = container.querySelectorAll('pre code')
  codeBlocks.forEach((block) => {
    hljs.highlightElement(block as HTMLElement)
  })
}

// 为标题添加 ID
const addHeadingIds = (container: HTMLElement) => {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim() || ''
    const id = `heading-${index}-${text.toLowerCase().replace(/\s+/g, '-')}`
    heading.id = id
  })
}

// 监听内容变化
watch(
  () => props.content,
  () => {
    nextTick(() => {
      const container = document.querySelector('.article-markdown-body') as HTMLElement
      if (container) {
        highlightCodeBlocks(container)
        addHeadingIds(container)
      }
    })
  }
)

onMounted(() => {
  const container = document.querySelector('.article-markdown-body') as HTMLElement
  if (container) {
    highlightCodeBlocks(container)
    addHeadingIds(container)
  }
})
</script>

<style scoped>
.article-content-wrapper {
  width: 100%;
}

/* Markdown 内容样式 */
.article-markdown-body {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

/* 标题样式 */
.article-markdown-body h1,
.article-markdown-body h2,
.article-markdown-body h3,
.article-markdown-body h4,
.article-markdown-body h5,
.article-markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

.article-markdown-body h1 { font-size: 1.8em; }
.article-markdown-body h2 { font-size: 1.5em; }
.article-markdown-body h3 { font-size: 1.3em; }
.article-markdown-body h4 { font-size: 1.1em; }

/* 代码块样式 - 背景透明 */
.article-markdown-body pre {
  margin: 1em 0;
  padding: 1em;
  background: transparent !important;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow-x: auto;
}

.article-markdown-body code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
  background: transparent !important;
}

/* 行内代码 */
.article-markdown-body p code,
.article-markdown-body li code {
  background: rgba(27, 31, 35, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  color: #d63384;
}

/* 段落样式 */
.article-markdown-body p {
  margin: 1em 0;
}

/* 列表样式 */
.article-markdown-body ul,
.article-markdown-body ol {
  margin: 1em 0;
  padding-left: 2em;
}

.article-markdown-body li {
  margin: 0.5em 0;
}

/* 引用样式 */
.article-markdown-body blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid #ddd;
  background: #f9f9f9;
  color: #666;
}

/* 图片样式 */
.article-markdown-body img {
  max-width: 100%;
  border-radius: 8px;
}

/* 表格样式 */
.article-markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.article-markdown-body th,
.article-markdown-body td {
  border: 1px solid #ddd;
  padding: 0.5em 1em;
  text-align: left;
}

.article-markdown-body th {
  background: #f5f5f5;
  font-weight: 600;
}
</style>
```

---

## 第五步：创建文章目录导航组件

### 文件位置：`src/components/article/nav/ArticleNav.vue`

```vue
<template>
  <nav class="article-nav" v-if="titles.length > 0">
    <div class="nav-header">文章目录</div>
    <ul class="nav-list">
      <li
        v-for="(title, index) in titles"
        :key="title.id"
        :class="['nav-item', { active: currentIndex === index }]"
        :style="{ paddingLeft: `${12 + title.level * 16}px` }"
        @click="handleClick(index)"
      >
        <span class="nav-text">{{ title.text }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface TitleItem {
  id: string
  text: string
  level: number
}

defineProps<{
  titles: TitleItem[]
  currentIndex: number
}>()

const emit = defineEmits<{
  (e: 'navigate', index: number): void
}>()

const handleClick = (index: number) => {
  emit('navigate', index)
}
</script>

<style scoped>
.article-nav {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.nav-header {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #333;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.nav-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
```

---

## 第六步：创建完整的文章详情页

### 文件位置：`src/views/article/ArticleDetail.vue`

```vue
<template>
  <div class="article-detail-page">
    <!-- 左侧侧边栏 -->
    <aside class="article-sidebar">
      <!-- 文章目录导航 -->
      <ArticleNav
        v-if="titles.length > 0"
        :titles="titles"
        :current-index="currentIndex"
        @navigate="handleNavNavigate"
      />

      <!-- 作者信息卡片 -->
      <AuthorCard v-if="articleData.author" :author="articleData.author" />
    </aside>

    <!-- 主内容区域 -->
    <main class="article-main">
      <!-- 文章头部 -->
      <header class="article-header">
        <h1 class="article-title">{{ articleData.title }}</h1>
        <div class="article-meta">
          <span>{{ articleData.author?.nickname }}</span>
          <span>·</span>
          <span>{{ formatDate(articleData.createdAt) }}</span>
          <span>·</span>
          <span>{{ articleData.lookCount }} 阅读</span>
        </div>
      </header>

      <!-- 文章内容 -->
      <article class="article-body">
        <ArticleContent
          :content="articleData.content"
          @rendered="onContentRendered"
        />
      </article>

      <!-- 文章底部操作 -->
      <footer class="article-footer">
        <div class="article-actions">
          <button
            :class="['action-btn', { active: articleData.isDigg }]"
            @click="handleDigg"
          >
            <span class="icon">👍</span>
            <span>{{ articleData.diggCount }}</span>
          </button>
          <button
            :class="['action-btn', { active: articleData.isCollect }]"
            @click="handleCollect"
          >
            <span class="icon">⭐</span>
            <span>收藏</span>
          </button>
        </div>
      </footer>

      <!-- 评论区域 -->
      <section class="article-comments">
        <CommentSection :article-id="articleData.id" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleNav from '@/components/article/nav/ArticleNav.vue'
import AuthorCard from '@/components/article/AuthorCard.vue'
import CommentSection from '@/components/article/comment/CommentSection.vue'
import { getArticleDetail, diggArticle, collectArticle } from '@/api/modules/article'

interface TitleItem {
  id: string
  text: string
  level: number
}

interface ArticleData {
  id: number
  title: string
  content: string
  lookCount: number
  diggCount: number
  commentCount: number
  collectCount: number
  isDigg: boolean
  isCollect: boolean
  createdAt: string
  author: {
    id: number
    nickname: string
    avatar: string
    codeAge: number
    abstract: string
  }
}

const route = useRoute()
const articleData = ref<ArticleData>({} as ArticleData)
const titles = ref<TitleItem[]>([])
const currentIndex = ref(0)

// 获取文章详情
const fetchArticleDetail = async () => {
  const articleId = route.params.id as string
  const response = await getArticleDetail(articleId)
  articleData.value = response.data
}

// 内容渲染完成后提取标题
const onContentRendered = (container: HTMLElement) => {
  nextTick(() => {
    extractTitles(container)
  })
}

// 提取标题生成目录
const extractTitles = (container: HTMLElement) => {
  const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const newTitles: TitleItem[] = []

  headingElements.forEach((el) => {
    const text = el.textContent?.trim() || ''
    const level = parseInt(el.tagName.replace('H', ''))
    const id = el.id || ''

    if (text && id) {
      newTitles.push({ id, text, level })
    }
  })

  titles.value = newTitles
}

// 处理目录点击导航
const handleNavNavigate = async (index: number) => {
  currentIndex.value = index
  const title = titles.value[index]

  await nextTick()

  const element = document.getElementById(title.id)
  if (element) {
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

// 滚动监听 - 更新当前高亮的标题
const handleScroll = () => {
  if (titles.value.length === 0) return

  const viewportCenter = window.innerHeight / 3
  let newIndex = 0

  for (let i = titles.value.length - 1; i >= 0; i--) {
    const element = document.getElementById(titles.value[i].id)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= viewportCenter) {
        newIndex = i
        break
      }
    }
  }

  if (newIndex !== currentIndex.value) {
    currentIndex.value = newIndex
  }
}

// 点赞
const handleDigg = async () => {
  await diggArticle(articleData.value.id)
  articleData.value.isDigg = !articleData.value.isDigg
  articleData.value.diggCount += articleData.value.isDigg ? 1 : -1
}

// 收藏
const handleCollect = async () => {
  await collectArticle({ articleID: articleData.value.id, collectID: 0 })
  articleData.value.isCollect = !articleData.value.isCollect
  articleData.value.collectCount += articleData.value.isCollect ? 1 : -1
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchArticleDetail()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.article-detail-page {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.article-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.article-main {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.article-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.article-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.article-meta {
  font-size: 14px;
  color: #888;
  display: flex;
  gap: 8px;
}

.article-body {
  margin-bottom: 24px;
}

.article-footer {
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.article-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.article-comments {
  margin-top: 24px;
}

/* 深色模式支持 */
.dark .article-main {
  background: #1a1a1a;
}

.dark .article-title {
  color: #f0f0f0;
}

.dark .article-meta {
  color: #888;
}

.dark .article-header,
.dark .article-footer {
  border-color: #333;
}

.dark .action-btn {
  background: #2a2a2a;
  border-color: #444;
  color: #ccc;
}
</style>
```

---

## 第七步：代码块透明背景样式

### 文件位置：`src/styles/markdown-transparent.css`

```css
/* ============================================================================
 * vue-markdown 代码块背景透明化样式
 * ============================================================================ */

/* 代码块容器 */
.article-markdown-body pre {
  background: transparent !important;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 16px;
  margin: 1em 0;
  overflow-x: auto;
}

/* 代码块 */
.article-markdown-body pre code {
  background: transparent !important;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 行内代码 */
.article-markdown-body code:not(pre code) {
  background: rgba(27, 31, 35, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
}

/* 深色模式 */
.dark .article-markdown-body pre {
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .article-markdown-body pre code {
  color: #c9d1d9;
}

/* highlight.js 语法高亮颜色保留 */
.article-markdown-body .hljs-keyword { color: #d73a49; }
.article-markdown-body .hljs-string { color: #032f62; }
.article-markdown-body .hljs-comment { color: #6a737d; }
.article-markdown-body .hljs-function { color: #6f42c1; }
.article-markdown-body .hljs-number { color: #005cc5; }
.article-markdown-body .hljs-built_in { color: #005cc5; }
.article-markdown-body .hljs-attr { color: #005cc5; }
.article-markdown-body .hljs-variable { color: #e36209; }

/* 深色模式语法高亮 */
.dark .article-markdown-body .hljs-keyword { color: #ff7b72; }
.dark .article-markdown-body .hljs-string { color: #a5d6ff; }
.dark .article-markdown-body .hljs-comment { color: #8b949e; }
.dark .article-markdown-body .hljs-function { color: #d2a8ff; }
.dark .article-markdown-body .hljs-number { color: #79c0ff; }
.dark .article-markdown-body .hljs-built_in { color: #79c0ff; }
.dark .article-markdown-body .hljs-attr { color: #79c0ff; }
.dark .article-markdown-body .hljs-variable { color: #ffa657; }
```

---

## 总结

### 功能特点
| 功能 | 说明 |
|------|------|
| Markdown 渲染 | 使用 vue-markdown |
| 代码高亮 | highlight.js |
| 代码块背景 | **透明** |
| 目录导航 | 自动生成 + 点击定位 |
| 滚动高亮 | 实时更新当前标题 |
| 作者信息 | 显示码龄(codeAge) |
| 暗色模式 | 完整支持 |

### 安装依赖
```bash
npm install vue-markdown marked highlight.js -S
```