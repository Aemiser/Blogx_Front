<template>
  <div class="user-dropdown" ref="dropdownRef">
    <div class="user-dropdown__trigger" @click="toggleDropdown">
      <BAvatar :src="userStore.userInfo?.avatar" :size="32" :alt="userStore.userInfo?.nickname || '用户'" />
    </div>
    <transition name="dropdown">
      <div v-if="isOpen" class="user-dropdown__menu">
        <div class="user-dropdown__header">
          <BAvatar :src="userStore.userInfo?.avatar" :size="48" :alt="userStore.userInfo?.nickname || '用户'" />
          <div class="user-dropdown__info">
            <div class="user-dropdown__name">{{ userStore.userInfo?.nickname }}</div>
            <div class="user-dropdown__id">ID: {{ userStore.userInfo?.id }}</div>
          </div>
        </div>
        <div class="user-dropdown__divider"></div>
        <router-link to="/profile" class="user-dropdown__item" @click="closeDropdown">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          个人中心
        </router-link>
        <router-link v-if="userStore.isAdmin" to="/admin" class="user-dropdown__item" @click="closeDropdown">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          管理后台
        </router-link>
        <router-link to="/settings" class="user-dropdown__item" @click="closeDropdown">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          设置
        </router-link>
        <div class="user-dropdown__divider"></div>
        <button class="user-dropdown__item user-dropdown__item--danger" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          退出登录
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BAvatar from '@/components/base/BAvatar/index.vue'

const router = useRouter()
const userStore = useUserStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function handleLogout() {
  userStore.logout()
  closeDropdown()
  router.push('/login')
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.user-dropdown {
  position: relative;
  
  &__trigger {
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    transition: box-shadow $duration-fast;
    
    &:hover {
      box-shadow: 0 0 0 2px rgba($primary, 0.3);
    }
  }
  
  &__menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    width: 240px;
    background: $bg-card;
    border: 1px solid $border-light;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    padding: $space-2 0;
    z-index: 200;
  }
  
  &__header {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 $space-4;
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__name {
    font-weight: $font-weight-medium;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__id {
    font-size: $text-xs;
    color: $text-tertiary;
  }
  
  &__divider {
    height: 1px;
    background: $border-light;
    margin: $space-2 0;
  }
  
  &__item {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 $space-4;
    color: $text-secondary;
    font-size: $text-sm;
    transition: all $duration-fast;
    cursor: pointer;
    
    &:hover {
      background: $bg-hover;
      color: $text-primary;
    }
    
    &--danger {
      color: $error;
      
      &:hover {
        background: rgba($error, 0.1);
        color: $error;
      }
    }
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all $duration-fast $ease-default;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

[data-theme="dark"] .user-dropdown {
  &__menu {
    background: $dark-bg-card;
    border-color: $dark-border;
  }
  
  &__divider {
    background: $dark-border;
  }
}
</style>
