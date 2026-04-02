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
        <div v-if="messages.length > 0" class="message-actions">
          <button class="delete-all-btn" @click="handleDeleteAll">
            全部删除
          </button>
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="ii"
          :class="{ 'ii--unread': !msg.is_read }"
          @click="handleRead(msg)"
        >
          <div class="ii__left">
            <BAvatar :src="msg.actionuser_avatar" :size="40" :alt="msg.actionuser_nickname" />
          </div>
          <div class="ii__right">
            <div class="ii__title">
              <span class="ii__uname">{{ msg.actionuser_nickname }}</span>
              <span class="ii__action">&nbsp;{{ getActionText(msg) }}</span>
            </div>
            <div class="ii__msg" v-if="msg.content">
              <span>{{ msg.content }}</span>
            </div>
            <div class="ii__reference" v-if="msg.title">
              {{ msg.title }}
            </div>
            <div class="ii__cover" v-if="msg.article_title">
              <div class="ii__cover-text">{{ msg.article_title }}</div>
            </div>
            <div class="ii__metadata">
              <span class="ii__time">{{ formatRelativeTime(msg.createdAt) }}</span>
              <button class="ii__btn" @click.stop="handleDelete(msg)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 3.25C5 2.33 5.75 1.58 6.67 1.58h2.66c.92 0 1.67.75 1.67 1.67v.58c0 .28-.22.5-.5.5s-.5-.22-.5-.5V3.25c0-.37-.3-.67-.67-.67H6.67c-.37 0-.67.3-.67.67v.58c0 .28-.22.5-.5.5s-.5-.22-.5-.5V3.25z"/>
                  <path d="M1.33 4.17c0-.28.22-.5.5-.5h12.33c.28 0 .5.22.5.5s-.22.5-.5.5H1.83c-.28 0-.5-.22-.5-.5z"/>
                  <path d="M3.17 5.75c.28 0 .5.22.5.5v5.35c0 .84.62 1.53 1.43 1.6.86.07 1.9.13 2.9.13s2.05-.06 2.9-.13c.81-.07 1.43-.76 1.43-1.6V6.25c0-.28.22-.5.5-.5s.5.22.5.5v5.35c0 1.33-.99 2.48-2.34 2.59-.87.07-1.94.13-2.98.13s-2.11-.06-2.98-.13C4.16 14.38 3.17 13.23 3.17 11.9V6.25c0-.28.22-.5.5-.5z"/>
                  <path d="M6.33 7c.28 0 .5.22.5.5v2.33c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7.5c0-.28.22-.5.5-.5z"/>
                  <path d="M9.67 7c.28 0 .5.22.5.5v2.33c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7.5c0-.28.22-.5.5-.5z"/>
                </svg>
                <span>删除该通知</span>
              </button>
              <span v-if="!msg.is_read" class="ii__dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { SiteMessage } from '@/types'
import { getSiteMsgList, readSiteMsg, deleteSiteMsg, getUnreadCount } from '@/api/modules/message'
import { formatRelativeTime } from '@/utils'
import BAvatar from '@/components/base/BAvatar/index.vue'

const activeTab = ref(1)
const messages = ref<SiteMessage[]>([])
const loading = ref(false)

function getActionText(msg: SiteMessage) {
  if (msg.Type === 1) return '评论了我的文章'
  if (msg.Type === 2) return '赞了我的文章'
  return '系统通知'
}

const tabs = ref([
  { label: '评论', value: 1, count: 0 },
  { label: '点赞', value: 2, count: 0 },
  { label: '系统', value: 3, count: 0 }
])

async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    tabs.value[0].count = res.data.commentMsgCount
    tabs.value[1].count = res.data.diggMsgCount
    tabs.value[2].count = res.data.systemMsgCount
  } catch (error) {
    console.error('Failed to fetch unread count:', error)
  }
}

async function fetchMessages() {
  loading.value = true
  try {
    const res = await getSiteMsgList(activeTab.value as 1 | 2 | 3)
    messages.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

async function handleRead(msg: SiteMessage) {
  if (msg.is_read) return
  try {
    await readSiteMsg(msg.id, activeTab.value)
    msg.is_read = true
    fetchUnreadCount()
  } catch (error) {
    console.error('Failed to read message:', error)
  }
}

async function handleDelete(msg: SiteMessage) {
  try {
    await deleteSiteMsg(msg.id, activeTab.value)
    messages.value = messages.value.filter(m => m.id !== msg.id)
    fetchUnreadCount()
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

async function handleDeleteAll() {
  try {
    await deleteSiteMsg(0, activeTab.value)
    messages.value = []
    fetchUnreadCount()
  } catch (error) {
    console.error('Failed to delete all messages:', error)
  }
}

watch(activeTab, () => {
  fetchMessages()
})

onMounted(() => {
  fetchUnreadCount()
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
  overflow: hidden;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  padding: $space-3 $space-5;
  border-bottom: 1px solid $border-light;
}

.delete-all-btn {
  padding: $space-1 $space-3;
  font-size: $text-xs;
  color: $error;
  background: transparent;
  border: 1px solid $error;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $duration-fast;
  
  &:hover {
    background: $error;
    color: white;
  }
}

.ii {
  display: flex;
  gap: 0;
  padding: 16px 20px;
  border-bottom: 1px solid $border-light;
  cursor: pointer;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba($primary, 0.02);
  }

  &--unread {
    background: rgba($primary, 0.04);

    &:hover {
      background: rgba($primary, 0.06);
    }
  }

  &__left {
    flex-shrink: 0;
    margin-right: 12px;
  }

  &__right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0;
    line-height: 1.4;
    margin-bottom: 4px;
  }

  &__uname {
    font-size: 13px;
    font-weight: 500;
    color: $primary;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &__action {
    font-size: 12px;
    color: $text-tertiary;
  }

  &__msg {
    font-size: 14px;
    line-height: 1.6;
    color: $text-secondary;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__reference {
    margin-bottom: 8px;
    padding: 8px 12px;
    background: $bg-secondary;
    border-radius: 6px;
    font-size: 12px;
    color: $text-tertiary;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__cover {
    margin-bottom: 8px;
    padding: 10px 14px;
    background: $bg-secondary;
    border-radius: 8px;

    &-text {
      font-size: 13px;
      color: $text-secondary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__metadata {
    display: flex;
    align-items: center;
    gap: 16px;
    line-height: 1;
  }

  &__time {
    font-size: 12px;
    color: $text-tertiary;
    flex-shrink: 0;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border: none;
    background: none;
    color: $text-tertiary;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
    opacity: 0;

    svg {
      flex-shrink: 0;
    }

    &:hover {
      color: $text-secondary;
    }
  }

  &:hover &__btn {
    opacity: 1;
  }

  &__dot {
    width: 6px;
    height: 6px;
    background: $primary;
    border-radius: 50%;
    margin-left: auto;
    flex-shrink: 0;
  }
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
