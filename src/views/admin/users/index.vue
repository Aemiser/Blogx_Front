<template>
  <div class="admin-users">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">用户管理</h1>
        <span class="user-count">共 {{ total }} 用户</span>
      </div>
      <div class="header-right">
        <input 
          v-model="searchKeyword" 
          type="text" 
          class="search-input" 
          placeholder="搜索用户..."
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
              <th style="width: 60px">头像</th>
              <th style="width: 100px">昵称</th>
              <th style="width: 90px">用户名</th>
              <th style="width: 60px">文章数</th>
              <th style="width: 70px">角色</th>
              <th style="width: 110px">IP</th>
              <th style="width: 100px">地址</th>
              <th style="width: 140px">注册时间</th>
              <th style="width: 140px">最后登录</th>
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
              <td>{{ user.username || '-' }}</td>
              <td>{{ user.articleCount }}</td>
              <td>
                <span class="tag" :class="getRoleClass(user.role)">
                  {{ getRoleName(user.role) }}
                </span>
              </td>
              <td>{{ user.ip || '-' }}</td>
              <td>{{ user.addr || '-' }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatDate(user.lastLoginDate) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn" @click="viewUser(user)">查看</button>
                  <button class="action-btn" @click="editUser(user)">编辑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="users.length === 0" class="empty-state">
        <p>暂无用户数据</p>
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
    
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑用户</h3>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>昵称</label>
            <input v-model="editForm.nickname" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="editForm.role" class="form-select">
              <option :value="1">普通用户</option>
              <option :value="2">管理员</option>
              <option :value="3">已封禁</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="saveUser">保存</button>
        </div>
      </div>
    </div>
    
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content modal-detail" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-avatar" @click="selectedUserDetail?.avatar && previewAvatar(selectedUserDetail.avatar)">
            <img v-if="selectedUserDetail?.avatar" :src="selectedUserDetail.avatar" alt="avatar" />
            <span v-else class="avatar-placeholder">{{ selectedUserDetail?.nickname?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="detail-info">
            <div class="detail-item">
              <span class="detail-label">昵称</span>
              <span class="detail-value">{{ selectedUserDetail?.nickname }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用户名</span>
              <span class="detail-value">{{ selectedUserDetail?.username || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">角色</span>
              <span class="tag" :class="getRoleClass(selectedUserDetail?.role)">
                {{ getRoleName(selectedUserDetail?.role) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">文章数</span>
              <span class="detail-value">{{ selectedUserDetail?.articleCount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">IP</span>
              <span class="detail-value">{{ selectedUserDetail?.ip || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">地址</span>
              <span class="detail-value">{{ selectedUserDetail?.addr || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">注册时间</span>
              <span class="detail-value">{{ formatDate(selectedUserDetail?.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最后登录</span>
              <span class="detail-value">{{ formatDate(selectedUserDetail?.lastLoginDate) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailModal = false">关闭</button>
        </div>
      </div>
    </div>
    
    <div v-if="showAvatarPreview" class="modal-overlay" @click="showAvatarPreview = false">
      <div class="avatar-preview-modal" @click.stop>
        <img :src="previewAvatarUrl" alt="avatar" />
        <button class="close-preview" @click="showAvatarPreview = false">×</button>
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

.user-count {
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
    padding: 10px 8px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
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

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
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
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
  }
}

.nickname-cell {
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
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
  
  &--primary {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
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
  padding: 4px 8px;
  font-size: 13px;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
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
  width: 480px;
  max-width: 90vw;
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
}

.form-group {
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 8px;
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
  }
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

.modal-detail {
  width: 400px;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
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

.avatar-preview-modal {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  
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

.detail-avatar {
  cursor: pointer;
}
</style>
