# v-md-editor 基础主题配置指南

## 概述
使用 v-md-editor 的基础主题（basic theme）替代 GitHub 主题，实现简化的代码块渲染效果：
- ❌ 无行号显示
- ❌ 无复制按钮
- ❌ 无代码折叠功能
- ✅ 仅保留基础语法高亮
- ✅ 简洁的 pre/code 渲染

---

## 第一步：安装依赖

```bash
# 安装 v-md-editor (Vue 3 版本)
npm install @kangc/v-md-editor@next -S

# 安装 highlight.js (代码高亮)
npm install highlight.js -S
```

---

## 第二步：创建插件配置文件

### 文件位置：`src/plugins/vmd-basic.ts`

```typescript
// ============================================================================
// v-md-editor 基础主题配置
// 特点：简洁代码块渲染，无行号、无复制按钮
// ============================================================================

import type { App } from 'vue'

// 引入预览组件
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'

// 引入基础主题
import basicTheme from '@kangc/v-md-editor/lib/theme/basic'
import '@kangc/v-md-editor/lib/theme/style/basic.css'

// 引入 highlight.js
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置基础主题
VMdPreview.use(basicTheme, {
  Hljs: hljs,
})

// 导出插件安装函数
export function installVMdPreview(app: App) {
  app.use(VMdPreview)
}

export default VMdPreview
```

---

## 第三步：在 main.ts 中注册插件

### 文件位置：`src/main.ts`

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './pinia'

// 导入 v-md-editor 基础主题插件
import { installVMdPreview } from './plugins/vmd-basic'

// 导入 Element Plus（如使用）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建 Vue 应用
const app = createApp(App)

// 注册插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.use(installVMdPreview)  // 注册 v-md-editor 基础主题

app.mount('#app')
```

---

## 第四步：在文章详情页中使用

### 文件位置：`src/views/article/ArticleDetail.vue`

```vue
<template>
  <div class="article-detail-page">
    <!-- 侧边栏目录导航 -->
    <aside class="article-sidebar">
      <ArticleNav 
        v-if="titles.length > 0"
        :titles="titles"
        :current-index="currentIndex"
        @navigate="handleNavNavigate"
      />
      <AuthorCard :author="articleData.author" />
    </aside>

    <!-- 文章内容区域 -->
    <main class="article-content-container">
      <div class="article-main-content">
        <!-- 使用 v-md-preview 渲染 Markdown 内容 -->
        <v-md-preview 
          :text="articleData.content" 
          ref="preview"
          class="article-preview"
        ></v-md-preview>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import ArticleNav from '@/components/article/nav/ArticleNav.vue'
import AuthorCard from '@/components/article/AuthorCard.vue'
import { getArticleDetail } from '@/api/modules/article'

interface TitleItem {
  title: string
  lineIndex: string
  indent: number
}

interface ArticleData {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
    avatar: string
    codeAge: number
    abstract: string
  }
}

const route = useRoute()
const preview = ref<any>(null)
const titles = ref<TitleItem[]>([])
const currentIndex = ref(0)
const articleData = ref<ArticleData>({} as ArticleData)

// 获取文章详情
const fetchArticleDetail = async () => {
  const articleId = route.params.id as string
  const response = await getArticleDetail(articleId)
  articleData.value = response.data
  
  await nextTick()
  fetchMarkdownTitles()
}

// 从 v-md-preview 中提取标题生成目录
const fetchMarkdownTitles = async () => {
  await nextTick()
  
  if (!preview.value?.$el) return
  
  const anchors = preview.value.$el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const titleElements = Array.from(anchors).filter(
    (title: Element) => !!title.textContent?.trim()
  )
  
  if (!titleElements.length) return
  
  const hTags = Array.from(new Set(titleElements.map((el: Element) => el.tagName))).sort()
  
  titles.value = titleElements.map((el: Element) => ({
    title: el.textContent?.trim() || '',
    lineIndex: el.getAttribute('data-v-md-line') || '',
    indent: hTags.indexOf(el.tagName),
  }))
}

