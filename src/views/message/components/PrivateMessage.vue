<template>
  <div class="dm-page">
    <div class="dm-list" :class="{ 'dm-list--expanded': activeSession }">
      <div class="dm-list__header">
        <span class="dm-list__title">私信会话</span>
      </div>
      <div class="dm-list__search">
        <input v-model="searchKey" placeholder="搜索联系人" class="dm-search-input" />
      </div>
      <div class="dm-list__items">
        <div
          v-for="session in filteredSessions"
          :key="session.userID"
          class="dm-session"
          :class="{ 'dm-session--active': activeSession?.userID === session.userID }"
          @click="openSession(session)"
        >
          <BAvatar :src="session.userAvatar" :size="40" :alt="session.userNickname" />
          <div class="dm-session__info">
            <div class="dm-session__name">{{ session.userNickname }}</div>
            <div class="dm-session__last">{{ getLastMessage(session) }}</div>
          </div>
          <div class="dm-session__meta">
            <span class="dm-session__time">{{ formatTime(session.newMsgDate) }}</span>
            <span v-if="session.unreadCount" class="dm-session__badge">{{ session.unreadCount }}</span>
          </div>
        </div>
        <div v-if="filteredSessions.length === 0" class="dm-list__empty">
          暂无会话
        </div>
      </div>
    </div>

    <div class="dm-chat" v-if="activeSession">
      <div class="dm-chat__header">
        <button class="dm-chat__back" @click="activeSession = null">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="dm-chat__name">{{ activeSession.userNickname }}</span>
        <span class="dm-chat__relation">{{ getRelationText(activeSession.relation) }}</span>
      </div>

      <div class="dm-chat__msgs" ref="chatContainerRef" @scroll="handleScroll">
        <div v-if="isLoadingMore" class="dm-chat__loading">
          <span>加载中...</span>
        </div>
        <div v-if="!hasMoreMessages && chatMessages.length > 0" class="dm-chat__no-more">
          没有更多消息了
        </div>
        <div
          v-for="msg in chatMessages"
          :key="msg.id"
          class="dm-msg"
          :class="{ 'dm-msg--self': isCurrentUser(msg) }"
        >
          <BAvatar
            v-if="!isCurrentUser(msg)"
            :src="activeSession.userAvatar"
            :size="32"
            :alt="activeSession.userNickname"
            class="dm-msg__avatar"
          />
          <div class="dm-msg__content">
            <div class="dm-msg__bubble">
              <template v-if="msg.msgType === 1">{{ msg.msg?.contentMsg?.Content }}</template>
              <img v-else-if="msg.msgType === 2" :src="msg.msg?.imagetMsg?.Src" class="dm-msg__image" @click="previewImage(msg.msg?.imagetMsg?.Src)" />
              <div v-else-if="msg.msgType === 3" class="dm-msg__md" v-html="renderMarkdown(msg.msg?.markdownMsg?.content)"></div>
            </div>
            <div class="dm-msg__time">{{ formatTime(msg.createdAt) }}</div>
          </div>
        </div>
        <div v-if="chatMessages.length === 0" class="dm-chat__empty">
          开始发送消息吧
        </div>
      </div>

      <div class="dm-chat__input">
        <div class="dm-input-toolbar">
          <button class="toolbar-btn" @click="showEmoji = !showEmoji" title="表情">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click="toggleMarkdownMode" :class="{ active: isMarkdownMode }" title="Markdown">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4l4 16M20 4l-4 16"/>
            </svg>
          </button>
          <button class="toolbar-btn" @click="triggerImageUpload" title="发送图片">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </button>
          <input type="file" ref="imageInputRef" accept="image/*" style="display:none" @change="handleImageSelect" />
        </div>
        
        <div v-if="showEmoji" class="emoji-picker">
          <div class="emoji-category">
            <button 
              v-for="cat in emojiCategories" 
              :key="cat.name"
              class="emoji-cat-btn"
              :class="{ active: activeEmojiCategory === cat.name }"
              @click="activeEmojiCategory = cat.name"
            >
              {{ cat.icon }}
            </button>
          </div>
          <div class="emoji-grid">
            <button 
              v-for="emoji in currentEmojiList" 
              :key="emoji"
              class="emoji-btn"
              @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <div class="dm-input-main">
          <textarea
            v-model="inputMessage"
            :placeholder="isMarkdownMode ? '支持Markdown格式...' : '输入消息...'"
            class="dm-input"
            :class="{ 'dm-input--md': isMarkdownMode }"
            @keydown.enter.ctrl="handleSend"
            rows="1"
            ref="inputRef"
          ></textarea>
          <button class="dm-send-btn" :disabled="!inputMessage.trim()" @click="handleSend">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="dm-chat dm-chat--empty" v-else>
      <div class="dm-chat__placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>选择会话开始聊天</p>
      </div>
    </div>

    <div v-if="previewImageUrl" class="image-preview-overlay" @click="previewImageUrl = null">
      <img :src="previewImageUrl" class="image-preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
