<template>
  <div class="admin-users">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">用户管理</h1>
        <span class="user-count">共 {{ total }} 用户</span>
      </div>
      <div class="header-right">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchKeyword" 
            type="text" 
            class="search-input" 
            placeholder="搜索用户..."
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </div>
    
    <div class="content-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">ID</th>
              <th style="width: 60px">头像</th>
              <th style="width: 120px">昵称</th>
              <th style="width: 100px">用户名</th>
              <th style="width: 70px">文章数</th>
              <th style="width: 80px">角色</th>
              <th style="width: 120px">IP</th>
              <th style="width: 120px">地址</th>
              <th style="width: 160px">注册时间</th>
              <th style="width: 160px">最后登录</th>
              <th style="width: 100px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <div class="user-avatar" @click="user.avatar && previewAvatar(user.avatar)">
                  <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
                  <span v-else class="avatar-placeholder">{{ user.nickname?.[0]?.toUpperCase() }}</span>
                </div>
              </td>
              <td class="nickname-cell" @click="viewUserDetail(user)">{{ user.nickname }}</td>
              <td class="text-muted">{{ user.username || '-' }}</td>
              <td>{{ user.articleCount }}</td>
              <td>
                <span class="tag" :class="getRoleClass(user.role)">
                  {{ getRoleName(user.role) }}
                </span>
              </td>
              <td class="text-muted">{{ user.ip || '-' }}</td>
              <td class="text-muted">{{ user.addr || '-' }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatDate(user.lastLoginDate) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="viewUser(user)">查看</button>
                  <button class="action-btn" @click="editUser(user)">编辑</button>
                  <button class="action-btn danger" @click="deleteUser(user.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="users.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        <p>暂无用户数据</p>
      </div>
      
      <div v-if="total > limit" class="pagination">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { UserListItem } from '@/types'
import { getUserList, updateUserRole } from '@/api/modules/user'

const users = ref<UserListItem[]>([])
const searchKeyword = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showAvatarPreview = ref(false)
const previewAvatarUrl = ref('')
const selectedUserDetail = ref<UserListItem | null>(null)
const editingUser = ref<UserListItem | null>(null)

const editForm = ref({
  nickname: '',
  role: 1
})

const totalPages = computed(() => Math.ceil(total.value / limit.value))

async function fetchUsers() {
  try {
    const res = await getUserList({
      page: page.value,
      limit: limit.value,
      key: searchKeyword.value || undefined
    })
    users.value = res.data.list
    total.value = res.data.count
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

function getRoleName(role: number) {
  const map: Record<number, string> = {
    1: '普通用户',
    2: '管理员',
    3: '游客'
  }
  return map[role] || '未知'
}

function getRoleClass(role: number) {
  const map: Record<number, string> = {
    1: 'tag--default',
    2: 'tag--primary',
    3: 'tag--error'
  }
  return map[role] || ''
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function handleSearch() {
  page.value = 1
  fetchUsers()
}

function goToPage(p: number) {
  page.value = p
  fetchUsers()
}

function viewUser(user: UserListItem) {
  window.open(`/user/${user.id}`, '_blank')
}

function viewUserDetail(user: UserListItem) {
  selectedUserDetail.value = user
  showDetailModal.value = true
}

function previewAvatar(url: string) {
  previewAvatarUrl.value = url
  showAvatarPreview.value = true
}

function editUser(user: UserListItem) {
  editingUser.value = user
  editForm.value = {
    nickname: user.nickname,
    role: user.role
  }
  showEditModal.value = true
}

async function saveUser() {
  if (!editingUser.value) return
  
  try {
    await updateUserRole(editingUser.value.id, editForm.value.role)
    const index = users.value.findIndex(u => u.id === editingUser.value?.id)
    if (index !== -1) {
      users.value[index].role = editForm.value.role
      users.value[index].nickname = editForm.value.nickname
    }
    showEditModal.value = false
    alert('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.admin-users {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.user-count {
  font-size: 14px;
  color: #64748b;
}

.header-right {
  display: flex;
  gap: 12px;
}

.search-box {
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
}

.search-input {
  padding: 10px 14px 10px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  width: 260px;
  background: #fff;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
}

.content-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 14px 12px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  }
  
  th {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #f8fafc;
  }
  
  td {
    font-size: 14px;
    color: #1e293b;
  }
  
  tbody tr {
    transition: background 0.2s;
    
    &:hover {
      background: #f8fafc;
    }
  }
}

.text-muted {
  color: #64748b;
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: #94a3b8;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 15px;
  }
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
  padding: 8px 14px;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f8fafc;
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
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  
  h3 {
    font-size: 18px;
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
    color: #1e293b;
  }
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
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
  
  &-danger {
    background: #ef4444;
    color: #fff;
    
    &:hover {
      background: #dc2626;
    }
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
  
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
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
  }
}

.nickname-cell {
  font-weight: 500;
  color: #3b82f6;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  
  &--default {
    background: #f1f5f9;
    color: #64748b;
  }
  
  &--primary {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  
  &--error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
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
  padding: 6px 12px;
  font-size: 13px;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  &.danger {
    color: #ef4444;
    
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

.form-group {
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  margin: 0 auto 20px;
  
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
    font-weight: 600;
    color: #64748b;
  }
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
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

.avatar-preview-modal {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  
  img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 12px;
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
</style>
