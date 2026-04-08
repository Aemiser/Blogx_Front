<template>
  <div class="admin-articles">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">文章管理</h1>
        <span class="article-count">共 {{ total }} 篇文章</span>
      </div>
      <div class="header-right">
        <select v-model="statusFilter" class="status-filter" @change="handleStatusChange">
          <option :value="undefined">全部状态</option>
          <option :value="1">草稿</option>
          <option :value="2">待审核</option>
          <option :value="3">已发布</option>
          <option :value="4">已拒绝</option>
        </select>
        <input 
          v-model="searchKeyword" 
          type="text" 
          class="search-input" 
          placeholder="搜索文章..."
          @keyup.enter="handleSearch"
        />
      </div>
    </div>
    
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 50px">ID</th>
              <th style="width: 60px">封面</th>
              <th>标题</th>
              <th>作者</th>
              <th>分类</th>
              <th>浏览</th>
              <th>评论</th>
              <th>置顶</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id">
              <td>{{ article.id }}</td>
              <td>
                <div class="article-cover" @click="article.cover && previewImage(article.cover)">
                  <img v-if="article.cover" :src="getFullImageUrl(article.cover)" alt="cover" />
                  <span v-else class="cover-placeholder">无</span>
                </div>
              </td>
              <td class="title-cell">{{ article.title }}</td>
              <td>
                <div class="author-cell">
                  <img 
                    v-if="article.userAvatar" 
                    :src="getFullImageUrl(article.userAvatar)" 
                    class="author-avatar" 
                    @click.stop="previewImage(getFullImageUrl(article.userAvatar))"
                  />
                  <span class="author-name" @click="showAuthorInfo(article)">{{ article.nickName }}</span>
                </div>
              </td>
              <td>{{ article.categoryTitle || '-' }}</td>
              <td>{{ article.lookCount }}</td>
              <td>{{ article.commentCount }}</td>
              <td>
                <span v-if="article.userTop || article.adminTop" class="top-tag">置顶</span>
                <span v-else class="top-none">-</span>
              </td>
              <td>
                <span class="tag" :class="getStatusClass(article.status)">
                  {{ getStatusName(article.status) }}
                </span>
              </td>
              <td>{{ formatDate(article.createdAt) }}</td>
                <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="viewArticle(article.id)">查看</button>
                  <button class="action-btn danger" @click="deleteArticle(article.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="articles.length === 0" class="empty-state">
        <p>暂无文章数据</p>
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
    
    <div v-if="showAuthorModal" class="modal-overlay" @click="showAuthorModal = false">
      <div class="modal-detail" @click.stop>
        <div class="modal-header">
          <h3>作者详情</h3>
          <button class="close-btn" @click="showAuthorModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-avatar" @click="authorInfo?.avatar && previewImage(getFullImageUrl(authorInfo.avatar))">
            <img v-if="authorInfo?.avatar" :src="getFullImageUrl(authorInfo.avatar)" alt="avatar" />
            <span v-else class="avatar-placeholder">{{ authorInfo?.nickName?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="detail-info">
            <div class="detail-item">
              <span class="detail-label">昵称</span>
              <span class="detail-value">{{ authorInfo?.nickName }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">博客龄</span>
              <span class="detail-value">{{ selectedAuthorDetail.codeAge }} 年</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">浏览量</span>
              <span class="detail-value">{{ selectedAuthorDetail.lookCount }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">获赞数</span>
              <span class="detail-value">{{ selectedAuthorDetail.likeCount }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">关注数</span>
              <span class="detail-value">{{ selectedAuthorDetail.followCount }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">粉丝数</span>
              <span class="detail-value">{{ selectedAuthorDetail.fansCount }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">收藏数</span>
              <span class="detail-value">{{ selectedAuthorDetail.collectCount }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">文章数</span>
              <span class="detail-value">{{ selectedAuthorDetail.articleCount }}</span>
            </div>
            <div v-if="selectedAuthorDetail" class="detail-item">
              <span class="detail-label">所在地</span>
              <span class="detail-value">{{ selectedAuthorDetail.place || '-' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="router.push(`/user/${authorInfo?.userID}`)">查看主页</button>
          <button class="btn btn-primary" @click="showAuthorModal = false">关闭</button>
        </div>
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
import { getArticleList, adminDeleteArticle, examineArticle } from '@/api/modules/article'
import { getUserBase } from '@/api/modules/user'
import { getFullImageUrl } from '@/utils/image'

const router = useRouter()
const articles = ref<Article[]>([])
const searchKeyword = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const showAuthorModal = ref(false)
const authorInfo = ref<{ nickName: string; avatar: string; userID: number } | null>(null)
const selectedAuthorDetail = ref<any>(null)
const showRejectModal = ref(false)
const rejectMsg = ref('')
const rejectingArticleId = ref<number | null>(null)
const statusFilter = ref<number | undefined>(undefined)
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

const totalPages = computed(() => Math.ceil(total.value / limit.value))

async function fetchArticles() {
  try {
    const params: any = {
      type: 3,
      page: page.value,
      limit: limit.value,
      key: searchKeyword.value || undefined
    }
    if (statusFilter.value !== undefined && statusFilter.value !== null) {
      params.status = Number(statusFilter.value)
      console.log('statusFilter value:', statusFilter.value, 'params.status:', params.status)
    }
    const res = await getArticleList(params)
    articles.value = (res.data.list || []).map((item: any) => ({
      ...item,
      id: item.ID || item.id,
      createdAt: item.CreatedAt || item.createdAt,
      updatedAt: item.UpdatedAt || item.updatedAt
    }))
    total.value = res.data.count || 0
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  }
}

function handleSearch() {
  page.value = 1
  fetchArticles()
}

function handleStatusChange() {
  page.value = 1
  fetchArticles()
}

function goToPage(p: number) {
  page.value = p
  fetchArticles()
}

function previewImage(url: string) {
  previewImageUrl.value = url
  showImagePreview.value = true
}

function showAuthorInfo(article: Article) {
  authorInfo.value = {
    nickName: article.nickName,
    avatar: article.userAvatar,
    userID: article.userID
  }
  fetchAuthorDetail(article.userID)
  showAuthorModal.value = true
}

async function fetchAuthorDetail(userId: number) {
  try {
    const res = await getUserBase(userId)
    selectedAuthorDetail.value = res.data
  } catch (error) {
    console.error('Failed to fetch author detail:', error)
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

async function deleteArticle(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return
  
  try {
    await adminDeleteArticle([id])
    articles.value = articles.value.filter(a => a.id !== id)
    total.value--
    showToast('删除成功')
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

async function approveArticle(id: number) {
  try {
    await examineArticle({ articleID: id, status: 3 })
    const article = articles.value.find(a => a.id === id)
    if (article) article.status = 3
    showToast('审核通过')
  } catch (error) {
    console.error('Approve failed:', error)
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
    const article = articles.value.find(a => a.id === rejectingArticleId.value)
    if (article) article.status = 4
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
.admin-articles {
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

.article-count {
  font-size: 14px;
  color: #64748b;
}

.search-input {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 240px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.status-filter {
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
    padding: 10px 4px;
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
  }
  
  th:first-child,
  th:nth-child(2),
  td:first-child,
  td:nth-child(2) {
    text-align: left;
    padding: 10px 8px;
  }
  
  th:nth-child(4) {
    text-align: left;
    padding-left: 42px;
  }
  
  td:last-child {
    text-align: center;
  }
  
  th {
    font-weight: 500;
    color: #64748b;
    font-size: 12px;
    background: #f8fafc;
  }
  
  td {
    font-size: 13px;
    color: #1e293b;
  }
  
  tbody tr:hover {
    background: #f8fafc;
  }
}

.article-cover {
  width: 48px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  background: #f1f5f9;
  
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
    font-size: 10px;
    color: #94a3b8;
  }
}

.author-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10px;
  gap: 8px;
  
  .author-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    flex-shrink: 0;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  .author-name {
    cursor: pointer;
    color: #3b82f6;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.top-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  background: #ef4444;
  color: #fff;
  border-radius: 4px;
}

.top-none {
  color: #94a3b8;
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
  justify-content: center;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
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
  background: rgba(0, 0, 0, 0.7);
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

.modal-detail {
  width: 400px;
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
  padding: 24px;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  margin: 0 auto 20px;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 28px;
    font-weight: 500;
    color: #64748b;
  }
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  color: #64748b;
  font-size: 14px;
}

.detail-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
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
  
  &-primary {
    background: #3b82f6;
    color: #fff;
    
    &:hover {
      background: #2563eb;
    }
  }
}

.article-cover {
  cursor: pointer;
}

.reject-modal {
  width: 450px;
  background: #fff;
  border-radius: 12px;
  max-width: 90vw;
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

.btn-danger {
  background: #ef4444;
  color: #fff;
  
  &:hover {
    background: #dc2626;
  }
}

.action-btn.success {
  color: #10b981;
  
  &:hover {
    text-decoration: underline;
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
