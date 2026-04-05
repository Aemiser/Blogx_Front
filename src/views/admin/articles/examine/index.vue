<template>
  <div class="admin-examine">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">文章审核</h1>
        <span class="pending-count">待审核: {{ pendingCount }} 篇</span>
      </div>
      <div class="header-right">
        <select v-model="statusFilter" class="filter-select">
          <option :value="2">待审核</option>
          <option :value="3">已通过</option>
          <option :value="4">已拒绝</option>
          <option :value="0">全部</option>
        </select>
      </div>
    </div>
    
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th>标题</th>
              <th style="width: 100px">作者</th>
              <th style="width: 80px">浏览</th>
              <th style="width: 80px">状态</th>
              <th style="width: 180px">提交时间</th>
              <th style="width: 200px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in filteredArticles" :key="article.id">
              <td>{{ article.id }}</td>
              <td class="title-cell">{{ article.title }}</td>
              <td>{{ article.nickName }}</td>
              <td>{{ article.lookCount }}</td>
              <td>
                <span class="tag" :class="getStatusClass(article.status)">
                  {{ getStatusName(article.status) }}
                </span>
              </td>
              <td>{{ formatDate(article.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="viewArticle(article.id)">查看</button>
                  <button 
                    v-if="article.status === 2" 
                    class="action-btn primary" 
                    @click="approveArticle(article.id)"
                  >
                    通过
                  </button>
                  <button 
                    v-if="article.status === 2" 
                    class="action-btn danger" 
                    @click="openRejectModal(article.id)"
                  >
                    拒绝
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <p>暂无待审核文章</p>
      </div>
    </div>
    
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="reject-modal" @click.stop>
        <div class="modal-header">
          <h3>拒绝文章</h3>
          <button class="close-btn" @click="closeRejectModal">×</button>
        </div>
        <div class="modal-body">
          <p class="reject-tip">请输入拒绝理由：</p>
          <textarea 
            v-model="rejectMsg" 
            class="reject-input" 
            placeholder="请输入拒绝理由..."
            rows="4"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRejectModal">取消</button>
          <button class="btn btn-danger" @click="confirmReject">确认拒绝</button>
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
import { useRouter } from 'vue-router'
import type { Article } from '@/types'
import { getArticleList, examineArticle } from '@/api/modules/article'

const router = useRouter()
const articles = ref<Article[]>([])
const statusFilter = ref(2)
const showRejectModal = ref(false)
const rejectMsg = ref('')
const rejectingArticleId = ref<number | null>(null)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const filteredArticles = computed(() => {
  if (statusFilter.value === 0) return articles.value
  return articles.value.filter(a => a.status === statusFilter.value)
})

const pendingCount = computed(() => {
  return articles.value.filter(a => a.status === 2).length
})

async function fetchArticles() {
  try {
    const res = await getArticleList({
      type: 3,
      page: 1,
      limit: 100
    })
    articles.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  }
}

function getStatusName(status: number) {
  const map: Record<number, string> = {
    1: '草稿',
    2: '待审核',
    3: '已发布',
    4: '已拒绝'
  }
  return map[status] || '未知'
}

function getStatusClass(status: number) {
  const map: Record<number, string> = {
    1: 'tag--default',
    2: 'tag--warning',
    3: 'tag--success',
    4: 'tag--error'
  }
  return map[status] || ''
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function viewArticle(id: number) {
  router.push(`/article/${id}`)
}

async function approveArticle(id: number) {
  try {
    await examineArticle({ articleID: id, status: 3 })
    const index = articles.value.findIndex(a => a.id === id)
    if (index !== -1) {
      articles.value[index].status = 3
    }
    showToast('审核通过')
  } catch (error) {
    console.error('Approve failed:', error)
    showToast('操作失败', 'error')
  }
}

function openRejectModal(id: number) {
  rejectingArticleId.value = id
  rejectMsg.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectMsg.value = ''
  rejectingArticleId.value = null
}

async function confirmReject() {
  if (!rejectingArticleId.value) return
  try {
    await examineArticle({ 
      articleID: rejectingArticleId.value, 
      status: 4, 
      msg: rejectMsg.value 
    })
    const index = articles.value.findIndex(a => a.id === rejectingArticleId.value)
    if (index !== -1) {
      articles.value[index].status = 4
    }
    closeRejectModal()
    showToast('已拒绝')
  } catch (error) {
    console.error('Reject failed:', error)
    showToast('操作失败', 'error')
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.admin-examine {
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

.pending-count {
  font-size: 14px;
  color: #f59e0b;
  font-weight: 500;
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
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

.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
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
  
  &--warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
  
  &--success {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  
  &--error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
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
  
  &.primary {
    background: #10b981;
    color: #fff;
    border-radius: 4px;
    
    &:hover {
      background: #059669;
    }
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

.reject-modal {
  width: 450px;
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

.reject-tip {
  margin: 0 0 12px;
  color: #374151;
  font-size: 14px;
}

.reject-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  
  &-secondary {
    background: #f1f5f9;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  }
  
  &-danger {
    background: #ef4444;
    color: #fff;
    
    &:hover {
      background: #dc2626;
    }
  }
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