// 处理目录点击导航
const handleNavNavigate = async (index: number) => {
  currentIndex.value = index
  const title = titles.value[index]
  
  await nextTick()
  
  if (!preview.value?.$el || !title.lineIndex) return
  
  const heading = preview.value.$el.querySelector(`[data-v-md-line="${title.lineIndex}"]`)
  
  if (heading) {
    const headingRect = heading.getBoundingClientRect()
    const scrollTarget = window.scrollY + headingRect.top - 80
    
    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    })
  }
}

// 滚动监听 - 更新当前高亮的标题
const handleScroll = () => {
  if (!preview.value?.$el) return
  
  const headings = preview.value.$el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let currentHeading: Element | null = null
  const viewportCenter = window.innerHeight / 2
  
  for (const heading of headings) {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= viewportCenter && rect.bottom >= 0) {
      currentHeading = heading
    }
    if (rect.top > viewportCenter) break
  }
  
  if (currentHeading) {
    const lineIndex = currentHeading.getAttribute('data-v-md-line')
    const index = titles.value.findIndex((anchor) => anchor.lineIndex === lineIndex)
    if (index !== -1 && currentIndex.value !== index) {
      currentIndex.value = index
    }
  }
}

onMounted(() => {
  fetchArticleDetail()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => articleData.value.content, () => {
  if (articleData.value.content) {
    nextTick(() => fetchMarkdownTitles())
  }
})
</script>
```

---

## 第五步：自定义样式（可选）

### 文件位置：`src/styles/markdown-basic.css`

```css
/* ============================================================================
 * v-md-editor 基础主题样式覆盖
 * 确保代码块显示为简洁的基础样式
 * ============================================================================ */

/* 代码块容器 */
.article-preview .v-md-pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

/* 代码块 */
.article-preview .v-md-pre pre {
  margin: 0;
  padding: 0;
  background: transparent;
}

.article-preview .v-md-pre code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #24292e;
  background: transparent;
}

/* 行内代码 */
.article-preview code:not(pre code) {
  background: rgba(27, 31, 35, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  color: #d63384;
}

/* 确保无行号显示 */
.article-preview .v-md-editor-code__line-number,
.article-preview .line-number {
  display: none !important;
}

/* 确保无复制按钮 */
.article-preview .copy-btn,
.article-preview .v-md-editor-code__copy {
  display: none !important;
}
```

在组件中引入样式：
```vue
<script setup>
import '@/styles/markdown-basic.css'
</script>
```

---

## 效果对比

| 功能 | GitHub 主题 | 基础主题 |
|------|-------------|----------|
| 代码高亮 | ✅ | ✅ |
| 行号显示 | ✅ | ❌ |
| 复制按钮 | ✅ | ❌ |
| 代码折叠 | ✅ | ❌ |
| 样式复杂度 | 复杂 | 简洁 |
| 包体积 | 较大 | 较小 |

---

## 故障排查

### 1. 如果基础主题不可用
某些版本可能没有 `basic` 主题，可以使用 `elasticsearch` 主题或其他更简洁的主题：

```typescript
// 替代方案：使用 elasticsearch 主题
import elasticsearchTheme from '@kangc/v-md-editor/lib/theme/elasticsearch'

VMdPreview.use(elasticsearchTheme, {
  Hljs: hljs,
})
```

### 2. 如果 highlight.js 样式冲突
使用更基础的样式：

```typescript
// 使用基础高亮样式
import 'highlight.js/styles/default.css'
// 或
import 'highlight.js/styles/minimal.css'
```

### 3. 类型错误
创建类型声明文件 `src/types/vmd-editor.d.ts`：

```typescript
declare module '@kangc/v-md-editor/lib/preview'
declare module '@kangc/v-md-editor/lib/theme/basic'
declare module '@kangc/v-md-editor/lib/theme/elasticsearch'
```

---

## 总结

使用基础主题后，代码块将回退到简洁的 `<pre><code>` 渲染方式，无行号、无复制按钮，仅保留基本语法高亮，符合简洁化需求。
