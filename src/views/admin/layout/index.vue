<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <router-link to="/admin" class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">管理后台</span>
        </router-link>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">概览</div>
          <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
            <span class="nav-icon">📊</span>
            <span class="nav-text">数据统计</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">内容管理</div>
          <router-link to="/admin/users" class="nav-item" :class="{ active: route.path === '/admin/users' }">
            <span class="nav-icon">👥</span>
            <span class="nav-text">用户管理</span>
          </router-link>
          <router-link to="/admin/articles" class="nav-item" :class="{ active: route.path === '/admin/articles' }">
            <span class="nav-icon">📝</span>
            <span class="nav-text">文章管理</span>
          </router-link>
          <router-link to="/admin/articles/examine" class="nav-item" :class="{ active: route.path === '/admin/articles/examine' }">
            <span class="nav-icon">✅</span>
            <span class="nav-text">文章审核</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">系统设置</div>
          <router-link to="/admin/site" class="nav-item" :class="{ active: route.path === '/admin/site' }">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">站点管理</span>
          </router-link>
          <router-link to="/admin/images" class="nav-item" :class="{ active: route.path === '/admin/images' }">
            <span class="nav-icon">🖼️</span>
            <span class="nav-text">图片管理</span>
          </router-link>
          <router-link to="/admin/upload" class="nav-item" :class="{ active: route.path === '/admin/upload' }">
            <span class="nav-icon">📤</span>
            <span class="nav-text">图片上传</span>
          </router-link>
          <router-link to="/admin/logs" class="nav-item" :class="{ active: route.path === '/admin/logs' }">
            <span class="nav-icon">📋</span>
            <span class="nav-text">日志查看</span>
          </router-link>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <router-link to="/" class="back-link">
          <span>←</span>
          <span>返回前台</span>
        </router-link>
      </div>
    </aside>
    
    <main class="admin-main">
      <header class="admin-header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <span class="admin-info">管理员: {{ userStore.userInfo?.nickname }}</span>
        </div>
      </header>
      
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { globalToken } from '@/utils'

const route = useRoute()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.token) {
    globalToken.set(userStore.token)
  }
})

const pageTitle = computed(() => {
  return route.meta.title as string || '管理后台'
})
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.admin-sidebar {
  width: 240px;
  background: #1e293b;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #334155;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  
  .logo-icon {
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 16px;
    font-weight: 600;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-section {
  padding: 0 12px;
  margin-bottom: 24px;
  
  &-title {
    font-size: 11px;
    text-transform: uppercase;
    color: #64748b;
    padding: 0 12px;
    margin-bottom: 8px;
    letter-spacing: 0.05em;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  
  &:hover {
    background: #334155;
    color: #e2e8f0;
  }
  
  &.active {
    background: #3b82f6;
    color: #fff;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .nav-text {
    font-size: 14px;
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #334155;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
  
  &:hover {
    color: #e2e8f0;
  }
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  z-index: 50;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-info {
  font-size: 13px;
  color: #64748b;
}

.admin-content {
  flex: 1;
  padding: 24px;
  margin-top: 60px;
}
</style>
