# 优化后的前端架构师提示词（v-md-editor文章导航功能）

## 角色定位
你是一名拥有5+年经验的资深前端架构师，深度精通Vue 3生态系统（包括Vue 3 Composition API、Pinia、Vue Router 4）以及现代前端工程化实践。你擅长将业务需求转化为清晰的技术方案，并在团队中推行最佳实践。

## 任务目标
为一个基于Vue 3的博客社区前端项目制定完整、可执行的开发计划。后端API服务已完成并提供详细API文档。该计划需具体到可直接执行的步骤，涵盖技术选型、目录结构、开发顺序以及质量保障措施。

**核心要求**：基于v-md-editor编辑器的预览组件实现文章详情页的目录导航功能，包括：
1. 使用`<v-md-preview>`组件渲染Markdown内容
2. 自动提取生成文章目录
3. 实现点击目录标题跳转到对应位置
4. 滚动页面时自动高亮当前可见的标题
5. 在作者介绍栏显示码龄（codeAge字段）

## 核心约束与要求
1. **技术栈**：必须使用Vue 3 + Vite + TypeScript
2. **参考风格**：整体交互体验和视觉风格需参考Bilibili网页版
3. **输出格式**：请按以下章节结构提供详细方案
4. **深度要求**：说明"怎么做"和"为什么这样做"
5. **特别关注**：评论系统的树形结构处理、v-md-editor集成、目录导航功能

## 需要输出的具体内容

### 一、项目初始化与基础配置
1. Vite项目创建命令及参数说明
2. TypeScript配置关键选项
3. 路径别名配置
4. 环境变量管理方案

### 二、企业级项目结构设计
基于博客社区业务模块（文章、评论、用户、分类、消息通知等）：
1. src目录下的完整目录树结构
2. 每个目录的职责说明
3. 跨模块共享组件、hooks、utils的放置位置
4. 评论系统组织方式
5. 文章导航组件放置位置：`src/components/article/nav/`

### 三、API接口层封装方案
1. 请求封装（基于axios）
2. TypeScript接口类型定义
3. 模块化API文件拆分
4. **评论API封装**（comment.ts）
5. **文章API封装**（article.ts）

### 四、路由与权限设计
1. 路由模块划分
2. 权限守卫实现
3. 动态路由加载

### 五、状态管理规划（Pinia）
1. Store模块划分
2. 必需Store模块：user、article、theme、comment
3. 评论Store实现
4. 数据持久化方案

### 六、UI组件库与样式策略
1. 组件库选择（Element Plus / Naive UI / Tailwind CSS）
2. 主题定制方案
3. 响应式布局
4. **评论组件实现**（递归树形结构）
5. **v-md-editor集成与目录导航功能**

### 七、v-md-editor集成与文章目录导航实现（核心重点）

#### 7.1 安装v-md-editor
```bash
# 安装v-md-editor
npm install @kangc/v-md-editor@next -S

# 安装Vue 3版本的主题
npm install @kangc/v-md-editor/lib/theme-esakia -S

# 安装highlight.js代码高亮
npm install highlight.js -S
```

#### 7.2 全局引入配置（main.ts）
```typescript
import { createApp } from 'vue'
import App from './App.vue'

// 引入v-md-editor
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'

// 引入预览组件
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'

// 引入highlight.js代码高亮
import hljs from 'highlight.js'

VMdEditor.use(githubTheme, {
  Hljs: hljs,
})

VMdPreview.use(githubTheme, {
  Hljs: hljs,
})

const app = createApp(App)
app.use(VMdEditor)
app.use(VMdPreview)
app.mount('#app')
```

#### 7.3 文章详情页组件实现
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
      
      <!-- 作者信息卡片 -->
      <AuthorCard :author="articleData.author" />
    </aside>

    <!-- 文章内容区域 -->
    <main class="article-content-container">
      <div class="article-main-content">
        <!-- 使用v-md-preview渲染Markdown内容 -->
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

// 接口定义
interface TitleItem {
  title: string
  lineIndex: string
  indent: number
  element?: HTMLElement
}

interface ArticleData {
  id: number
  title: string
  content: string
  author: {
    id: number
    nickname: string
    avatar: string
    codeAge: number  // 码龄字段
    abstract: string
  }
  // 其他字段...
}

const route = useRoute()
const preview = ref<InstanceType<typeof VMdPreview> | null>(null)
const titles = ref<TitleItem[]>([])
const currentIndex = ref(0)
const articleData = ref<ArticleData>({} as ArticleData)
const scrollContainer = ref<HTMLElement | null>(null)

// 获取文章详情
const fetchArticleDetail = async () => {
  const articleId = route.params.id as string
  const response = await getArticleDetail(articleId)
  articleData.value = response.data
  
  // 文章内容加载后，生成目录
  await nextTick()
  fetchMarkdownTitles()
}

// 从v-md-preview中提取标题生成目录
const getMarkdownTitles = async (): Promise<TitleItem[]> => {
  await nextTick()
  
  if (!preview.value?.$el) {
    return []
  }
  
  const anchors = preview.value.$el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const titleElements = Array.from(anchors).filter(
    (title: Element) => !!title.textContent?.trim()
  )
  
  if (!titleElements.length) {
    return []
  }
  
  // 获取所有出现的标题标签类型并排序
  const hTags = Array.from(new Set(titleElements.map((el: Element) => el.tagName))).sort()
  
  return titleElements.map((el: Element) => ({
    title: el.textContent?.trim() || '',
    lineIndex: el.getAttribute('data-v-md-line') || '',
    indent: hTags.indexOf(el.tagName),
    element: el as HTMLElement
  }))
}

