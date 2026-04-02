// ============================================================================
// v-md-editor 基础主题配置 - 简化代码块渲染
// ============================================================================

// 安装依赖（执行以下命令）
// npm install @kangc/v-md-editor@next highlight.js -S

// ============================================================================
// 方式一：全局配置（推荐）- src/plugins/v-md-preview-basic.ts
// ============================================================================

import type { App } from 'vue'

// 动态导入以避免 SSR 问题
let VMdPreview: any = null
let basicTheme: any = null

/**
 * 初始化 v-md-editor 基础主题
 * 基础主题特点：
 * 1. 无行号显示
 * 2. 无复制按钮
 * 3. 简洁的 pre/code 渲染
 * 4. 仅保留基本语法高亮
 */
export async function setupVMdPreview(app: App) {
  // 动态导入 v-md-editor 预览组件
  const previewModule = await import('@kangc/v-md-editor/lib/preview')
  VMdPreview = previewModule.default || previewModule
  
  // 导入基础主题
  const themeModule = await import('@kangc/v-md-editor/lib/theme/basic')
  basicTheme = themeModule.default || themeModule
  
  // 导入样式
  await import('@kangc/v-md-editor/lib/style/preview.css')
  await import('@kangc/v-md-editor/lib/theme/style/basic.css')
  
  // 导入 highlight.js 及其样式
  const hljs = await import('highlight.js')
  await import('highlight.js/styles/github.css')
  
  // 配置基础主题
  VMdPreview.use(basicTheme, {
    Hljs: hljs.default || hljs,
  })
  
  // 注册到 Vue 应用
  app.use(VMdPreview)
  
  console.log('[v-md-editor] 基础主题已加载')
}

// ============================================================================
// 方式二：同步配置（如果不需要动态导入）
// ============================================================================

// src/plugins/vmd-basic-sync.ts
/*
import { createApp } from 'vue'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import basicTheme from '@kangc/v-md-editor/lib/theme/basic'
import '@kangc/v-md-editor/lib/theme/style/basic.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置
VMdPreview.use(basicTheme, {
  Hljs: hljs,
})

export function installVmdBasic(app: ReturnType<typeof createApp>) {
  app.use(VMdPreview)
}
*/

// ============================================================================
// 方式三：Vite 配置别名（如果主题路径有问题）
// ============================================================================

// vite.config.ts 中添加别名
/*
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // v-md-editor 别名（如果需要）
      '@kangc/v-md-editor': resolve(__dirname, 'node_modules/@kangc/v-md-editor'),
    },
  },
  optimizeDeps: {
    include: [
      '@kangc/v-md-editor/lib/preview',
      '@kangc/v-md-editor/lib/theme/basic',
      'highlight.js',
    ],
  },
})
*/
