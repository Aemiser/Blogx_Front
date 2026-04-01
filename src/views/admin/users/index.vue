<template>
  <div class="admin-users">
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">用户管理</h1>
      </div>
      
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>昵称</th>
                <th>用户名</th>
                <th>文章数</th>
                <th>角色</th>
                <th>最后登录</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.nickname }}</td>
                <td>{{ user.username || '-' }}</td>
                <td>{{ user.articleCount }}</td>
                <td>
                  <span class="tag" :class="getRoleClass(user.role)">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td>{{ formatRelativeTime(user.lastLoginDate) }}</td>
                <td>
                  <button class="action-link" @click="editUser(user)">编辑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { UserListItem } from '@/types'
import { getUserList } from '@/api/modules/user'
import { formatRelativeTime } from '@/utils'

const users = ref<UserListItem[]>([])

async function fetchUsers() {
  try {
    const res = await getUserList()
    users.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

function getRoleName(role: number) {
  const map: Record<number, string> = {
    1: '普通用户',
    2: '管理员',
    3: '已封禁'
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

function editUser(user: UserListItem) {
  alert(`编辑用户: ${user.nickname}`)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.admin-users {
  padding: $space-6 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-6;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: $space-3 $space-4;
    text-align: left;
    border-bottom: 1px solid $border-light;
  }
  
  th {
    font-weight: $font-weight-medium;
    color: $text-secondary;
    font-size: $text-sm;
  }
  
  td {
    font-size: $text-sm;
  }
  
  tbody tr:hover {
    background: $bg-hover;
  }
}

.action-link {
  color: $primary;
  font-size: $text-sm;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
