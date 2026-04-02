<template>
  <div class="preview-page">
    <div class="preview-container">
      <div class="preview-header">
        <h1 class="preview-title">{{ title || '文章预览' }}</h1>
        <div class="preview-actions">
          <button class="action-btn" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            返回编辑
          </button>
          <button class="action-btn action-btn--primary" @click="toggleFullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            {{ isFullscreen ? '退出全屏' : '全屏预览' }}
          </button>
        </div>
      </div>
      
      <div class="preview-content" :class="{ 'is-fullscreen': isFullscreen }">
        <MdEditor
          v-model="previewContent"
          :theme="theme"
          preview-only
          :show-toolbar="false"
          class="preview-editor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

const title = ref('')
const previewContent = ref('')
const isFullscreen = ref(false)

const theme = computed(() => themeStore.isDark ? 'dark' : 'light')

function loadPreviewData() {
  const savedTitle = sessionStorage.getItem('preview_title')
  const savedContent = sessionStorage.getItem('preview_content')
  
  if (savedTitle) {
    title.value = savedTitle
  }
  
  if (savedContent) {
    previewContent.value = savedContent
  } else {
    // 如果没有预览数据，显示提示信息
    previewContent.value = '# 无预览内容\n\n请先在编辑器中编写内容后再预览。'
  }
}

function goBack() {
  router.back()
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

// 监听ESC键退出全屏
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  loadPreviewData()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // 清理sessionStorage数据
  sessionStorage.removeItem('preview_title')
  sessionStorage.removeItem('preview_content')
})
</script>

<style scoped lang="scss">
.preview-page {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fa);
  padding: $space-4;
}

.preview-container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-card, #ffffff);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.08));
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 $space-6;
  border-bottom: 1px solid var(--border-light, #ebeef5);
  background: var(--bg-secondary, #fafafa);
}

.preview-title {
  font-size: $text-xl;
  font-weight: $font-weight-semibold;
  color: var(--text-primary, #303133);
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: $space-3;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  height: 36px;
  padding: 0 $space-4;
  border-radius: $radius-md;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $duration-fast;
  border: 1px solid var(--border, #dcdfe6);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #303133);
  
  &:hover {
    border-color: var(--primary, #409eff);
    color: var(--primary, #409eff);
    background: var(--primary-light, #ecf5ff);
  }
  
  &--primary {
    background: var(--primary, #409eff);
    color: white;
    border-color: var(--primary, #409eff);
    
    &:hover {
      background: var(--primary-light, #66b1ff);
      border-color: var(--primary-light, #66b1ff);
      color: white;
    }
  }
}

.preview-content {
  padding: $space-6;
  min-height: calc(100vh - 200px);
  transition: all $duration-normal;
  
  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: var(--bg-primary, #f5f7fa);
    padding: $space-4;
    border-radius: 0;
  }
}

.preview-editor {
  height: 100%;
  min-height: 600px;
}

// 深色模式
[data-theme="dark"] {
  .preview-page {
    background: var(--dark-bg-primary, #1a1a1a);
  }
  
  .preview-container {
    background: var(--dark-bg-card, #242424);
    border: 1px solid var(--dark-border, #333333);
  }
  
  .preview-header {
    background: var(--dark-bg-secondary, #1f1f1f);
    border-color: var(--dark-border, #333333);
  }
  
  .preview-title {
    color: var(--dark-text-primary, #e5eaf3);
  }
  
  .action-btn {
    background: var(--dark-bg-card, #242424);
    border-color: var(--dark-border, #333333);
    color: var(--dark-text-primary, #e5eaf3);
    
    &:hover {
      border-color: var(--primary, #409eff);
      color: var(--primary, #409eff);
      background: var(--primary-dark, #337ecc);
    }
  }
  
  .preview-content.is-fullscreen {
    background: var(--dark-bg-primary, #1a1a1a);
  }
}

// 响应式
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: $space-3;
    align-items: flex-start;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .preview-content {
    padding: $space-4;
  }
}

@media (max-width: 480px) {
  .preview-page {
    padding: $space-2;
  }
  
  .preview-actions {
    flex-direction: column;
    
    .action-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>