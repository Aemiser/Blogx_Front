<template>
  <div class="message-page">
    <div class="app-container">
      <h1 class="page-title">消息中心</h1>
      <div class="message-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="badge">{{ tab.count }}</span>
        </button>
      </div>
      
      <div class="message-list">
        <div v-if="messages.length === 0" class="empty">
          <p>暂无消息</p>
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: !msg.is_read }"
        >
          <BAvatar :src="msg.actionuser_avatar" :size="40" :alt="msg.actionuser_nickname" />
          <div class="message-item__content">
            <div class="message-item__header">
              <span class="message-item__name">{{ msg.actionuser_nickname }}</span>
              <span class="message-item__time">{{ formatRelativeTime(msg.createdAt) }}</span>
            </div>
            <p class="message-item__text">{{ msg.content }}</p>
            <div class="message-item__article" v-if="msg.article_title">
              {{ msg.article_title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SiteMessage } from '@/types'
import { getSiteMsgList } from '@/api/modules/message'
import { formatRelativeTime } from '@/utils'
import BAvatar from '@/components/base/BAvatar/index.vue'

const activeTab = ref(1)
const messages = ref<SiteMessage[]>([])

const tabs = [
  { label: '评论', value: 1, count: 0 },
  { label: '点赞', value: 2, count: 0 },
  { label: '系统', value: 3, count: 0 }
]

async function fetchMessages() {
  try {
    const res = await getSiteMsgList(activeTab.value as 1 | 2 | 3)
    messages.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<style scoped lang="scss">
.message-page {
  padding: $space-6 0;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.message-tabs {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-6;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $text-secondary;
  background: $bg-card;
  transition: all $duration-fast;
  
  &:hover {
    color: $text-primary;
  }
  
  &.active {
    background: $primary;
    color: white;
  }
  
  .badge {
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: $error;
    color: white;
    font-size: 11px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.message-list {
  background: $bg-card;
  border-radius: $radius-lg;
}

.message-item {
  display: flex;
  gap: $space-3;
  padding: $space-4 $space-5;
  border-bottom: 1px solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.unread {
    background: rgba($primary, 0.05);
  }
  
  &__content {
    flex: 1;
  }
  
  &__header {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-bottom: $space-2;
  }
  
  &__name {
    font-weight: $font-weight-medium;
  }
  
  &__time {
    font-size: $text-xs;
    color: $text-tertiary;
  }
  
  &__text {
    font-size: $text-sm;
    color: $text-secondary;
  }
  
  &__article {
    margin-top: $space-2;
    padding: $space-2 $space-3;
    background: $bg-secondary;
    border-radius: $radius-md;
    font-size: $text-xs;
    color: $text-tertiary;
  }
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
