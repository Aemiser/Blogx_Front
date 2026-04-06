<template>
  <div class="image-uploader">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadImage } from '@/api/modules/banner'
import { toast } from '@/composables/useToast'

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadedUrl = ref('')

const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
const fullUrl = computed(() => uploadedUrl.value ? `${baseUrl}${uploadedUrl.value}` : '')

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
  }
}

async function uploadFile(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.warning('请选择图片文件')
    return
  }
  
  isUploading.value = true
  uploadProgress.value = 0
  
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 100)
  
  try {
    const res = await uploadImage(file)
    uploadedUrl.value = res.data
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
</script>

<style scoped lang="scss">
.image-uploader {
  width: 100%;
}

.upload-area {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 40px;
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
    width: 48px;
    height: 48px;
    color: #94a3b8;
    margin-bottom: 12px;
  }
  
  .upload-hint {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 4px;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #94a3b8;
  }
}

.upload-progress {
  .progress-circle {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 12px;
    
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
      font-size: 14px;
      font-weight: 600;
      color: #3b82f6;
    }
  }
  
  .upload-status {
    font-size: 14px;
    color: #64748b;
  }
}

.upload-result {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.url-item {
  .url-label {
    display: block;
    font-size: 13px;
    color: #64748b;
    margin-bottom: 6px;
  }
  
  .url-content {
    display: flex;
    gap: 8px;
  }
  
  .url-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    color: #1e293b;
    background: #f8fafc;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
  
  .copy-btn {
    padding: 8px 16px;
    font-size: 13px;
    color: #fff;
    background: #3b82f6;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    
    &:hover {
      background: #2563eb;
    }
  }
}
</style>
