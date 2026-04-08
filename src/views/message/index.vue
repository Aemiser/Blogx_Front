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
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="badge">{{ tab.count }}</span>
        </button>
      </div>
      
      <div class="message-list">
        <PrivateMessage 
          v-if="activeTab === 4" 
          :target-user-id="targetUserId"
          :target-nickname="targetNickname"
          :target-avatar="targetAvatar"
        />
        <template v-else-if="activeTab === 5">
          <div v-if="globalMessages.length === 0" class="empty">
            <p>暂无全局消息</p>
          </div>
          <div v-else class="global-list">
            <div
              v-for="msg in globalMessages"
              :key="msg.id"
              class="gm"
              :class="{ 'gm--unread': !msg.isRead }"
              @click="handleGlobalRead(msg)"
            >
              <div class="gm__icon" v-if="msg.icon">
                <img :src="getFullImageUrl(msg.icon)" :alt="msg.title" />
              </div>
              <div class="gm__content">
                <div class="gm__title">{{ msg.title }}</div>
                <div class="gm__text">{{ msg.content }}</div>
                <div class="gm__time">{{ formatRelativeTime(msg.createdAt) }}</div>
              </div>
              <span v-if="!msg.isRead" class="gm__dot"></span>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-if="messages.length === 0" class="empty">
            <p>暂无消息</p>
          </div>
          <div 
            v-else 
            class="message-list-content" 
            ref="listRef"
            @scroll="handleScroll"
          >
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
                <BAvatar :src="getAvatarUrl(msg.actionuser_avatar)" :size="40" :alt="msg.actionuser_nickname" />
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
            <div v-if="loadingMore" class="loading-more">
              <span>加载中...</span>
            </div>
            <div v-if="!hasMore && messages.length > 0" class="no-more">
              没有更多消息了
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { SiteMessage, GlobalNotification } from '@/types'
import { getSiteMsgList, readSiteMsg, deleteSiteMsg, getUnreadCount, getGlobalNotificationList, userGlobalNotification } from '@/api/modules/message'
import { formatRelativeTime } from '@/utils'
import { getFullImageUrl, getAvatarUrl } from '@/utils/image'
import BAvatar from '@/components/base/BAvatar/index.vue'
import PrivateMessage from './components/PrivateMessage.vue'

const route = useRoute()
const activeTab = ref(1)
const messages = ref<SiteMessage[]>([])
const globalMessages = ref<GlobalNotification[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const total = ref(0)
const hasMore = computed(() => messages.value.length < total.value)
const listRef = ref<HTMLElement | null>(null)

const targetUserId = computed(() => {
  const id = route.query.targetUserId
  return id ? Number(id) : undefined
})

const targetNickname = computed(() => {
  return route.query.nickname ? decodeURIComponent(route.query.nickname as string) : undefined
})

const targetAvatar = computed(() => {
  return route.query.avatar ? decodeURIComponent(route.query.avatar as string) : undefined
})

function switchTab(value: number) {
  activeTab.value = value
  if (value === 4) {
    // 私信
    fetchUnreadCount()
  } else if (value === 5) {
    // 全局消息
    fetchGlobalMessages()
    fetchUnreadCount()
  } else {
    fetchMessages()
    fetchUnreadCount()
  }
}

function getActionText(msg: SiteMessage) {
  const { Type, comment_id } = msg
  if (Type === 1) {
    return '评论了我的文章'
  }
  if (Type === 2) {
    return '回复了我的评论'
  }
  if (Type === 3) {
    return '赞了我的文章'
  }
  if (Type === 5) {
    return '赞了我的评论'
  }
  if (Type === 7) {
    return '收藏了我的文章'
  }
  if (Type === 9) {
    return '系统通知'
  }
  return '通知'
}

const tabs = ref([
  { label: '回复与评论', value: 1, count: 0 },
  { label: '点赞与收藏', value: 2, count: 0 },
  { label: '系统', value: 3, count: 0 },
  { label: '全局', value: 5, count: 0 },
  { label: '私信', value: 4, count: 0 }
])

// 监听路由参数，自动切换到私信标签并打开目标会话
watch(() => route.query, (query) => {
  if (query.tab === 'private' && query.targetUserId) {
    activeTab.value = 4
  }
}, { immediate: true })

async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    tabs.value[0].count = res.data.commentMsgCount
    tabs.value[1].count = res.data.diggMsgCount
    tabs.value[2].count = res.data.systemMsgCount
    tabs.value[3].count = res.data.globalMsgCount
  } catch (error) {
    console.error('Failed to fetch unread count:', error)
  }
}