import type { ChatSession } from '@/types'
import { getChatSessionList, getChatRecord, markMessageAsRead } from '@/api/modules/message'
import { uploadImage } from '@/api/modules/banner'
import { formatRelativeTime, chatWS } from '@/utils'
import { useUserStore } from '@/stores/user'
import BAvatar from '@/components/base/BAvatar/index.vue'

interface ChatMessage {
  id: number
  seedUserID?: number
  sendUserID?: number
  RevUserID?: number
  revUserID?: number
  msgType: number
  msg: {
    contentMsg?: { Content?: string }
    imagetMsg?: { Src: string }
    markdownMsg?: { content: string }
  }
  createdAt: string
  isRead?: boolean
}

const userStore = useUserStore()
const currentUserID = computed(() => userStore.userInfo?.userID)

const sessions = ref<ChatSession[]>([])
const chatMessages = ref<ChatMessage[]>([])
const activeSession = ref<ChatSession | null>(null)
const searchKey = ref('')
const inputMessage = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const wsUnsubscribe = ref<(() => void) | null>(null)
const showEmoji = ref(false)
const isMarkdownMode = ref(false)
const previewImageUrl = ref<string | null>(null)

const currentPage = ref(1)
const totalCount = ref(0)
const isLoadingMore = ref(false)
const hasMoreMessages = computed(() => chatMessages.value.length < totalCount.value)

const activeEmojiCategory = ref('表情')

const emojiCategories = [
  { name: '表情', icon: '😀' },
  { name: '手势', icon: '👋' },
  { name: '爱心', icon: '❤️' },
  { name: '物品', icon: '🎁' },
  { name: '符号', icon: '✅' }
]

const emojiLists: Record<string, string[]> = {
  '表情': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️'],
  '手势': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  '爱心': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
  '物品': ['🎁', '🎀', '🎈', '🎉', '🎊', '🎨', '🎭', '🎪', '🎫', '🎬', '🎤', '🎧', '🎹', '🎸', '🎺', '🎷', '🥁', '🎻', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️'],
  '符号': ['✅', '❌', '❓', '❗', '💡', '🔥', '⭐', '🌟', '✨', '⚡', '💥', '💢', '💬', '💭', '📢', '📣', '🔔', '🔕', '🔇', '🔊', '🎵', '🎶', '➡️', '⬅️', '⬆️', '⬇️', '↩️', '↪️', '🔄']
}

const currentEmojiList = computed(() => emojiLists[activeEmojiCategory.value] || [])

const filteredSessions = computed(() => {
  if (!searchKey.value) return sessions.value
  const key = searchKey.value.toLowerCase()
  return sessions.value.filter(s => 
    s.userNickname?.toLowerCase().includes(key)
  )
})

function isCurrentUser(msg: ChatMessage): boolean {
  const senderId = msg.sendUserID ?? msg.seedUserID
  return senderId === currentUserID.value
}

function getLastMessage(session: ChatSession): string {
  if (!session.msg) return ''
  const msg = session.msg
  if (msg.contentMsg) return msg.contentMsg.Content || msg.contentMsg.content || ''
  if (msg.imagetMsg) return '[图片]'
  if (msg.markdownMsg) return '[Markdown]'
  return ''
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  return formatRelativeTime(dateStr)
}

function getRelationText(relation: number): string {
  switch (relation) {
    case 3: return '好友'
    case 2: return '已关注'
    case 1: return '粉丝'
    default: return '陌生人'
  }
}

function getImageUrl(url: string | undefined): string {
  if (!url) return ''
  return url
}

function renderMarkdown(content: string | undefined): string {
  if (!content) return ''
  let html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
  return html
}

async function fetchSessions() {
  try {
    const res = await getChatSessionList()
    sessions.value = res.data.list || []
  } catch (e) {
    console.error('Failed to fetch sessions:', e)
  }
}

async function openSession(session: ChatSession) {
  chatMessages.value = []
  currentPage.value = 1
  activeSession.value = session
  await fetchMessages(session.userID)
  
  if (session.unreadCount) {
    markMessageAsRead(session.userID).catch(() => {})
  }
}

async function fetchMessages(userID: number, page = 1) {
  if (!userID) return
  try {
    const res = await getChatRecord(userID, 1, page, 20)
    const list = res.data?.list || []
    totalCount.value = res.data?.count || 0
    
    if (page === 1) {
      chatMessages.value = list
      nextTick(() => scrollToBottom())
    } else {
      chatMessages.value = [...list, ...chatMessages.value]
    }
  } catch (e) {
    console.error('Failed to fetch messages:', e)
  }
}

async function loadMoreMessages() {
  if (isLoadingMore.value || !hasMoreMessages.value || !activeSession.value) return
  
  isLoadingMore.value = true
  currentPage.value++
  
  const oldScrollHeight = chatContainerRef.value?.scrollHeight || 0
  
  try {
    await fetchMessages(activeSession.value.userID, currentPage.value)
    nextTick(() => {
      if (chatContainerRef.value) {
        chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight - oldScrollHeight
      }
    })
  } finally {
    isLoadingMore.value = false
  }
}

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  if (target.scrollTop <= 50 && hasMoreMessages.value && !isLoadingMore.value) {
    loadMoreMessages()
  }
}

