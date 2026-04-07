<template>
  <div class="admin-banners">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Banner 管理</h1>
        <span class="banner-count">共 {{ total }} 个 Banner</span>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="openAddModal">添加 Banner</button>
      </div>
    </div>
    
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 200px">封面</th>
              <th>链接</th>
              <th style="width: 100px">显示</th>
              <th style="width: 180px">创建时间</th>
              <th style="width: 150px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="banner in banners" :key="banner.id">
              <td>{{ banner.id }}</td>
              <td>
                <div class="banner-cover" @click="previewImage(getFullImageUrl(banner.cover))">
                  <img v-if="banner.cover" :src="getFullImageUrl(banner.cover)" alt="cover" />
                  <span v-else class="cover-placeholder">无</span>
                </div>
              </td>
              <td class="href-cell">
                <a :href="banner.href" target="_blank" class="href-link">{{ banner.href }}</a>
              </td>
              <td>
                <span class="tag" :class="banner.show ? 'tag--success' : 'tag--default'">
                  {{ banner.show ? '显示' : '隐藏' }}
                </span>
              </td>
              <td>{{ formatDate(banner.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="openEditModal(banner)">编辑</button>
                  <button class="action-btn danger" @click="deleteBannerItem(banner.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="banners.length === 0" class="empty-state">
        <p>暂无 Banner 数据</p>
      </div>
      
      <div v-if="total > 0" class="pagination">
        <div class="pagination-info">
          共 {{ total }} 条，第 {{ page }}/{{ totalPages }} 页
        </div>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="page <= 1" @click="goToPage(1)">首页</button>
          <button class="page-btn" :disabled="page <= 1" @click="goToPage(page - 1)">上一页</button>
          <button class="page-btn" :disabled="page >= totalPages" @click="goToPage(page + 1)">下一页</button>
          <button class="page-btn" :disabled="page >= totalPages" @click="goToPage(totalPages)">末页</button>
        </div>
      </div>
    </div>
    
    <div v-if="showImagePreview" class="modal-overlay" @click="showImagePreview = false">
      <div class="image-preview-modal" @click.stop>
        <img :src="previewImageUrl" alt="preview" />
        <button class="close-preview" @click="showImagePreview = false">×</button>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="banner-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑 Banner' : '添加 Banner' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">封面图片</label>
            <div 
              class="cover-upload" 
              :class="{ 'is-dragover': isDragover, 'is-uploading': isUploading }"
              @dragover.prevent="isDragover = true"
              @dragleave.prevent="isDragover = false"
              @drop.prevent="handleDrop"
              @click="!isUploading && selectCover()"
            >
              <input 
                ref="coverInput" 
                type="file" 
                accept="image/*" 
                style="display: none" 
                @change="handleFileChange"
              />
              <div v-if="isUploading" class="upload-progress">
                <div class="progress-circle">
                  <svg viewBox="0 0 36 36">
                    <path
                      class="circle-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      class="circle"
                      :stroke-dasharray="`${uploadProgress}, 100`"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span class="progress-text">{{ uploadProgress }}%</span>
                </div>
                <p class="upload-status">正在上传...</p>
              </div>
              <div v-else-if="form.cover" class="cover-preview">
                <img :src="getFullImageUrl(form.cover)" alt="cover" />
                <div class="cover-overlay">
                  <span>点击更换</span>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p class="upload-hint">拖拽图片到此处上传，或点击选择</p>
                <p class="upload-tip">支持 JPG、PNG、GIF 格式</p>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">跳转链接</label>
            <input v-model="form.href" type="text" class="form-input" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">是否显示</label>
            <Switch v-model="form.show" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveBanner">保存</button>
        </div>
      </div>
    </div>
    
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Banner, CreateBannerParams } from '@/types'
import { getBannerList, createBanner, updateBanner, deleteBanner, uploadImage } from '@/api/modules/banner'
import { getFullImageUrl } from '@/utils/image'
import Switch from '@/components/base/Switch/index.vue'

const banners = ref<Banner[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const form = ref<CreateBannerParams>({
  cover: '',
  href: '',
  show: true
})

const totalPages = computed(() => Math.ceil(total.value / limit.value))

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

async function fetchBanners() {
  try {
    const res = await getBannerList({
      page: String(page.value),
      limit: String(limit.value)
    })
    banners.value = res.data.list || []
    total.value = res.data.count || 0
  } catch (error) {
    console.error('Failed to fetch banners:', error)
  }
}

function goToPage(p: number) {
  page.value = p
  fetchBanners()
}

function previewImage(url: string) {
  previewImageUrl.value = url
  showImagePreview.value = true
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function openAddModal() {
  isEdit.value = false
  editingId.value = null
  form.value = { cover: '', href: '', show: true }
  showModal.value = true
}

function openEditModal(banner: Banner) {
  isEdit.value = true
  editingId.value = banner.id
  form.value = { cover: banner.cover, href: banner.href, show: banner.show }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  isUploading.value = false
  uploadProgress.value = 0
}

function selectCover() {
  coverInput.value?.click()
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
    showToast('请选择图片文件', 'error')
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
    form.value.cover = res.data
    uploadProgress.value = 100
    showToast('图片上传成功')
    clearInterval(progressInterval)
  } catch (error) {
    console.error('Upload failed:', error)
    showToast('图片上传失败', 'error')
    clearInterval(progressInterval)
  } finally {
    setTimeout(() => {
      isUploading.value = false
    }, 500)
  }
}

async function saveBanner() {
  if (!form.value.cover) {
    showToast('请上传封面图片', 'error')
    return
  }
  
  try {
    if (isEdit.value && editingId.value) {
      await updateBanner(editingId.value, form.value)
      showToast('修改成功')
    } else {
      await createBanner(form.value)
      showToast('添加成功')
    }
    closeModal()
    fetchBanners()
  } catch (error) {
    console.error('Save failed:', error)
    showToast('操作失败', 'error')
  }
}

async function deleteBannerItem(id: number) {
  if (!confirm('确定要删除这个 Banner 吗？')) return
  
  try {
    await deleteBanner([id])
    showToast('删除成功')
    fetchBanners()
  } catch (error) {
    console.error('Delete failed:', error)
    showToast('删除失败', 'error')
  }
}

onMounted(() => {
  fetchBanners()
})
</script>

<style scoped lang="scss">
.admin-banners {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.banner-count {
  font-size: 14px;
  color: #64748b;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  
  &-primary {
    background: #3b82f6;
    color: #fff;
    
    &:hover {
      background: #2563eb;
    }
  }
  
  &-secondary {
    background: #f1f5f9;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  }
  
  th {
    font-weight: 500;
    color: #64748b;
    font-size: 13px;
    background: #f8fafc;
  }
  
  td {
    font-size: 14px;
    color: #1e293b;
  }
  
  tbody tr:hover {
    background: #f8fafc;
  }
}

.banner-cover {
  width: 120px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .cover-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #94a3b8;
    font-size: 12px;
  }
}

.href-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.href-link {
  color: #3b82f6;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  
  &--default {
    background: #f1f5f9;
    color: #64748b;
  }
  
  &--success {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 10px;
  font-size: 13px;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  &.danger {
    color: #ef4444;
  }
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  z-index: 100;
}

.image-preview-modal {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  z-index: 101;
  
  img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 8px;
  }
}

.close-preview {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  font-size: 32px;
  color: #fff;
  cursor: pointer;
}

.banner-modal {
  width: 500px;
  background: #fff;
  border-radius: 12px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #64748b;
  }
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.cover-upload {
  width: 200px;
  height: 120px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9fafb;
  overflow: hidden;
  
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
    border-color: #e5e7eb;
    background: #fafafa;
  }
  
  .cover-preview {
    width: 100%;
    height: 100%;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      span {
        color: #fff;
        font-size: 13px;
      }
    }
    
    &:hover .cover-overlay {
      opacity: 1;
    }
  }
  
  .upload-placeholder {
    text-align: center;
    padding: 16px;
    
    .upload-icon {
      width: 40px;
      height: 40px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    
    .upload-hint {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .upload-tip {
      font-size: 12px;
      color: #94a3b8;
    }
  }
  
  .upload-progress {
    text-align: center;
    
    .progress-circle {
      position: relative;
      width: 60px;
      height: 60px;
      margin: 0 auto 8px;
      
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
      font-size: 13px;
      color: #64748b;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: toastIn 0.3s ease;
  
  &.success {
    background: #10b981;
    color: #fff;
  }
  
  &.error {
    background: #ef4444;
    color: #fff;
  }
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>