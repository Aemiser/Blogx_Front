<template>
  <Teleport to="body">
    <div v-if="visible" class="ai-chat-overlay" @click.self="close">
      <div 
        ref="dialogRef"
        class="ai-chat"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
      >
        <div class="ai-chat__header" @mousedown="startDrag">
          <div class="ai-chat__title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
              <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
              <circle cx="9" cy="10" r="1"/>
              <circle cx="15" cy="10" r="1"/>
            </svg>
            AI 助手
          </div>
          <button class="ai-chat__close" @click="close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="ai-chat__messages" ref="messagesRef">
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="ai-chat__message"
            :class="{ 'ai-chat__message--user': msg.role === 'user', 'ai-chat__message--ai': msg.role === 'ai' }"
          >
            <div class="ai-chat__avatar">
              <svg v-if="msg.role === 'ai'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
                <circle cx="9" cy="10" r="1"/>
                <circle cx="15" cy="10" r="1"/>
              </svg>
              <span v-else>{{ userStore.user?.nickname?.charAt(0) || 'U' }}</span>
            </div>
            <div class="ai-chat__content">
              <div class="ai-chat__text" v-html="formatMessage(msg.content)"></div>
              <div v-if="msg.role === 'ai' && msg.loading" class="ai-chat__typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="ai-chat__input-area">
          <textarea 
            v-model="inputText"
            class="ai-chat__input"
            placeholder="输入消息..."
            rows="2"
            @keydown.enter.exact="sendMessage"
            :disabled="isLoading"
          ></textarea>
          <button 
            class="ai-chat__send" 
            @click="sendMessage"
            :disabled="!inputText.trim() || isLoading"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const userStore = useUserStore()
const dialogRef = ref<HTMLElement>()
const messagesRef = ref<HTMLElement>()
const inputText = ref('')
const isLoading = ref(false)

interface Message {
  role: 'user' | 'ai'
  content: string
  loading?: boolean
}

const messages = ref<Message[]>([
  { role: 'ai', content: '你好！我是AI助手，有什么可以帮你的吗？' }
])

const position = ref({ x: window.innerWidth - 380, y: 100 })
let isDragging = false
let dragOffset = { x: 0, y: 0 }

function close() {
  emit('update:visible', false)
}

function startDrag(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.ai-chat__close')) return
  isDragging = true
  dragOffset = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return
  const newX = Math.max(0, Math.min(window.innerWidth - 360, e.clientX - dragOffset.x))
  const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
  position.value = { x: newX, y: newY }
}

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function formatMessage(content: string) {
  return content.replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()
  
  isLoading.value = true
  const aiMessageIndex = messages.value.length
  messages.value.push({ role: 'ai', content: '', loading: true })
  scrollToBottom()
  
  try {
    const token = storage.getToken() || ''
    const url = `/api/ai/article?content=${encodeURIComponent(text)}&token=${encodeURIComponent(token)}`
    
    const response = await fetch(url)
    
    if (!response.ok) throw new Error('请求失败')
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let hasContent = false
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.slice(5).trim()
              const data = JSON.parse(jsonStr)
              if (data.code === 1001) {
                alert('请登录')
                close()
                return
              }
              if (data.code === 0 && data.data) {
                messages.value[aiMessageIndex].content += data.data
                hasContent = true
                scrollToBottom()
              }
            } catch {}
          }
        }
      }
    }
    
    if (!hasContent) {
      messages.value[aiMessageIndex].content = '暂无回复'
    }
    messages.value[aiMessageIndex].loading = false
  } catch (error) {
    console.error('AI request failed:', error)
    messages.value[aiMessageIndex].content = '抱歉，请求失败，请稍后重试。'
    messages.value[aiMessageIndex].loading = false
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    position.value = { x: window.innerWidth - 380, y: 100 }
  }
})
</script>

<style scoped lang="scss">
.ai-chat-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

.ai-chat {
  position: fixed;
  width: 360px;
  height: 480px;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-3 $space-4;
    border-bottom: 1px solid $border;
    cursor: move;
    user-select: none;
    background: $bg-secondary;
  }
  
  &__title {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-weight: 600;
    font-size: $text-sm;
    color: $text-primary;
    
    svg {
      color: $primary;
    }
  }
  
  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: $radius-md;
    color: $text-tertiary;
    cursor: pointer;
    transition: all $duration-fast;
    
    &:hover {
      background: $bg-hover;
      color: $text-primary;
    }
  }
  
  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }
  
  &__message {
    display: flex;
    gap: $space-3;
    
    &--user {
      flex-direction: row-reverse;
      
      .ai-chat__avatar {
        background: $primary;
        color: white;
      }
      
      .ai-chat__content {
        align-items: flex-end;
      }
      
      .ai-chat__text {
        background: $primary;
        color: white;
        border-radius: $radius-lg $radius-lg $radius-sm $radius-lg;
      }
    }
    
    &--ai {
      .ai-chat__avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .ai-chat__text {
        background: $bg-secondary;
        color: $text-primary;
        border-radius: $radius-lg $radius-lg $radius-lg $radius-sm;
      }
    }
  }
  
  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: $text-sm;
    font-weight: 600;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    max-width: 75%;
  }
  
  &__text {
    padding: $space-3 $space-4;
    font-size: $text-sm;
    line-height: 1.6;
    word-break: break-word;
  }
  
  &__typing {
    display: flex;
    gap: 4px;
    padding: $space-2 $space-3;
    
    span {
      width: 6px;
      height: 6px;
      background: $text-tertiary;
      border-radius: $radius-full;
      animation: typing 1.4s infinite;
      
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
  
  &__input-area {
    display: flex;
    align-items: flex-end;
    gap: $space-2;
    padding: $space-3 $space-4;
    border-top: 1px solid $border;
    background: $bg-secondary;
  }
  
  &__input {
    flex: 1;
    resize: none;
    border: 1px solid $border;
    border-radius: $radius-md;
    padding: $space-2 $space-3;
    font-size: $text-sm;
    background: $bg-card;
    color: $text-primary;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: $primary;
    }
    
    &::placeholder {
      color: $text-tertiary;
    }
    
    &:disabled {
      opacity: 0.6;
    }
  }
  
  &__send {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: $primary;
    border-radius: $radius-md;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
    transition: all $duration-fast;
    
    &:hover:not(:disabled) {
      background: darken($primary, 8%);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

[data-theme="dark"] {
  .ai-chat {
    background: $dark-bg-card;
    border-color: $dark-border;
    
    &__header {
      background: $dark-bg-secondary;
      border-color: $dark-border;
    }
    
    &__messages {
      background: $dark-bg-card;
    }
    
    &__input-area {
      background: $dark-bg-secondary;
      border-color: $dark-border;
    }
    
    &__input {
      background: $dark-bg-card;
      border-color: $dark-border;
      color: $dark-text-primary;
    }
    
    &__text {
      background: $dark-bg-secondary;
      color: $dark-text-primary;
    }
    
    &__message--user .ai-chat__text {
      background: $primary;
      color: white;
    }
  }
}
</style>
