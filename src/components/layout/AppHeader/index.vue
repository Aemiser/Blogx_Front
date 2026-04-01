<template>
  <header class="app-header" :class="{ scrolled: isScrolled }">
    <div class="app-header__left">
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
import BButton from '@/components/base/BButton/index.vue'

const router = useRouter()
const userStore = useUserStore()
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 0
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