function handleSend() {
  if (!inputMessage.value.trim() || !activeSession.value) return

  const msgType = isMarkdownMode.value ? 3 : 1
  
  if (isMarkdownMode.value) {
    chatWS.sendMarkdown(activeSession.value.userID, inputMessage.value.trim())
  } else {
    chatWS.sendText(activeSession.value.userID, inputMessage.value.trim())
  }
  
  chatMessages.value.push({
    id: Date.now(),
    sendUserID: userStore.userInfo!.userID!,
    revUserID: activeSession.value.userID,
    msgType: msgType,
    msg: msgType === 3 
      ? { markdownMsg: { content: inputMessage.value.trim() } }
      : { contentMsg: { Content: inputMessage.value.trim() } },
    createdAt: new Date().toISOString(),
    isRead: true
  })
  
  inputMessage.value = ''
  showEmoji.value = false
  nextTick(() => scrollToBottom())
}

function toggleMarkdownMode() {
  isMarkdownMode.value = !isMarkdownMode.value
}

function triggerImageUpload() {
  imageInputRef.value?.click()
}

async function handleImageSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !activeSession.value) return

  try {
    const res = await uploadImage(file)
    const imageUrl = res.data as string
    
    chatWS.sendImage(activeSession.value.userID, imageUrl)
    
    chatMessages.value.push({
      id: Date.now(),
      sendUserID: userStore.userInfo!.userID!,
      revUserID: activeSession.value.userID,
      msgType: 2,
      msg: { imagetMsg: { Src: imageUrl } },
      createdAt: new Date().toISOString(),
      isRead: true
    })
    nextTick(() => scrollToBottom())
  } catch (error) {
    console.error('Failed to upload image:', error)
  }
  
  target.value = ''
}

function insertEmoji(emoji: string) {
  inputMessage.value += emoji
  showEmoji.value = false
  nextTick(() => inputRef.value?.focus())
}

function previewImage(url: string) {
  previewImageUrl.value = url
}