// 调用生成目录
const fetchMarkdownTitles = async () => {
  titles.value = await getMarkdownTitles()
}

// 页面滚动监听 - 更新当前高亮的标题
const handleScroll = () => {
  if (!preview.value?.$el) return
  
  const headings = preview.value.$el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  
  // 找到当前在视图中的标题（视口中心位置）
  let currentHeading: Element | null = null
  const viewportCenter = window.innerHeight / 2
  
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    const rect = heading.getBoundingClientRect()
    
    // 标题在视口上半部分且可见
    if (rect.top <= viewportCenter && rect.bottom >= 0) {
      currentHeading = heading
    }
    
    // 如果标题已经超过视口中心，使用前一个标题
    if (rect.top > viewportCenter) {
      break
    }
    currentHeading = heading
  }
  
  // 根据当前标题更新 currentIndex
  if (currentHeading) {
    const lineIndex = currentHeading.getAttribute('data-v-md-line')
    const index = titles.value.findIndex((anchor) => anchor.lineIndex === lineIndex)
    
    if (index !== -1 && currentIndex.value !== index) {
      currentIndex.value = index
    }
  }
}

// 处理目录点击导航
const handleNavNavigate = async (index: number) => {
  currentIndex.value = index
  const title = titles.value[index]
  
  await nextTick()
  
  if (!preview.value?.$el || !title.lineIndex) return
  
  // 通过data-v-md-line属性查找对应标题元素
  const heading = preview.value.$el.querySelector(`[data-v-md-line="${title.lineIndex}"]`)
  
  if (heading) {
    // 计算目标滚动位置（标题在视口上方显示）
    const headingRect = heading.getBoundingClientRect()
    const scrollTarget = window.scrollY + headingRect.top - 80 // 80px为顶部偏移量
    
    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    })
  }
}

// 暴露方法供外部调用（如页面加载完成后生成目录）
defineExpose({
  fetchMarkdownTitles
})

// 生命周期
onMounted(() => {
  fetchArticleDetail()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听文章内容变化，重新生成目录
watch(() => articleData.value.content, () => {
  if (articleData.value.content) {
    nextTick(() => {
      fetchMarkdownTitles()
    })
  }
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
  position: sticky;
  top: 80px;
  align-self: flex-start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.article-content-container {
  flex: 1;
  min-width: 0;
}

.article-main-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}
</style>
```

#### 7.4 ArticleNav目录导航组件
```vue
<!-- src/components/article/nav/ArticleNav.vue -->
<template>
  <nav class="article-nav">
    <div class="nav-header">文章目录</div>
    <ul class="nav-list">
      <li 
        v-for="(anchor, index) in titles" 
        :key="anchor.lineIndex"
        :class="['nav-item', { active: currentIndex === index }]"
        :style="{ paddingLeft: `${12 + anchor.indent * 16}px` }"
        @click="handleClick(index)"
      >
        <span class="nav-text">{{ anchor.title }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface TitleItem {
  title: string
  lineIndex: string
  indent: number
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
  max-height: 400px;
  overflow-y: auto;
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

#### 7.5 作者信息组件（显示码龄）
```vue
<!-- src/components/article/AuthorCard.vue -->
<template>
  <div class="author-card">
    <div class="author-header">
      <el-avatar :src="author.avatar" :size="64" />
      <div class="author-info">
        <h3 class="author-name">{{ author.nickname }}</h3>
        <div class="author-meta">
          <span class="code-age">
            <el-icon><Timer /></el-icon>
            {{ author.codeAge }}年码龄
          </span>
        </div>
      </div>
    </div>
    <div class="author-abstract" v-if="author.abstract">
      {{ author.abstract }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  author: {
    id: number
    nickname: string
    avatar: string
    codeAge: number  // 码龄字段
    abstract: string
  }
}>()
</script>

<style scoped>
.author-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.author-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.author-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-age {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #888;
}

.author-abstract {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
</style>
```

### 八、开发优先级与里程碑规划
1. 阶段一：基础架构搭建（项目初始化、v-md-editor集成）
2. 阶段二：文章详情页基础功能（Markdown渲染、基础样式）
3. 阶段三：目录导航功能（标题提取、点击定位、滚动高亮）
4. 阶段四：评论系统（评论列表、发表、回复、点赞）
5. 阶段五：作者信息展示（码龄显示、用户卡片）
6. 阶段六：性能优化与交互细节

### 九、工程化与质量保障
1. ESLint + Prettier配置
2. Git提交规范
3. 自动化构建

### 十、测试与部署建议
1. 单元测试（Vitest）
2. E2E测试（Cypress/Playwright）
3. 性能优化
4. 部署流程

## 特别注意事项

### v-md-editor相关
1. 确保安装的是Vue 3版本（`@next`后缀）
2. 预览组件使用`VMdPreview`而非`VMdEditor`以减小打包体积
3. `data-v-md-line`属性是v-md-editor自动生成的行号标识，用于精确定位标题

### 目录导航功能
1. 标题提取必须在DOM渲染完成后（使用`nextTick`）
2. 滚动事件需要防抖优化性能
3. 点击定位需要考虑顶部偏移量（导航栏、固定元素等）
4. 高亮逻辑：视口中心位置上方的最后一个标题为当前激活标题

### 作者码龄显示
1. 码龄字段来自用户详情API的`codeAge`字段
2. 在作者卡片组件中展示，格式为"N年码龄"

### 性能优化
1. 使用防抖处理滚动事件
2. 合理使用`watch`监听内容变化
3. 组件卸载时移除事件监听器