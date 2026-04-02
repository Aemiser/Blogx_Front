// src/plugins/v-md-preview-basic.ts
// 使用 v-md-editor 基础主题 - 简化代码块渲染

import { App } from 'vue'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'

// 引入基础主题（无额外功能，更简洁的代码块渲染）
import basicTheme from '@kangc/v-md-editor/lib/theme/basic'
import '@kangc/v-md-editor/lib/theme/style/basic.css'

// 引入 highlight.js 用于代码高亮
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'  // 基础高亮样式

// 配置基础主题
VMdPreview.use(basicTheme, {
  Hljs: hljs,
  // 基础主题配置
  code: {
    // 可选：是否显示行号（基础主题默认不显示）
    lineNumber: false,
  },
})

/**
 * 注册 v-md-preview 基础主题插件
 * @param app Vue 应用实例
 */
export function setupVMdPreviewBasic(app: App) {
  app.use(VMdPreview)
}

export default VMdPreview
