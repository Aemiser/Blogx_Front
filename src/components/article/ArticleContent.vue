<template>
  <div class="article-content-wrapper">
    <MdPreview 
      :editorId="editorId" 
      :modelValue="content"
      :theme="theme"
      previewTheme="default"
      :codeTheme="codeTheme"
      :showCodeRowNumber="false"
      class="article-markdown-body"
      @onHtmlChanged="onHtmlChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'rendered', html: string): void
}>()

const editorId = 'article-preview-' + Math.random().toString(36).slice(2)

const theme = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
})

const codeTheme = 'atom'

const onHtmlChanged = (html: string) => {
  nextTick(() => {
    emit('rendered', html)
  })
}

watch(() => props.content, () => {
  nextTick(() => {
    const container = document.querySelector('.article-markdown-body') as HTMLElement
    if (container) {
      emit('rendered', container.innerHTML)
    }
  })
})

onMounted(() => {
  nextTick(() => {
    const container = document.querySelector('.article-markdown-body') as HTMLElement
    if (container) {
      emit('rendered', container.innerHTML)
    }
  })
})
</script>

<style scoped>
.article-content-wrapper {
  width: 100%;
}

:deep(.md-editor-preview) {
  padding: 0;
  background: transparent;
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

:deep(.md-editor-preview-wrapper) {
  padding: 0;
}

:deep(.md-editor-preview h1),
:deep(.md-editor-preview h2),
:deep(.md-editor-preview h3),
:deep(.md-editor-preview h4),
:deep(.md-editor-preview h5),
:deep(.md-editor-preview h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

:deep(.md-editor-preview h1) { font-size: 1.8em; }
:deep(.md-editor-preview h2) { font-size: 1.5em; }
:deep(.md-editor-preview h3) { font-size: 1.3em; }
:deep(.md-editor-preview h4) { font-size: 1.1em; }

:deep(.md-editor-preview p) {
  margin: 1em 0;
}

:deep(.md-editor-preview pre) {
  margin: 1em 0;
  padding: 16px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border);
  overflow-x: auto;
}

:deep(.md-editor-preview code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

:deep(.md-editor-preview code:not(pre code)) {
  background: rgba(27, 31, 35, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent);
}

:deep(.md-editor-preview pre code) {
  background: transparent;
  font-size: 14px;
}

:deep(.md-editor-preview blockquote) {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

:deep(.md-editor-preview img) {
  max-width: 100%;
  border-radius: 8px;
}

:deep(.md-editor-preview table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

:deep(.md-editor-preview th),
:deep(.md-editor-preview td) {
  border: 1px solid var(--border);
  padding: 0.5em 1em;
  text-align: left;
}

:deep(.md-editor-preview th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

:deep(.md-editor-preview ul),
:deep(.md-editor-preview ol) {
  margin: 1em 0;
  padding-left: 2em;
}

:deep(.md-editor-preview li) {
  margin: 0.5em 0;
}
</style>