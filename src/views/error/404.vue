<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">页面不存在</p>
      <p class="error-description">您访问的页面可能已被删除或不存在</p>
      <BButton variant="primary" @click="goHome">返回首页</BButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BButton from '@/components/base/BButton/index.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped lang="scss">
.error-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: $font-weight-bold;
  color: $primary;
  line-height: 1;
  margin-bottom: $space-4;
}

.error-message {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.error-description {
  font-size: $text-base;
  color: $text-tertiary;
  margin-bottom: $space-6;
}
</style>
