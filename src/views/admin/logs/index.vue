<template>
  <div class="admin-logs">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">日志查看</h1>
        <span class="log-count">共 {{ total }} 条日志</span>
      </div>
      <div class="header-right">
        <select v-model="logTypeFilter" class="filter-select" @change="handleFilterChange">
          <option value="">全部类型</option>
          <option value="1">登录日志</option>
          <option value="2">操作日志</option>
          <option value="3">运行日志</option>
          <option value="4">管理员操作</option>
          <option value="5">查询日志</option>
        </select>
        <input 
          v-model="searchKeyword" 
          type="text" 
          class="search-input" 
          placeholder="搜索日志..."
          @keyup.enter="handleSearch"
        />
        <button class="btn btn-danger" @click="deleteSelectedLogs" :disabled="selectedLogs.length === 0">
          删除选中 ({{ selectedLogs.length }})
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th style="width: 60px">ID</th>
              <th style="width: 80px">类型</th>
              <th style="width: 180px">时间</th>
              <th>内容摘要</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>
                <input 
                  type="checkbox" 
                  :checked="selectedLogs.includes(log.id)"
                  @change="toggleSelect(log.id)"
                />
              </td>
              <td>{{ log.id }}</td>
              <td>
                <span class="tag" :class="getTypeClass(log.logType)">
                  {{ getTypeName(log.logType) }}
                </span>
              </td>
              <td>{{ formatDate(log.createdAt) }}</td>
              <td class="content-cell">
                <div class="content-preview" @click="viewLogDetail(log)">
                  {{ getContentPreview(log.content) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="viewLogDetail(log)">查看</button>
                  <button class="action-btn danger" @click="deleteLog(log.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="logs.length === 0" class="empty-state">
        <p>暂无日志数据</p>
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
    
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>日志详情 - ID: {{ currentLog?.id }}</h3>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="log-meta">
            <div class="meta-item">
              <span class="meta-label">类型</span>
              <span class="tag" :class="getTypeClass(currentLog?.logType)">
                {{ getTypeName(currentLog?.logType) }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">时间</span>
              <span>{{ formatDate(currentLog?.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">用户</span>
              <span>{{ currentLog?.userNickName || '-' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">IP</span>
              <span>{{ currentLog?.ip }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">地址</span>
              <span>{{ currentLog?.addr }}</span>
            </div>
          </div>
          <div class="log-content">
            <div class="content-label">详细内容</div>
            <div class="content-html" v-html="formatLogContent(currentLog?.content)"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailModal = false">关闭</button>
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
import type { LogInfo } from '@/types'
import { getLogList, deleteLogs, readLog } from '@/api/modules/logs'

const logs = ref<LogInfo[]>([])
const logTypeFilter = ref('')
const searchKeyword = ref('')
const selectedLogs = ref<number[]>([])
const showDetailModal = ref(false)
const currentLog = ref<LogInfo | null>(null)
const page = ref(1)
const limit = ref(10)
const total = ref(0)
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

const isAllSelected = computed(() => {
  return logs.value.length > 0 && 
    logs.value.every(l => selectedLogs.value.includes(l.id))
})

async function fetchLogs() {
  try {
    const res = await getLogList({
      page: page.value,
      limit: limit.value,
      logType: logTypeFilter.value || undefined,
      key: searchKeyword.value || undefined
    })
    logs.value = res.data.list
    total.value = res.data.count
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  }
}

function handleFilterChange() {
  page.value = 1
  fetchLogs()
}

function handleSearch() {
  page.value = 1
  fetchLogs()
}

function goToPage(p: number) {
  page.value = p
  fetchLogs()
}

function getTypeName(type: number | undefined) {
  const map: Record<number, string> = {
    1: '登录',
    2: '操作',
    3: '运行',
    4: '管理员操作',
    5: '查询'
  }
  return map[type || 0] || '未知'
}

function getTypeClass(type: number | undefined) {
  const map: Record<number, string> = {
    1: 'tag--success',
    2: 'tag--warning',
    3: 'tag--info',
    4: 'tag--danger',
    5: 'tag--default'
  }
  return map[type || 0] || ''
}

function formatDate(date: string | undefined) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function getContentPreview(content: string | undefined) {
  if (!content) return '-'
  const text = content.replace(/<[^>]+>/g, '').slice(0, 100)
  return text + (content.length > 100 ? '...' : '')
}

function formatLogContent(content: string | undefined): string {
  if (!content) return ''
  
  let formatted = content
  
  formatted = formatted.replace(/<pre class="log_json_body">({[\s\S]*?})<\/pre>/g, (match, jsonStr) => {
    try {
      const json = JSON.parse(jsonStr)
      const pretty = JSON.stringify(json, null, 2)
      const highlighted = pretty
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: (null)/g, ': <span class="json-null">$1</span>')
      return `<pre class="log_json_body">${highlighted}</pre>`
    } catch {
      return match
    }
  })
  
  return formatted
}

function toggleSelect(id: number) {
  const index = selectedLogs.value.indexOf(id)
  if (index === -1) {
    selectedLogs.value.push(id)
  } else {
    selectedLogs.value.splice(index, 1)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedLogs.value = []
  } else {
    selectedLogs.value = logs.value.map(l => l.id)
  }
}

async function viewLogDetail(log: LogInfo) {
  try {
    await readLog(log.id)
  } catch (error) {
    console.error('Failed to read log:', error)
  }
  currentLog.value = log
  showDetailModal.value = true
}

async function deleteLog(id: number) {
  if (!confirm('确定要删除这条日志吗？')) return
  
  try {
    await deleteLogs([id])
    logs.value = logs.value.filter(l => l.id !== id)
    showToast('删除成功')
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

async function deleteSelectedLogs() {
  if (!confirm(`确定要删除选中的 ${selectedLogs.value.length} 条日志吗？`)) return
  
  try {
    await deleteLogs(selectedLogs.value)
    logs.value = logs.value.filter(l => !selectedLogs.value.includes(l.id))
    selectedLogs.value = []
    showToast('删除成功')
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped lang="scss">
.admin-logs {
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

.log-count {
  font-size: 14px;
  color: #64748b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select, .search-input {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.search-input {
  width: 200px;
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
    padding: 12px 16px;
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

.content-cell {
  max-width: 300px;
}

.content-preview {
  cursor: pointer;
  color: #64748b;
  font-size: 13px;
  
  &:hover {
    color: #3b82f6;
  }
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  
  &--info {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  
  &--warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
  
  &--success {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  
  &--danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
  
  &--default {
    background: #f1f5f9;
    color: #64748b;
  }
}

.action-buttons {
  display: flex;
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

.btn {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  
  &-danger {
    background: #ef4444;
    color: #fff;
    
    &:hover {
      background: #dc2626;
    }
    
    &:disabled {
      background: #fca5a5;
      cursor: not-allowed;
    }
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
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
  
  &.modal-large {
    width: 800px;
    max-width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  
  &:hover {
    color: #1e293b;
  }
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.log-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #94a3b8;
}

.log-content {
  .content-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
  }
}

.content-html {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
  
  :deep(.log_request) {
    margin-bottom: 12px;
  }
  
  :deep(.log_request_head) {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  :deep(.log_request_method) {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    
    &.post {
      background: #10b981;
      color: #fff;
    }
    
    &.get {
      background: #3b82f6;
      color: #fff;
    }
  }
  
  :deep(.log_request_path) {
    font-family: monospace;
  }
  
  :deep(.log_json_body) {
    background: #0f172a;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  :deep(.json-key) {
    color: #7dd3fc;
  }
  
  :deep(.json-string) {
    color: #fca5a5;
  }
  
  :deep(.json-number) {
    color: #86efac;
  }
  
  :deep(.json-boolean) {
    color: #c4b5fd;
  }
  
  :deep(.json-null) {
    color: #94a3b8;
  }
  
  :deep(.log_item) {
    margin: 12px 0;
    padding: 8px 12px;
    border-radius: 6px;
    
    &.info {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  
  &:hover {
    background: #e2e8f0;
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
