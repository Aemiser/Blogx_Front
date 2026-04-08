<template>
  <header class="app-header" :class="{ scrolled: isScrolled }">
    <div class="app-header__left">
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <Logo />
      <NavMenu />
    </div>
    <div class="app-header__center">
      <SearchBar />
    </div>
    <div class="app-header__right">
      <CreateButton v-if="userStore.isLoggedIn" />
      <MessageNotification v-if="userStore.isLoggedIn" />
      <UserDropdown v-if="userStore.isLoggedIn" />
      <BButton v-else variant="primary" size="sm" @click="goLogin">
        登录
      </BButton>
    </div>
  </header>
  
  <!-- 移动端菜单抽屉 -->
  <MobileMenu :visible="showMobileMenu" @close="showMobileMenu = false" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Logo from './components/Logo.vue'
import NavMenu from './components/NavMenu.vue'
import SearchBar from './components/SearchBar.vue'
import CreateButton from './components/CreateButton.vue'
import MessageNotification from './components/MessageNotification.vue'
import UserDropdown from './components/UserDropdown.vue'
import MobileMenu from './components/MobileMenu.vue'
import BButton from '@/components/base/BButton/index.vue'

const router = useRouter()
const userStore = useUserStore()
const isScrolled = ref(false)
const showMobileMenu = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 0
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function goLogin() {
  router.push('/login')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: $space-2;
  color: var(--text-primary);
  cursor: pointer;
  
  @media (max-width: $breakpoint-md) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
