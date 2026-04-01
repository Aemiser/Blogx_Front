<template>
  <div class="message-notification" @click="goMessages">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    <span v-if="unreadCount > 0" class="message-notification__badge">
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUnreadCount } from '@/api/modules/message'

const router = useRouter()
const unreadCount = ref(0)

async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    const { commentMsgCount, diggMsgCount, systemMsgCount, privateMsgCount } = res.data
    unreadCount.value = commentMsgCount + diggMsgCount + systemMsgCount + privateMsgCount
  } catch (error) {
    console.error('Failed to fetch unread count:', error)
  }
}

function goMessages() {
  router.push('/messages')
}

onMounted(() => {
  fetchUnreadCount()
})
</script>

<style scoped lang="scss">
.message-notification {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  color: $text-secondary;
  cursor: pointer;
  transition: all $duration-fast;
  
  &:hover {
    background: $bg-hover;
    color: $text-primary;
  }
  
  &__badge {
    position: absolute;
    top: 2px;
    right: 2px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    background: $error;
    color: white;
    font-size: 10px;
    font-weight: $font-weight-medium;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