async function fetchGlobalMessages() {
  loading.value = true
  try {
    const res = await getGlobalNotificationList(1)
    globalMessages.value = res.data?.list || []
    await fetchUnreadCount()
  } catch (error) {
    console.error('Failed to fetch global messages:', error)
  } finally {
    loading.value = false
  }
}

async function handleGlobalRead(msg: GlobalNotification) {
  if (msg.isRead) return
  try {
    await userGlobalNotification({ id: msg.id, type: 1 })
    msg.isRead = true
    await fetchUnreadCount()
  } catch (error) {
    console.error('Failed to read global message:', error)
  }
}

async function fetchMessages(isLoadMore = false) {
  if (activeTab.value === 4) return
  
  if (isLoadMore) {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    page.value++
  } else {
    loading.value = true
    page.value = 1
  }
  
  try {
    const res = await getSiteMsgList(activeTab.value as 1 | 2 | 3, page.value)
    total.value = res.data?.count || 0
    const list = res.data?.list || []
    
    if (isLoadMore) {
      messages.value = [...messages.value, ...list]
    } else {
      messages.value = list
    }
    
    await fetchUnreadCount()
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
    fetchMessages(true)
  }
}

async function handleRead(msg: SiteMessage) {
  if (msg.is_read) return
  try {
    await readSiteMsg(msg.id, activeTab.value)
    msg.is_read = true
    await fetchUnreadCount()
  } catch (error) {
    console.error('Failed to read message:', error)
  }
}

async function handleDelete(msg: SiteMessage) {
  try {
    await deleteSiteMsg(msg.id, activeTab.value)
    messages.value = messages.value.filter(m => m.id !== msg.id)
    await fetchUnreadCount()
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

async function handleDeleteAll() {
  try {
    await deleteSiteMsg(0, activeTab.value)
    messages.value = []
    await fetchUnreadCount()
  } catch (error) {
    console.error('Failed to delete all messages:', error)
  }
}

watch(activeTab, (newVal) => {
  if (newVal !== 4) {
    fetchMessages()
  }
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

.loading-more,
.no-more {
  text-align: center;
  padding: $space-4;
  font-size: 12px;
  color: $text-tertiary;
}

.message-list-content {
  max-height: 600px;
  overflow-y: auto;
}

.global-list {
  display: flex;
  flex-direction: column;
}

.gm {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid $border-light;
  cursor: pointer;
  position: relative;
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

  &__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background: $bg-secondary;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 4px;
  }

  &__text {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__time {
    font-size: 12px;
    color: $text-tertiary;
  }

  &__dot {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: $primary;
    border-radius: 50%;
  }
}

@media (max-width: $breakpoint-md) {
  .message-page {
    padding: $space-4 0;
  }
  
  .page-title {
    font-size: $text-xl;
    margin-bottom: $space-4;
  }
  
  .message-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: $space-2;
    margin-bottom: $space-4;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .tab-btn {
    padding: $space-2 $space-3;
    font-size: $text-sm;
    white-space: nowrap;
    
    .badge {
      min-width: 16px;
      height: 16px;
      font-size: 10px;
    }
  }
  
  .message-list-content {
    max-height: none;
  }
  
  .ii {
    padding: $space-3 $space-4;
    
    &__left {
      margin-right: $space-3;
    }
    
    &__title {
      flex-wrap: wrap;
    }
    
    &__uname {
      font-size: $text-sm;
    }
    
    &__action {
      font-size: 11px;
    }
    
    &__msg {
      font-size: $text-sm;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      white-space: normal;
    }
    
    &__reference {
      font-size: 11px;
      padding: $space-2 $space-3;
    }
    
    &__cover {
      padding: $space-2 $space-3;
    }
    
    &__metadata {
      flex-wrap: wrap;
      gap: $space-2;
    }
    
    &__time {
      font-size: 11px;
    }
    
    &__btn {
      opacity: 1;
      font-size: 11px;
    }
  }
  
  .message-actions {
    padding: $space-2 $space-3;
  }
  
  .gm {
    padding: $space-3 $space-4;
    
    &__title {
      font-size: $text-sm;
    }
    
    &__text {
      font-size: 12px;
    }
  }
  
  .empty {
    padding: $space-8;
  }
}
</style>
