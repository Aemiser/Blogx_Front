<template>
  <button class="create-btn" @click="handleCreate" :title="isMobile ? '写文章' : undefined">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    <span class="create-btn__text">写文章</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth <= 768
})

function handleCreate() {
  router.push('/editor')
}
</script>

<style scoped lang="scss">
.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-1;
  height: 32px;
  padding: 0 $space-3;
  background: $accent;
  color: white;
  border-radius: $radius-md;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  transition: all $duration-fast;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: $accent-dark;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &__text {
    @media (max-width: $breakpoint-md) {
      display: none;
    }
  }
  
  @media (max-width: $breakpoint-md) {
    width: 32px;
    padding: 0;
  }
}
</style>
