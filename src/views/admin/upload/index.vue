<template>
  <div class="admin-upload">
    <div class="page-header">
      <h1 class="page-title">图片上传</h1>
      <div class="header-actions">
        <button 
          class="btn-preview" 
          :class="{ active: showPreviewPanel }"
          @click="showPreviewPanel = !showPreviewPanel"
        >
          {{ showPreviewPanel ? '隐藏预览' : '显示预览' }}
        </button>
      </div>
    </div>
    
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'upload' }"
        @click="activeTab = 'upload'"
      >
        本地上传
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'transfer' }"
        @click="activeTab = 'transfer'"
      >
        图片转存
      </button>
    </div>
    
    <div class="content-wrapper">
      <div class="card upload-card">
        <div v-if="activeTab === 'upload'" class="upload-section">
          <div 
            class="upload-area" 
            :class="{ 'is-dragover': isDragover, 'is-uploading': isUploading }"
            @dragover.prevent="isDragover = true"
            @dragleave.prevent="isDragover = false"
            @drop.prevent="handleDrop"
            @click="openFileInput"
          >
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              class="file-input" 
              @change="handleFileChange"
            />
            <div v-if="isUploading" class="upload-progress">
              <div class="progress-circle">
                <svg viewBox="0 0 36 36">
                  <path
                    class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="circle"
                    :stroke-dasharray="`${uploadProgress}, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
              <p class="upload-status">正在上传...</p>
            </div>
            <div v-else class="upload-placeholder">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p class="upload-hint">拖拽图片到此处上传，或点击选择文件</p>
              <p class="upload-tip">支持 JPG、PNG、GIF 格式</p>
            </div>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'transfer'" class="transfer-section">
          <div class="transfer-input-area">
            <textarea 
              v-model="transferUrl" 
              class="transfer-input" 
              placeholder="请输入要转存的图片URL，每行一个"
            ></textarea>
            <button 
              class="transfer-btn" 
              :disabled="!transferUrl.trim() || isTransferring"
              @click="handleTransfer"
            >
              {{ isTransferring ? '转存中...' : '开始转存' }}
            </button>
          </div>
          
          <div v-if="transferResults.length > 0" class="transfer-results-list">
            <div v-for="(item, index) in transferResults" :key="index" class="transfer-result-item">
              <div class="url-item">
                <span class="url-label">原始URL {{ index + 1 }}</span>
                <div class="url-content">
                  <input :value="item" type="text" class="url-input" readonly />
                  <button class="copy-btn" @click="copyUrl(item)">复制</button>
                </div>
              </div>
              <div class="url-item">
                <span class="url-label">完整URL {{ index + 1 }}</span>
                <div class="url-content">
                  <input :value="getFullUrl(item)" type="text" class="url-input" readonly />
                  <button class="copy-btn" @click="copyUrl(getFullUrl(item))">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="uploadedUrl" class="upload-result">
          <div class="url-item">
            <span class="url-label">原始URL</span>
            <div class="url-content">
              <input :value="uploadedUrl" type="text" class="url-input" readonly />
              <button class="copy-btn" @click="copyUrl(uploadedUrl)">复制</button>
            </div>
          </div>
          <div class="url-item">
            <span class="url-label">完整URL</span>
            <div class="url-content">
              <input :value="fullUrl" type="text" class="url-input" readonly />
              <button class="copy-btn" @click="copyUrl(fullUrl)">复制</button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showPreviewPanel" class="preview-area">
        <div v-if="activeTab === 'upload' && uploadInfo" class="preview-card">
          <div class="preview-header">
            <span class="preview-title">{{ uploadInfo.filename }}</span>
          </div>
          <div class="preview-content">
            <img :src="uploadInfo.webPath" :alt="uploadInfo.filename" />
          </div>
          <div class="preview-info">
            <div class="info-item">
              <span class="info-label">路径</span>
              <span class="info-value">{{ uploadInfo.path }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">大小</span>
              <span class="info-value">{{ formatSize(uploadInfo.size) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Hash</span>
              <span class="info-value">{{ uploadInfo.hash }}</span>
            </div>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'transfer' && transferResults.length > 0" class="preview-card">
          <div class="preview-header">
            <span class="preview-title">转存预览</span>
          </div>
          <div class="preview-content">
            <div v-for="(item, index) in transferResults" :key="index" class="transfer-preview-item">
              <img v-if="item" :src="getFullUrl(item)" alt="preview" />
              <span v-else class="preview-error">转存失败</span>
            </div>
          </div>
        </div>
        
        <div v-else class="preview-empty">
          <p>暂无预览内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { uploadImage, transferImage } from '@/api/modules/banner'
import { toast } from '@/composables/useToast'
import type { ImageInfo } from '@/types'

const activeTab = ref('upload')

watch(() => activeTab.value, () => {
  uploadedUrl.value = ''
  uploadInfo.value = null
  transferUrl.value = ''
  transferResults.value = []
})

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadedUrl = ref('')
const uploadInfo = ref<ImageInfo | null>(null)

const transferUrl = ref('')
const isTransferring = ref(false)
const transferResults = ref<string[]>([])

const showPreviewPanel = ref(true)

const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
const fullUrl = computed(() => {
  if (!uploadedUrl.value) return ''
  const url = uploadedUrl.value.startsWith('/') 
    ? uploadedUrl.value 
    : '/' + uploadedUrl.value
  return `${baseUrl}${url}`
})

function getFullUrl(url: string) {
  if (!url) return ''
  const u = url.startsWith('/') ? url : '/' + url
  return `${baseUrl}${u}`
}

function openFileInput() {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    uploadFile(files[0])
  }
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    uploadFile(target.files[0])
    target.value = ''
  }
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.warning('请选择图片文件')
    return
  }
  
  isUploading.value = true
  uploadProgress.value = 0
  uploadedUrl.value = ''
  
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 100)
  
  try {
    const res = await uploadImage(file)
    uploadInfo.value = res.data
    uploadedUrl.value = res.data.path
    showPreviewPanel.value = true
    uploadProgress.value = 100
    clearInterval(progressInterval)
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error('上传失败')
    clearInterval(progressInterval)
  } finally {
    setTimeout(() => {
      isUploading.value = false
    }, 500)
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    toast.success('复制成功')
  }).catch(() => {
    toast.error('复制失败')
  })
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