function scrollToBottom() {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

function handleWSMessage(msg: any) {
  if (!msg.sendUserID) return

  if (activeSession.value?.userID === msg.sendUserID) {
    chatMessages.value.push({
      id: msg.id,
      sendUserID: msg.sendUserID,
      revUserID: userStore.userInfo!.userID!,
      msgType: msg.msgType,
      msg: msg.msg,
      createdAt: msg.newMsgDate || new Date().toISOString(),
      isRead: true
    })
    nextTick(() => scrollToBottom())
  }

  fetchSessions()
}

watch(showEmoji, (val) => {
  if (!val) return
  setTimeout(() => {
    const handler = (e: MouseEvent) => {
      const picker = document.querySelector('.emoji-picker')
      const btn = document.querySelector('.toolbar-btn')
      if (picker && btn && !picker.contains(e.target as Node) && !btn.contains(e.target as Node)) {
        showEmoji.value = false
        document.removeEventListener('click', handler)
      }
    }
    document.addEventListener('click', handler)
  }, 0)
})

onMounted(() => {
  chatWS.connect()
  fetchSessions()
  wsUnsubscribe.value = chatWS.onMessage(handleWSMessage)
})

onUnmounted(() => {
  if (wsUnsubscribe.value) {
    wsUnsubscribe.value()
  }
})
</script>

<style scoped lang="scss">
.dm-page {
  display: flex;
  height: 500px;
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  position: relative;
}

.dm-list {
  width: 280px;
  border-right: 1px solid $border-light;
  display: flex;
  flex-direction: column;

  &--expanded {
    width: 260px;
  }

  &__header {
    padding: 16px;
    border-bottom: 1px solid $border-light;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__search {
    padding: 12px 16px;
  }

  &__items {
    flex: 1;
    overflow-y: auto;
  }

  &__empty {
    text-align: center;
    padding: 24px;
    color: $text-tertiary;
    font-size: 13px;
  }
}

.dm-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  background: $bg-secondary;
  color: $text-primary;

  &:focus {
    outline: none;
    border-color: $primary;
  }

  &::placeholder {
    color: $text-tertiary;
  }
}

.dm-session {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba($primary, 0.04);
  }

  &--active {
    background: rgba($primary, 0.08);
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 2px;
  }

  &__last {
    font-size: 12px;
    color: $text-tertiary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  &__time {
    font-size: 11px;
    color: $text-tertiary;
  }

  &__badge {
    min-width: 16px;
    height: 16px;
    padding: 0 5px;
    background: $primary;
    color: white;
    font-size: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.dm-chat {
  flex: 1;
  display: flex;
  flex-direction: column;

  &--empty {
    justify-content: center;
    align-items: center;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid $border-light;
  }

  &__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: $text-secondary;
    cursor: pointer;
    border-radius: 6px;

    &:hover {
      background: rgba($primary, 0.08);
      color: $primary;
    }
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: $text-primary;
  }

  &__relation {
    font-size: 12px;
    color: $text-tertiary;
    padding: 2px 8px;
    background: $bg-secondary;
    border-radius: 10px;
  }

  &__msgs {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__empty {
    text-align: center;
    color: $text-tertiary;
    font-size: 13px;
    margin: auto;
  }

  &__placeholder {
    text-align: center;
    color: $text-tertiary;

    svg {
      margin-bottom: 12px;
      opacity: 0.5;
    }

    p {
      font-size: 14px;
    }
  }

  &__input {
    border-top: 1px solid $border-light;
    position: relative;
  }

  &__loading {
    text-align: center;
    padding: 12px;
    color: $text-tertiary;
    font-size: 13px;
  }

  &__no-more {
    text-align: center;
    padding: 12px;
    color: $text-tertiary;
    font-size: 12px;
  }
}

.dm-input-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid $border-light;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: $text-secondary;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    background: rgba($primary, 0.08);
    color: $primary;
  }

  &.active {
    background: rgba($primary, 0.12);
    color: $primary;
  }
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: $radius-lg;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  margin: 0 12px;
  max-height: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.emoji-category {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid $border-light;
}

.emoji-cat-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.15s;

  &:hover, &.active {
    opacity: 1;
    background: rgba($primary, 0.08);
  }
}

.emoji-grid {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-btn {
  padding: 6px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    background: rgba($primary, 0.08);
    transform: scale(1.2);
  }
}

.dm-input-main {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
}

.dm-input-wrapper {
  flex: 1;
}

.dm-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid $border;
  border-radius: 20px;
  font-size: 14px;
  background: $bg-secondary;
  color: $text-primary;
  resize: none;
  max-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: $primary;
  }

  &::placeholder {
    color: $text-tertiary;
  }

  &--md {
    border-radius: 12px;
    font-family: monospace;
  }
}

.dm-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: $primary;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dm-msg {
  display: flex;
  gap: 8px;
  max-width: 70%;

  &--self {
    flex-direction: row-reverse;
    margin-left: auto;

    .dm-msg__bubble {
      background: $primary;
      color: white;
    }

    .dm-msg__time {
      text-align: right;
    }
  }

  &__avatar {
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__bubble {
    padding: 8px 12px;
    background: $bg-secondary;
    border-radius: 12px;
    font-size: 14px;
    color: $text-primary;
    line-height: 1.5;
    word-break: break-word;
  }

  &__image {
    max-width: 200px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.02);
    }
  }

  &__md {
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;

    :deep(strong) {
      font-weight: bold;
    }

    :deep(em) {
      font-style: italic;
    }

    :deep(code) {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }
  }

  &__time {
    font-size: 11px;
    color: $text-tertiary;
    margin-top: 4px;
  }
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.image-preview {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}
</style>
