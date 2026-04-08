<template>
  <div class="admin-layout">
    <!-- 移动端遮罩 -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="showMobileMenu = false"></div>
    
    <aside class="admin-sidebar" :class="{ 'mobile-open': showMobileMenu }">
      <div class="sidebar-header">
        <router-link to="/admin" class="logo" @click="showMobileMenu = false">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="logo-text">管理后台</span>
        </router-link>
        <button class="mobile-close-btn" @click="showMobileMenu = false">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">概览</div>
          <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span class="nav-text">数据统计</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">内容管理</div>
          <router-link to="/admin/users" class="nav-item" :class="{ active: route.path === '/admin/users' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <span class="nav-text">用户管理</span>
          </router-link>
          <router-link to="/admin/articles" class="nav-item" :class="{ active: route.path === '/admin/articles' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            <span class="nav-text">文章管理</span>
          </router-link>
          <router-link to="/admin/articles/examine" class="nav-item" :class="{ active: route.path === '/admin/articles/examine' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </span>
            <span class="nav-text">文章审核</span>
          </router-link>
          <router-link to="/admin/banner" class="nav-item" :class="{ active: route.path === '/admin/banner' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </span>
            <span class="nav-text">Banner 管理</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <div class="nav-section-title">系统设置</div>
          <router-link to="/admin/site" class="nav-item" :class="{ active: route.path === '/admin/site' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            <span class="nav-text">站点管理</span>
          </router-link>
          <router-link to="/admin/images" class="nav-item" :class="{ active: route.path === '/admin/images' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </span>
            <span class="nav-text">图片管理</span>
          </router-link>
          <router-link to="/admin/upload" class="nav-item" :class="{ active: route.path === '/admin/upload' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </span>
            <span class="nav-text">图片上传</span>
          </router-link>
          <router-link to="/admin/logs" class="nav-item" :class="{ active: route.path === '/admin/logs' }" @click="showMobileMenu = false">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            <span class="nav-text">日志查看</span>
          </router-link>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <router-link to="/" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>返回前台</span>
        </router-link>
      </div>
    </aside>
    
    <main class="admin-main">
      <header class="admin-header">
        <button class="mobile-menu-btn" @click="showMobileMenu = true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <div class="admin-avatar">
            <img v-if="userStore.userInfo?.avatar" :src="getAvatarUrl(userStore.userInfo.avatar)" alt="avatar" />
            <span v-else>{{ userStore.userInfo?.nickname?.[0]?.toUpperCase() }}</span>
          </div>
          <span class="admin-name">{{ userStore.userInfo?.nickname }}</span>
        </div>
      </header>
      
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { globalToken } from '@/utils'
import { getAvatarUrl } from '@/utils/image'

const route = useRoute()
const userStore = useUserStore()
const showMobileMenu = ref(false)

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
  background: #f1f5f9;
}

.admin-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
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
  padding: 20px 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 600;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 28px;
  
  &-title {
    font-size: 11px;
    text-transform: uppercase;
    color: #64748b;
    padding: 0 12px;
    margin-bottom: 10px;
    letter-spacing: 0.08em;
    font-weight: 500;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e2e8f0;
  }
  
  &.active {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  .nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-text {
    font-size: 14px;
    font-weight: 500;
  }
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.back-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e2e8f0;
  }
}

.admin-main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  span {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
}

.admin-name {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.admin-content {
  flex: 1;
  padding: 24px 28px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 200;
    
    &.mobile-open {
      transform: translateX(0);
    }
  }
  
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .logo {
      flex: 1;
    }
    
    .mobile-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: #e2e8f0;
      cursor: pointer;
    }
  }
  
  .admin-main {
    margin-left: 0;
  }
  
  .admin-header {
    height: 56px;
    padding: 0 16px;
    
    .mobile-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      color: #475569;
      cursor: pointer;
      
      &:hover {
        background: #f1f5f9;
        border-radius: 8px;
      }
    }
    
    .header-title {
      font-size: 16px;
      margin-left: 12px;
    }
    
    .admin-name {
      display: none;
    }
  }
  
  .admin-content {
    padding: 16px;
  }
}

@media (min-width: 769px) {
  .mobile-close-btn,
  .mobile-menu-btn,
  .mobile-overlay {
    display: none !important;
  }
}
</style>
