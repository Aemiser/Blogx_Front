<template>
  <div class="code-block" :class="[`language-${language}`, { 'is-collapsed': isCollapsed }]">
    <!-- 代码块头部 -->
    <div class="code-block-header">
      <div class="header-left">
        <!-- 语言标识 -->
        <span class="language-badge" v-if="language">
          {{ languageLabel }}
        </span>
        <!-- 文件名（如果有） -->
        <span class="file-name" v-if="fileName">
          {{ fileName }}
        </span>
      </div>
      <div class="header-right">
        <!-- 折叠按钮 -->
        <button 
          class="header-btn collapse-btn" 
          @click="toggleCollapse"
          :title="isCollapsed ? '展开代码' : '折叠代码'"
        >
          <svg v-if="isCollapsed" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
          </svg>
        </button>
        <!-- 复制按钮 -->
        <button 
          class="header-btn copy-btn" 
          @click="copyCode"
          :title="copySuccess ? '已复制' : '复制代码'"
        >
          <svg v-if="!copySuccess" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span class="copy-text">{{ copySuccess ? '已复制' : '复制' }}</span>
        </button>
      </div>
    </div>
    
    <!-- 代码内容区域 -->
    <div class="code-block-body" v-show="!isCollapsed">
      <!-- 行号 + 代码 -->
      <div class="code-content">
        <div class="line-numbers" v-if="showLineNumbers">
          <span 
            v-for="(_, index) in lineCount" 
            :key="index" 
            class="line-number"
          >{{ index + 1 }}</span>
        </div>
        <pre class="code-pre"><code ref="codeRef" :class="`hljs language-${language}`" v-html="highlightedCode"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import hljs from 'highlight.js'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
    fileName?: string
    showLineNumbers?: boolean
    defaultCollapsed?: boolean
  }>(),
  {
    language: '',
    fileName: '',
    showLineNumbers: true,
    defaultCollapsed: false,
  }
)

// 响应式状态
const codeRef = ref<HTMLElement | null>(null)
const isCollapsed = ref(props.defaultCollapsed)
const copySuccess = ref(false)

// 语言标签映射
const languageLabels: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'Python',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  powershell: 'PS',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  markdown: 'MD',
  dockerfile: 'Docker',
  vue: 'Vue',
  jsx: 'JSX',
  tsx: 'TSX',
}

// 语言标签
const languageLabel = computed(() => {
  return languageLabels[props.language] || props.language.toUpperCase()
})

// 高亮后的代码
const highlightedCode = computed(() => {
  if (!props.code) return ''
  
  const code = props.code.trim()
  
  if (props.language && hljs.getLanguage(props.language)) {
    try {
      return hljs.highlight(code, { language: props.language }).value
    } catch (e) {
      console.warn('Highlight failed:', e)
    }
  }
  
  // 自动检测语言
  try {
    return hljs.highlightAuto(code).value
  } catch (e) {
    return escapeHtml(code)
  }
})

