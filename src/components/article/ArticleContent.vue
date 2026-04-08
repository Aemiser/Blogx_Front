<template>
  <div class="article-content-wrapper">
    <div 
      ref="contentRef" 
      class="article-markdown-body"
      v-html="renderedContent"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, h, createApp } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import CodeBlock from './CodeBlock.vue'
import { getFullImageUrl } from '@/utils/image'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  (e: 'rendered', element: HTMLElement): void
}>()

const contentRef = ref<HTMLElement | null>(null)

// 生成锚点 ID（GitHub 标准，与 TableOfContents.vue 保持一致）
function generateSlug(text: string): string {
  let slug = text
    .replace(/<[^>]+>/g, '') // 移除 HTML 标签
    .replace(/[\s\u3000]+/g, '-') // 各类空格 → -
    .replace(/[(){}[\],.!?;:'"\\/`~@#$%^&*+=|<>]/g, '') // 移除标点
    .replace(/-+/g, '-') // 多个 - 合并
    .replace(/^-|-$/g, '') // 移除首尾 -
  
  return slug || 'heading'
}

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 生成完整图片 URL 的辅助函数
const processImageUrl = (src: string): string => {
  return getFullImageUrl(src)
}

// 渲染 Markdown 为 HTML
const renderedContent = computed(() => {
  if (!props.content) return ''
  
  // 自定义渲染器
  const renderer = new marked.Renderer()
  
  // 自定义图片渲染 - 转换相对路径为完整 URL
  renderer.image = function(href: any, title: any, text: any) {
    const hrefStr = typeof href === 'object' ? href.href : href
    const titleStr = typeof title === 'object' ? title.title : title
    const textStr = typeof text === 'object' ? text.text : text
    
    const fullUrl = processImageUrl(hrefStr)
    const titleAttr = titleStr ? ` title="${titleStr}"` : ''
    return `<img src="${fullUrl}" alt="${textStr}"${titleAttr} loading="lazy" />`
  }
  
  // 自定义代码块渲染 - 我们将在挂载后替换为 Vue 组件
  renderer.code = function(code: any, language: any) {
    const codeText = typeof code === 'object' ? code.text : code
    const lang = typeof code === 'object' ? code.lang : language
    
    // 返回占位符，后续替换为 Vue 组件
    return `<div class="code-block-placeholder" data-language="${lang || ''}">${escapeHtml(codeText)}</div>`
  }
  
  // 自定义标题渲染 - 使用统一的 generateSlug
  renderer.heading = function(text: any, level: any) {
    const textStr = typeof text === 'object' ? text.text : text
    const levelNum = typeof text === 'object' ? text.depth : level
    const id = generateSlug(textStr)
    return `<h${levelNum} id="${id}">${textStr}</h${levelNum}>`
  }
  
  return marked(props.content, { renderer })
})

// HTML 转义
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// 挂载后替换代码块占位符为 Vue 组件
const mountCodeBlocks = async () => {
  await nextTick()
  
  if (!contentRef.value) return
  
  const placeholders = contentRef.value.querySelectorAll('.code-block-placeholder')
  
  placeholders.forEach((placeholder) => {
    const language = placeholder.getAttribute('data-language') || ''
    const codeText = placeholder.textContent || ''
    
    // 创建 Vue 应用实例
    const app = createApp({
      render() {
        return h(CodeBlock, {
          code: codeText,
          language: language,
          showLineNumbers: true,
        })
      }
    })
    
    // 挂载组件
    const wrapper = document.createElement('div')
    placeholder.replaceWith(wrapper)
    app.mount(wrapper)
  })
  
  // 触发渲染完成事件
  emit('rendered', contentRef.value)
}

// 代码块语法高亮（备用方案）
const highlightCodeBlocks = () => {
  if (!contentRef.value) return
  
  const codeBlocks = contentRef.value.querySelectorAll('pre code:not(.highlighted)')
  codeBlocks.forEach((block) => {
    hljs.highlightElement(block as HTMLElement)
    block.classList.add('highlighted')
  })
}

// 监听内容变化
watch(
  () => props.content,
  () => {
    nextTick(() => {
      mountCodeBlocks()
    })
  }
)

onMounted(() => {
  mountCodeBlocks()
})
</script>

<style>
/* 引入 highlight.js 主题 */
@import 'highlight.js/styles/catppuccin-mocha.css';

/* 全局代码块样式重置 */
.article-content-wrapper {
  width: 100%;
}

/* Markdown 内容基础样式 */
.article-markdown-body {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-color, #e0e0e0);
}

/* 标题样式 */
.article-markdown-body h1,
.article-markdown-body h2,
.article-markdown-body h3,
.article-markdown-body h4,
.article-markdown-body h5,
.article-markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
  line-height: 1.3;
  color: var(--heading-color, #f0f0f0);
  scroll-margin-top: 100px;
}

.article-markdown-body h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.article-markdown-body h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.article-markdown-body h3 {
  font-size: 1.25em;
}

.article-markdown-body h4 {
  font-size: 1em;
}

.article-markdown-body h5 {
  font-size: 0.875em;
}

.article-markdown-body h6 {
  font-size: 0.85em;
  color: var(--text-secondary, #888);
}

/* 段落样式 */
.article-markdown-body p {
  margin: 1em 0;
}

/* 行内代码 */
.article-markdown-body :not(pre) > code {
  background: rgba(255, 255, 255, 0.06);
  color: #f38ba8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* 引用块样式 */
.article-markdown-body blockquote {
  margin: 1.5em 0;
  padding: 0.5em 1em;
  border-left: 4px solid #89b4fa;
  background: rgba(137, 180, 250, 0.05);
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary, #a6adc8);
}

.article-markdown-body blockquote p {
  margin: 0.5em 0;
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

.article-markdown-body li > p {
  margin: 0.5em 0;
}

/* 任务列表 */
.article-markdown-body input[type="checkbox"] {
  margin-right: 0.5em;
}

/* 分割线样式 */
.article-markdown-body hr {
  margin: 2em 0;
  border: none;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

/* 表格样式 */
.article-markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  overflow-x: auto;
  display: block;
}

.article-markdown-body th,
.article-markdown-body td {
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  padding: 12px 16px;
  text-align: left;
}

.article-markdown-body th {
  background: rgba(255, 255, 255, 0.03);
  font-weight: 600;
}

.article-markdown-body tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

/* 图片样式 */
.article-markdown-body img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}

/* iframe 视频嵌入 */
.article-markdown-body iframe {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}

/* 链接样式 */
.article-markdown-body a {
  color: #89b4fa;
  text-decoration: none;
  transition: color 0.2s;
}

.article-markdown-body a:hover {
  color: #b4befe;
  text-decoration: underline;
}

/* 强调样式 */
.article-markdown-body strong {
  font-weight: 600;
  color: var(--heading-color, #f0f0f0);
}

.article-markdown-body em {
  font-style: italic;
}

/* 删除线样式 */
.article-markdown-body del {
  color: var(--text-secondary, #6c6f85);
}

/* 代码块占位符（加载中状态） */
.code-block-placeholder {
  background: #1e1e2e;
  border-radius: 8px;
  padding: 16px;
  margin: 1em 0;
  font-family: monospace;
  white-space: pre-wrap;
  color: #cdd6f4;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .article-markdown-body {
    font-size: 15px;
  }
  
  .article-markdown-body h1 {
    font-size: 1.5em;
  }
  
  .article-markdown-body h2 {
    font-size: 1.25em;
  }
  
  .article-markdown-body h3 {
    font-size: 1.1em;
  }
  
  .article-markdown-body table {
    display: block;
    overflow-x: auto;
  }
  
  .article-markdown-body th,
  .article-markdown-body td {
    padding: 8px 12px;
    font-size: 14px;
  }
}

/* 浅色主题 */
.light .article-markdown-body {
  color: #4c4f69;
}

.light .article-markdown-body h1,
.light .article-markdown-body h2,
.light .article-markdown-body h3,
.light .article-markdown-body h4,
.light .article-markdown-body h5,
.light .article-markdown-body h6 {
  color: #1e1e2e;
}

.light .article-markdown-body h1,
.light .article-markdown-body h2 {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

.light .article-markdown-body blockquote {
  background: rgba(30, 102, 245, 0.05);
  border-left-color: #1e66f5;
  color: #6c6f85;
}

.light .article-markdown-body th,
.light .article-markdown-body td {
  border-color: rgba(0, 0, 0, 0.1);
}

.light .article-markdown-body th {
  background: rgba(0, 0, 0, 0.02);
}

.light .article-markdown-body tr:nth-child(even) {
  background: rgba(0, 0, 0, 0.01);
}

.light .article-markdown-body a {
  color: #1e66f5;
}

.light .article-markdown-body a:hover {
  color: #7287fd;
}

.light .article-markdown-body :not(pre) > code {
  background: rgba(0, 0, 0, 0.06);
  color: #d20f39;
}

.light .code-block-placeholder {
  background: #eff1f5;
  color: #4c4f69;
}

/* 深色主题 */
[data-theme="dark"] .article-markdown-body {
  color: #cdd6f4;
}

[data-theme="dark"] .article-markdown-body h1,
[data-theme="dark"] .article-markdown-body h2,
[data-theme="dark"] .article-markdown-body h3,
[data-theme="dark"] .article-markdown-body h4,
[data-theme="dark"] .article-markdown-body h5,
[data-theme="dark"] .article-markdown-body h6 {
  color: #f5e0dc;
}

[data-theme="dark"] .article-markdown-body h1,
[data-theme="dark"] .article-markdown-body h2 {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .article-markdown-body blockquote {
  background: rgba(137, 180, 250, 0.1);
  border-left-color: #89b4fa;
  color: #a6adc8;
}

[data-theme="dark"] .article-markdown-body th,
[data-theme="dark"] .article-markdown-body td {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .article-markdown-body th {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .article-markdown-body tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

[data-theme="dark"] .article-markdown-body a {
  color: #89b4fa;
}

[data-theme="dark"] .article-markdown-body a:hover {
  color: #b4befe;
}

[data-theme="dark"] .article-markdown-body :not(pre) > code {
  background: rgba(255, 255, 255, 0.1);
  color: #f38ba8;
}

[data-theme="dark"] .article-markdown-body hr {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .article-markdown-body table {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .code-block-placeholder {
  background: #1e1e2e;
  color: #cdd6f4;
}
</style>
