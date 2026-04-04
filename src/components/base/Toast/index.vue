<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast-wrapper" :class="type">
        <div class="toast-content">
          <span class="toast-icon">{{ iconMap[type] }}</span>
          <span class="toast-message">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'warning' | 'info'>('info')

const iconMap = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

let timer: ReturnType<typeof setTimeout> | null = null

function show(msg: string, toastType: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) {
  if (timer) clearTimeout(timer)
  
  message.value = msg
  type.value = toastType
  visible.value = true
  
  timer = setTimeout(() => {
    visible.value = false
  }, duration)
}

defineExpose({ show })
</script>

<style scoped lang="scss">
.toast-wrapper {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  
  &.success {
    background: #10b981;
    color: #fff;
  }
  
  &.error {
    background: #ef4444;
    color: #fff;
  }
  
  &.warning {
    background: #f59e0b;
    color: #fff;
  }
  
  &.info {
    background: #3b82f6;
    color: #fff;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .toast-icon {
    font-size: 16px;
  }
  
  .toast-message {
    font-weight: 500;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>