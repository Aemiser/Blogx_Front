<template>
  <div class="b-back-top" v-show="visible" @click="scrollToTop">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const threshold = 300

function handleScroll() {
  visible.value = window.scrollY > threshold
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.b-back-top {
  position: fixed;
  right: 24px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $text-secondary;
  box-shadow: $shadow-md;
  transition: all $duration-fast $ease-default;
  z-index: 50;
  
  &:hover {
    color: $primary;
    border-color: $primary;
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

[data-theme="dark"] .b-back-top {
  background: $dark-bg-card;
  border-color: $dark-border;
  color: $dark-text-secondary;
  
  &:hover {
    border-color: $primary;
    color: $primary;
  }
}
</style>
