<template>
  <div class="editor-page">
    <div class="app-container">
      <!-- 标题输入 -->
      <div class="editor-header">
        <input
          v-model="title"
          class="title-input"
          type="text"
          placeholder="请输入文章标题"
        />
      </div>
      
      <!-- Markdown 编辑器 -->
      <div class="editor-content">
        <MdEditor
          v-model="content"
          :theme="theme"
          :toolbars="toolbars"
          placeholder="开始编写文章内容..."
          :on-upload-img="handleUploadImg"
          @on-save="handleSave"
          style="height: 500px;"
        />
      </div>
      
      <!-- 发布设置 -->
      <div class="publish-settings">
        <h3 class="settings-title">发布设置</h3>
        
        <div class="settings-grid">
          <div class="form-group">
            <label class="form-label">分类</label>
            <select v-model="categoryId" class="select">
              <option :value="undefined">请选择分类</option>
              <option
                v-for="cat in categories"
                :key="cat.value"
                :value="cat.value"
              >
                {{ cat.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              标签
              <button 
                class="ai-btn" 
                :disabled="analyzing || !content.trim()"
                @click="handleAiAnalysis"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                  <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                  <circle cx="9" cy="10" r="1"/>
                  <circle cx="15" cy="10" r="1"/>
                </svg>
                {{ analyzing ? '识别中...' : '智能识别' }}
              </button>
            </label>
            <input
              v-model="tagsInput"
              class="input"
              type="text"
              placeholder="例如：Vue,前端,JavaScript"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">文章摘要</label>
          <textarea
            v-model="abstract"
            class="textarea"
            placeholder="请输入文章摘要（可选，不填则自动截取正文前100字）"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group form-group--checkbox">
          <label class="checkbox-label">
            <input type="checkbox" v-model="openComment" />
            <span>开启评论</span>
          </label>
        </div>
      </div>
      
      <!-- 底部操作栏 -->
      <div class="editor-footer">
        <div class="footer-left">
          <button class="footer-btn footer-btn--ghost" @click="saveDraft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>存为草稿</span>
          </button>
          <span class="footer-hint">Ctrl + S 快捷保存</span>
        </div>
        <div class="footer-right">
          <button class="footer-btn footer-btn--secondary" @click="previewArticle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>预览</span>
          </button>
          <button 
            class="footer-btn footer-btn--primary" 
            :disabled="publishing"
            @click="publishArticle"
          >
            <svg v-if="!publishing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <span v-if="publishing" class="btn-loading"></span>
            <span>{{ publishing ? '发布中...' : '发布文章' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { CategoryOption } from '@/types'
import { getCategoryOptions, createArticle } from '@/api/modules/article'
import { uploadImage } from '@/api/modules/banner'
import { aiAnalysis } from '@/api/modules/search'
import { useThemeStore } from '@/stores/theme'
import BButton from '@/components/base/BButton/index.vue'

const router = useRouter()
const themeStore = useThemeStore()

const title = ref('')
const content = ref('')
const categoryId = ref<number | undefined>(undefined)
const tagsInput = ref('')
const abstract = ref('')
const openComment = ref(true)
const categories = ref<CategoryOption[]>([])
const publishing = ref(false)
const analyzing = ref(false)

// 编辑器主题跟随系统
const theme = computed(() => themeStore.isDark ? 'dark' : 'light')

// 自定义工具栏
const toolbars = [
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  '-',
  'revoke',
  'next',
  '=',
  'preview',
  'fullscreen'
]

async function fetchCategories() {
  try {
    const res = await getCategoryOptions()
    categories.value = res.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// AI 智能识别
async function handleAiAnalysis() {
  if (!content.value.trim()) {
    alert('请先输入文章内容')
    return
  }
  
  analyzing.value = true
  try {
    const res = await aiAnalysis(content.value)
    const data = res.data
    
    // 填充标题（如果用户未输入）
    if (!title.value.trim() && data.title) {
      title.value = data.title
    }
    
    // 填充摘要
    if (data.abstract) {
      abstract.value = data.abstract
    }
    
    // 填充标签
    if (data.tag && data.tag.length > 0) {
      tagsInput.value = data.tag.join(',')
    }
    
    // 尝试匹配分类
    if (data.category) {
      const matchedCategory = categories.value.find(
        cat => cat.label.includes(data.category) || data.category.includes(cat.label)
      )
      if (matchedCategory) {
        categoryId.value = matchedCategory.value
      }
    }
  } catch (error: any) {
    console.error('AI analysis failed:', error)
    alert(error.message || '智能识别失败，请稍后重试')
  } finally {
    analyzing.value = false
  }
}

// 预览文章
function previewArticle() {
  if (!content.value.trim()) {
    alert('请先输入文章内容')
    return
  }
  // 将内容保存到 sessionStorage 并打开新窗口预览
  sessionStorage.setItem('preview_content', content.value)
  sessionStorage.setItem('preview_title', title.value || '无标题')
  window.open('/preview', '_blank')
}

// 图片上传处理
async function handleUploadImg(files: File[], callback: (urls: string[]) => void) {
  const urls: string[] = []
  
  for (const file of files) {
    try {
      const res = await uploadImage(file)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
      urls.push(`${baseUrl}${res.data}`)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }
  
  callback(urls)
}

// Ctrl+S 保存
function handleSave() {
  saveDraft()
}

async function saveDraft() {
  if (!title.value.trim()) {
    alert('请先输入文章标题')
    return
  }
  localStorage.setItem('article_draft', JSON.stringify({
    title: title.value,
    content: content.value,
    categoryId: categoryId.value,
    tagsInput: tagsInput.value,
    abstract: abstract.value,
    openComment: openComment.value
  }))
  alert('草稿已保存')
}

async function publishArticle() {
  if (!title.value.trim()) {
    alert('请输入文章标题')
    return
  }
  
  if (!content.value.trim()) {
    alert('请输入文章内容')
    return
  }
  
  publishing.value = true
  try {
    const tagList = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    
    await createArticle({
      title: title.value,
      content: content.value,
      tagList,
      status: 2,
      categoryID: categoryId.value,
      abstract: abstract.value,
      openComment: openComment.value
    })
    
    localStorage.removeItem('article_draft')
    alert('发布成功')
    router.push('/')
  } catch (error: any) {
    console.error('Publish failed:', error)
    alert(error.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

function loadDraft() {
  const draft = localStorage.getItem('article_draft')
  if (draft) {
    try {
      const data = JSON.parse(draft)
      title.value = data.title || ''
      content.value = data.content || ''
      categoryId.value = data.categoryId
      tagsInput.value = data.tagsInput || ''
      abstract.value = data.abstract || ''
      openComment.value = data.openComment ?? true
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

onMounted(() => {
  fetchCategories()
  loadDraft()
})
</script>

<style scoped lang="scss">
.editor-page {
  padding: $space-6 0;
}

.editor-header {
  margin-bottom: $space-4;
}

.title-input {
  width: 100%;
  height: 56px;
  padding: 0 $space-4;
  border: 1px solid $border;
  border-radius: $radius-lg;
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  background: $bg-card;
  transition: border-color $duration-fast;
  
  &::placeholder {
    color: $text-quaternary;
  }
  
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.editor-content {
  border-radius: $radius-lg;
  overflow: hidden;
  margin-bottom: $space-4;
}

.publish-settings {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  margin-bottom: $space-4;
}

.settings-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-4;
  padding-bottom: $space-3;
  border-bottom: 1px solid $border-light;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
  margin-bottom: $space-4;
}

.form-group {
  margin-bottom: $space-4;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &--checkbox {
    margin-top: $space-2;
  }
}

.form-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  margin-bottom: $space-2;
}

.ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba($primary, 0.1);
  color: $primary;
  border: 1px solid rgba($primary, 0.3);
  border-radius: $radius-full;
  font-size: 12px;
  cursor: pointer;
  transition: all $duration-fast;
  
  &:hover:not(:disabled) {
    background: rgba($primary, 0.2);
    border-color: $primary;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.select {
  width: 100%;
  height: 40px;
  padding: 0 $space-4;
  border: 1px solid $border;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $text-primary;
  background: $bg-card;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 $space-4;
  border: 1px solid $border;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $text-primary;
  background: $bg-card;
  
  &::placeholder {
    color: $text-tertiary;
  }
  
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.textarea {
  width: 100%;
  padding: $space-3 $space-4;
  border: 1px solid $border;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $text-primary;
  background: $bg-card;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  
  &::placeholder {
    color: $text-tertiary;
  }
  
  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: $space-2;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: $primary;
  }
  
  span {
    font-size: $text-sm;
    color: $text-secondary;
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 $space-5;
  background: $bg-card;
  border-radius: $radius-lg;
  position: sticky;
  bottom: $space-4;
  box-shadow: $shadow-lg;
  border: 1px solid $border-light;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.footer-hint {
  font-size: $text-xs;
  color: $text-tertiary;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  height: 40px;
  padding: 0 $space-5;
  border-radius: $radius-md;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $duration-fast;
  border: none;
  
  &--ghost {
    background: transparent;
    color: $text-secondary;
    border: 1px solid $border;
    
    &:hover {
      color: $text-primary;
      border-color: $text-tertiary;
      background: $bg-hover;
    }
  }
  
  &--secondary {
    background: $bg-secondary;
    color: $text-primary;
    border: 1px solid $border;
    
    &:hover {
      background: $bg-tertiary;
    }
  }
  
  &--primary {
    background: $primary;
    color: white;
    
    &:hover:not(:disabled) {
      background: $primary-light;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba($primary, 0.4);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.btn-loading {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 响应式
@media (max-width: $breakpoint-md) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .editor-footer {
    flex-direction: column;
    gap: $space-3;
    
    .footer-left,
    .footer-right {
      width: 100%;
      justify-content: center;
    }
  }
  
  .footer-hint {
    display: none;
  }
}

// 深色模式
[data-theme="dark"] {
  .title-input {
    background: $dark-bg-card;
    border-color: $dark-border;
    color: $dark-text-primary;
  }
  
  .publish-settings {
    background: $dark-bg-card;
  }
  
  .settings-title {
    border-color: $dark-border;
  }
  
  .select,
  .input,
  .textarea {
    background: $dark-bg-card;
    border-color: $dark-border;
    color: $dark-text-primary;
  }
  
  .editor-footer {
    background: $dark-bg-card;
    border-color: $dark-border;
  }
  
  .footer-btn {
    &--ghost {
      border-color: $dark-border;
      color: $dark-text-secondary;
      
      &:hover {
        color: $dark-text-primary;
        border-color: $dark-text-tertiary;
        background: $dark-bg-hover;
      }
    }
    
    &--secondary {
      background: $dark-bg-tertiary;
      border-color: $dark-border;
      color: $dark-text-primary;
      
      &:hover {
        background: $dark-bg-hover;
      }
    }
  }
}
</style>