async function handleTransfer() {
  const urls = transferUrl.value.trim().split('\n').filter(url => url.trim())
  if (urls.length === 0) return
  
  isTransferring.value = true
  transferResults.value = []
  
  for (const url of urls) {
    try {
      const res = await transferImage(url.trim())
      transferResults.value.push(res.data)
    } catch (error) {
      console.error('Transfer failed:', error)
      transferResults.value.push('')
    }
  }
  
  isTransferring.value = false
}
</script>

<style scoped lang="scss">
.admin-upload {
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

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 32px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.upload-card {
  flex: 1;
  min-width: 0;
}

.preview-area {
  width: 350px;
  flex-shrink: 0;
}

.preview-empty {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.preview-card {
  width: 350px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
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

.tabs {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  width: fit-content;
}

.tab-btn {
  padding: 8px 20px;
  font-size: 14px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #1e293b;
  }
  
  &.active {
    background: #fff;
    color: #1e293b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
}

.transfer-section {
  .transfer-input-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .transfer-input {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
  
  .transfer-btn {
    padding: 10px 24px;
    font-size: 14px;
    color: #fff;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    align-self: flex-start;
    
    &:hover:not(:disabled) {
      background: #2563eb;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.transfer-results {
  margin-top: 24px;
  
  .result-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
  }
}

.transfer-result-item {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  
  .url-item {
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.transfer-results-list {
  margin-top: 20px;
}

.transfer-preview-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  img {
    width: 100%;
    border-radius: 6px;
    max-height: 250px;
    object-fit: contain;
  }
  
  .preview-error {
    display: block;
    padding: 20px;
    text-align: center;
    color: #ef4444;
    background: #fef2f2;
    border-radius: 6px;
    font-size: 14px;
  }
}

.transfer-preview-card {
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 6px;
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .result-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.upload-area {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
  
  &:hover {
    border-color: #3b82f6;
    background: #f0f7ff;
  }
  
  &.is-dragover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  &.is-uploading {
    cursor: default;
    border-color: #e2e8f0;
    background: #fafafa;
  }
}

.file-input {
  display: none;
}

.upload-placeholder {
  .upload-icon {
    width: 64px;
    height: 64px;
    color: #94a3b8;
    margin-bottom: 16px;
  }
  
  .upload-hint {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 8px;
  }
  
  .upload-tip {
    font-size: 13px;
    color: #94a3b8;
  }
}

.upload-progress {
  .progress-circle {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 16px;
    
    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    
    .circle-bg {
      fill: none;
      stroke: #e2e8f0;
      stroke-width: 3;
    }
    
    .circle {
      fill: none;
      stroke: #3b82f6;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.3s;
    }
    
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      font-weight: 600;
      color: #3b82f6;
    }
  }
  
  .upload-status {
    font-size: 15px;
    color: #64748b;
  }
}

.upload-result {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.url-item {
  .url-label {
    display: block;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
  }
  
  .url-content {
    display: flex;
    gap: 12px;
  }
  
  .url-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #1e293b;
    background: #f8fafc;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
  
  .copy-btn {
    padding: 10px 20px;
    font-size: 14px;
    color: #fff;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    
    &:hover {
      background: #2563eb;
    }
  }
}
</style>