// 行数
const lineCount = computed(() => {
  if (!props.code) return 0
  return props.code.split('\n').length
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

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = props.code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}
</script>

<style scoped>
/* 代码块容器 - 背景透明化 */
.code-block {
  margin: 1.5em 0;
  border-radius: 12px;
  overflow: hidden;
  background: transparent !important;
  border: 1px solid #e1e4e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

/* 代码块头部 - 背景透明化 */
.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: transparent !important;
  border-bottom: 1px solid #e1e4e8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 语言标识 */
.language-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #1e66f5;
  background: rgba(30, 102, 245, 0.1);
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

/* 文件名 */
.file-name {
  font-size: 13px;
  color: #6c6f85;
  font-weight: 500;
}

/* 头部按钮 */
.header-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  color: #6c6f85;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #4c4f69;
  border-color: #d0d7de;
}

.header-btn:active {
  transform: scale(0.95);
}

.copy-btn.copied {
  background: rgba(166, 227, 161, 0.15);
  color: #a6e3a1;
  border-color: rgba(166, 227, 161, 0.3);
}

.copy-text {
  font-size: 12px;
}

/* 代码块主体 */
.code-block-body {
  overflow: hidden;
}

.code-content {
  display: flex;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d0d7de transparent;
}

.code-content::-webkit-scrollbar {
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: transparent;
}

.code-content::-webkit-scrollbar-thumb {
  background: #d0d7de;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: #afb8c1;
}

/* 行号 */
.line-numbers {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  background: transparent !important;
  border-right: 1px solid #e1e4e8;
  user-select: none;
  min-width: 50px;
  text-align: right;
}

.line-number {
  padding: 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #8b949e;
}

/* 代码 pre */
.code-pre {
  flex: 1;
  margin: 0;
  padding: 16px 20px;
  overflow-x: auto;
  background: transparent !important;
}

.code-pre code {
  background: transparent !important;
  font-size: 14px;
  line-height: 1.6;
  color: #24292e;
  display: block;
  white-space: pre;
}

/* 语法高亮颜色 - GitHub 风格（适合浅色背景） */
.code-block .hljs-comment,
.code-block .hljs-quote {
  color: #6a737d;
  font-style: italic;
}

.code-block .hljs-keyword,
.code-block .hljs-selector-tag {
  color: #d73a49;
}

.code-block .hljs-string,
.code-block .hljs-attr,
.code-block .hljs-template-variable {
  color: #032f62;
}

.code-block .hljs-number,
.code-block .hljs-literal,
.code-block .hljs-variable,
.code-block .hljs-deletion {
  color: #005cc5;
}

.code-block .hljs-title,
.code-block .hljs-section,
.code-block .hljs-function {
  color: #6f42c1;
}

.code-block .hljs-built_in,
.code-block .hljs-type,
.code-block .hljs-class .hljs-title {
  color: #e36209;
}

.code-block .hljs-attribute,
.code-block .hljs-symbol,
.code-block .hljs-bullet,
.code-block .hljs-addition {
  color: #005cc5;
}

.code-block .hljs-selector-class,
.code-block .hljs-selector-id {
  color: #22863a;
}

.code-block .hljs-link,
.code-block .hljs-regexp {
  color: #032f62;
}

.code-block .hljs-meta {
  color: #005cc5;
}

.code-block .hljs-params {
  color: #24292e;
}

/* 行内代码样式覆盖 */
.article-content :deep(code:not(.hljs)) {
  background: rgba(27, 31, 35, 0.06);
  color: #d73a49;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* 折叠状态 */
.code-block.is-collapsed .code-block-header {
  border-bottom: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .code-block-header {
    padding: 8px 12px;
  }
  
  .code-pre {
    padding: 12px;
  }
  
  .code-pre code {
    font-size: 13px;
  }
  
  .copy-text {
    display: none;
  }
  
  .line-numbers {
    min-width: 40px;
  }
  
  .line-number {
    padding: 0 8px;
    font-size: 12px;
  }
}

/* 浅色主题支持 - 背景透明 */
.light .code-block {
  background: transparent !important;
  border-color: #e1e4e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.light .code-block-header {
  background: transparent !important;
  border-bottom-color: #e1e4e8;
}

.light .language-badge {
  background: rgba(30, 102, 245, 0.1);
  color: #1e66f5;
}

.light .file-name {
  color: #6c6f85;
}

.light .header-btn {
  background: rgba(0, 0, 0, 0.03);
  border-color: #e1e4e8;
  color: #6c6f85;
}

.light .header-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #4c4f69;
}

.light .line-numbers {
  background: transparent !important;
  border-right-color: #e1e4e8;
}

.light .line-number {
  color: #8b949e;
}

.light .code-pre code {
  color: #24292e;
}

/* 浅色主题语法高亮 */
.light .code-block .hljs-comment,
.light .code-block .hljs-quote {
  color: #6a737d;
}

.light .code-block .hljs-keyword,
.light .code-block .hljs-selector-tag {
  color: #d73a49;
}

.light .code-block .hljs-string,
.light .code-block .hljs-attr,
.light .code-block .hljs-template-variable {
  color: #032f62;
}

.light .code-block .hljs-number,
.light .code-block .hljs-literal,
.light .code-block .hljs-variable,
.light .code-block .hljs-deletion {
  color: #005cc5;
}

.light .code-block .hljs-title,
.light .code-block .hljs-section,
.light .code-block .hljs-function {
  color: #6f42c1;
}

.light .code-block .hljs-built_in,
.light .code-block .hljs-type {
  color: #e36209;
}

.light .code-block .hljs-meta {
  color: #005cc5;
}
</style>
