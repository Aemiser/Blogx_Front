// ============================================================================
// vue-markdown 插件配置
// ============================================================================

import type { App } from 'vue'
import VueMarkdown from 'vue-markdown'

/**
 * 注册 vue-markdown 插件
 */
export function installVueMarkdown(app: App) {
  app.component('VueMarkdown', VueMarkdown)
}

export default VueMarkdown
