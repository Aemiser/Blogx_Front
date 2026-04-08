<template>
  <teleport to="body">
    <transition name="slide">
      <div v-if="visible" class="mobile-menu-overlay" @click.self="$emit('close')">
        <div class="mobile-menu">
          <div class="mobile-menu__header">
            <h3>菜单</h3>
            <button class="close-btn" @click="$emit('close')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="mobile-menu__user" v-if="userStore.isLoggedIn">
            <BAvatar :src="getAvatarUrl(userStore.userInfo?.avatar)" :size="48" />
            <div class="user-info">
              <div class="user-name">{{ userStore.userInfo?.nickname }}</div>
              <div class="user-desc">{{ userStore.userInfo?.abstract || '这个人很懒，什么都没写' }}</div>
            </div>
          </div>
          
          <nav class="mobile-menu__nav">
            <router-link to="/" class="menu-item" @click="$emit('close')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>首页</span>
            </router-link>
            
            <template v-if="userStore.isLoggedIn">
              <router-link to="/center" class="menu-item" @click="$emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>个人中心</span>
              </router-link>
              <router-link to="/center/articles" class="menu-item" @click="$emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <span>我的文章</span>
              </router-link>
              <router-link to="/center/collections" class="menu-item" @click="$emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>我的收藏</span>
              </router-link>
              <router-link to="/center/settings" class="menu-item" @click="$emit('close')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>设置</span>
              </router-link>
              <div class="menu-divider"></div>
              <button class="menu-item" @click="handleLogout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>退出登录</span>
              </button>
            </template>
            <template v-else>
              <button class="menu-item" @click="goLogin">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <span>登录</span>
              </button>
            </template>
          </nav>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAvatarUrl } from '@/utils/image'
import BAvatar from '@/components/base/BAvatar/index.vue'

defineProps<{
  visible: boolean
}>()

defineEmits<{
  close: []
}>()

const router = useRouter()
const userStore = useUserStore()

function goLogin() {
  router.push('/login')
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped lang="scss">
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-4;
    border-bottom: 1px solid var(--border-light);
    
    h3 {
      font-size: $text-lg;
      font-weight: $font-weight-semibold;
      color: var(--text-primary);
    }
    
    .close-btn {
      background: none;
      border: none;
      padding: $space-2;
      color: var(--text-secondary);
      cursor: pointer;
    }
  }
  
  &__user {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-4;
    background: var(--bg-secondary);
    
    .user-info {
      flex: 1;
      min-width: 0;
    }
    
    .user-name {
      font-size: $text-base;
      font-weight: $font-weight-medium;
      color: var(--text-primary);
    }
    
    .user-desc {
      font-size: $text-sm;
      color: var(--text-tertiary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  &__nav {
    flex: 1;
    overflow-y: auto;
    padding: $space-2 0;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  width: 100%;
  padding: $space-3 $space-4;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: $text-base;
  text-align: left;
  cursor: pointer;
  transition: all $duration-fast;
  text-decoration: none;
  
  &:hover,
  &.router-link-active {
    background: var(--bg-hover);
    color: var(--primary);
  }
  
  svg {
    flex-shrink: 0;
  }
}

.menu-divider {
  height: 1px;
  background: var(--border-light);
  margin: $space-2 $space-4;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  
  .mobile-menu {
    transition: transform 0.3s ease;
  }
}

.slide-enter-from,
.slide-leave-to {
  background: transparent;
  
  .mobile-menu {
    transform: translateX(-100%);
  }
}
</style>
