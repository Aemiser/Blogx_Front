<template>
  <div class="app-layout" :data-theme="themeStore.isDark ? 'dark' : 'light'">
    <AppHeader v-if="!route.meta.hideHeader" />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!route.meta.hideFooter" />
    <BBackTop />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import AppHeader from '@/components/layout/AppHeader/index.vue'
import AppFooter from '@/components/layout/AppFooter/index.vue'
import BBackTop from '@/components/base/BBackTop/index.vue'

const route = useRoute()
const themeStore = useThemeStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
