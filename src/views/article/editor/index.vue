<template>
  <div class="editor-page">
    <div class="app-container">
      <div class="editor-header">
        <input
          v-model="title"
          class="title-input"
          type="text"
          placeholder="请输入文章标题"
        />
        <div class="editor-actions">
          <BButton variant="ghost" @click="saveDraft">保存草稿</BButton>
          <BButton variant="primary" @click="showPublishModal = true">发布文章</BButton>
        </div>
      </div>
      
      <div class="editor-content">
        <MdEditor
          v-model="content"
          :theme="theme"
          :toolbars="toolbars"
          placeholder="开始编写文章内容..."
          :on-upload-img="handleUploadImg"
          @on-save="handleSave"
        />
      </div>
      
      <!-- 发布弹窗 -->
      <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
        <div class="publish-modal">
          <h3 class="modal-title">发布文章</h3>
          
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
            <label class="form-label">标签（用逗号分隔）</label>
            <input
              v-model="tagsInput"
              class="input"
              type="text"
              placeholder="例如：Vue,前端,JavaScript"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">摘要</label>
            <textarea
              v-model="abstract"
              class="textarea"
              placeholder="请输入文章摘要"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="openComment" />
              开启评论
            </label>
          </div>
          
          <div class="modal-actions">
            <BButton variant="ghost" @click="showPublishModal = false">取消</BButton>
            <BButton variant="primary" :loading="publishing" @click="publishArticle">
              发布
            </BButton>
          </div>
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
const showPublishModal = ref(false)
const publishing = ref(false)

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
  'save',
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

// 图片上传处理
async function handleUploadImg(files: File[], callback: (urls: string[]) => void) {
  const urls: string[] = []
  
  for (const file of files) {
    try {
      const res = await uploadImage(file)
      // 拼接完整的图片URL
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
  // TODO: 保存草稿到本地或后端
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
      status: 2, // 待审核
      categoryID: categoryId.value,
      abstract: abstract.value,
      openComment: openComment.value
    })
    
    // 清除草稿
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

// 加载草稿
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-4;
}

.title-input {
  flex: 1;
  height: 48px;
  border: none;
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  background: transparent;
  
  &::placeholder {
    color: $text-quaternary;
  }
  
  &:focus {
    outline: none;
  }
}

.editor-actions {
  display: flex;
  gap: $space-3;
}

.editor-content {
  border-radius: $radius-lg;
  overflow: hidden;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.publish-modal {
  width: 100%;
  max-width: 500px;
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-6;
}

.modal-title {
  font-size: $text-xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.form-group {
  margin-bottom: $space-4;
}

.form-label {
  display: block;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  margin-bottom: $space-2;
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
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: $space-2;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
  margin-top: $space-6;
}

// 深色模式
[data-theme="dark"] {
  .title-input {
    color: $dark-text-primary;
  }
  
  .publish-modal {
    background: $dark-bg-card;
  }
  
  .select {
    background: $dark-bg-card;
    border-color: $dark-border;
    color: $dark-text-primary;
  }
}
</style>
