<template>
  <div class="admin-images">
    <div class="page-header">
      <h1 class="page-title">图片管理</h1>
      <div class="header-actions">
        <button 
          class="btn-preview" 
          :class="{ active: showPreview }"
          @click="showPreview = !showPreview"
        >
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </button>
        <button class="btn-delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </button>
      </div>
    </div>
    
    <div class="main-content">
      <div class="card image-list-card">
        <div class="toolbar">
          <div class="search-box">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索文件名..."
              class="search-input"
            />
          </div>
          <div class="pagination-info">
            共 {{ total }} 张图片
          </div>
        </div>
        
        <div v-if="loading" class="loading">
          加载中...
        </div>
        
        <div v-else-if="imageList.length === 0" class="empty">
          暂无图片
        </div>
        
        <div v-else class="image-grid">
          <div 
            v-for="img in imageList" 
            :key="img.id" 
            class="image-item"
            :class="{ selected: selectedIds.includes(img.id) }"
          >
            <div class="image-checkbox" @click.stop="toggleSelect(img.id)">
              <input 
                type="checkbox" 
                :checked="selectedIds.includes(img.id)"
              />
            </div>
            <div class="image-preview" @click.stop="handleImageClick(img)">
              <img :src="getImageUrl(img.webPath)" :alt="img.filename" />
            </div>
            <div class="image-info">
              <div class="image-name" :title="img.filename">{{ img.filename }}</div>
              <div class="image-meta">
                {{ formatSize(img.size) }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="total > limit" class="pagination">
          <button 
            class="page-btn" 
            :disabled="page <= 1" 
            @click="changePage(page - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ page }} / {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="page >= totalPages" 
            @click="changePage(page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
      
      <div v-if="showPreview && previewImage" class="preview-card">
        <div class="preview-header">
          <span class="preview-title">{{ previewImage.filename }}</span>
        </div>
        <div class="preview-content">
          <img :src="getImageUrl(previewImage.webPath)" :alt="previewImage.filename" />
        </div>
        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">路径</span>
            <span class="info-value">{{ previewImage.path }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">大小</span>
            <span class="info-value">{{ formatSize(previewImage.size) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Hash</span>
            <span class="info-value">{{ previewImage.hash }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedIds.length > 0" class="selection-bar">
      已选择 {{ selectedIds.length }} 张图片
      <button class="btn-delete" @click="handleBatchDelete">删除</button>
      <button class="btn-cancel" @click="clearSelection">取消</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getImageList, deleteImages } from '@/api/modules/banner'
import type { ImageInfo } from '@/types'
import { toast } from '@/composables/useToast'

const imageList = ref<ImageInfo[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const searchKeyword = ref('')
const selectedIds = ref<number[]>([])
const previewImage = ref<ImageInfo | null>(null)
const showPreview = ref(false)

const totalPages = computed(() => Math.ceil(total.value / limit.value))

const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

function getImageUrl(path: string) {
  if (!path) return ''
  return `${baseUrl}${path}`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function fetchImages() {
  loading.value = true
  try {
    const res = await getImageList({ 
      page: page.value.toString(), 
      limit: limit.value.toString() 
    })
    imageList.value = (res.data.list || []).map((img: any) => ({
      ...img,
      id: img.ID || img.id
    }))
    total.value = res.data.count || 0
  } catch (error) {
    console.error('Failed to fetch images:', error)
  } finally {
    loading.value = false
  }
}

function toggleSelect(id: number) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

function handleImageClick(img: ImageInfo) {
  previewImage.value = img
}

function clearSelection() {
  selectedIds.value = []
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  
  try {
    await deleteImages(selectedIds.value)
    selectedIds.value = []
    await fetchImages()
    toast.success('删除成功')
  } catch (error) {
    console.error('Failed to delete images:', error)
    toast.error('删除失败')
  }
}

function changePage(newPage: number) {
  page.value = newPage
  fetchImages()
}

onMounted(() => {
  fetchImages()
})
</script>

<style scoped lang="scss">
.admin-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-preview {
  padding: 8px 16px;
  font-size: 14px;
  color: #1e293b;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: #e2e8f0;
  }
  
  &.active {
    background: #3b82f6;
    color: #fff;
  }
}

.btn-delete {
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background: #ef4444;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #dc2626;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.image-list-card {
  flex: 1;
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
  }
  
  &.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  .image-checkbox {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    
    input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  background: #f1f5f9;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-info {
  padding: 8px;
}

.image-name {
  font-size: 13px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #1e293b;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: #e2e8f0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-info {
  font-size: 14px;
  color: #64748b;
}

.preview-card {
  width: 350px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: sticky;
  top: 68px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.preview-content {
  padding: 16px;
  
  img {
    width: 100%;
    border-radius: 8px;
  }
}

.preview-info {
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .info-label {
    width: 50px;
    color: #64748b;
  }
  
  .info-value {
    flex: 1;
    color: #1e293b;
    word-break: break-all;
  }
}

.selection-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: #1e293b;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  
  .btn-delete {
    background: #ef4444;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  .btn-cancel {
    padding: 8px 16px;
    font-size: 14px;
    color: #94a3b8;
    background: transparent;
    border: none;
    cursor: pointer;
    
    &:hover {
      color: #fff;
    }
  }
}
</style>