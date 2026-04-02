<template>
  <div class="search-wrapper">
    <div class="search-bar" :class="{ focused: isFocused }">
      <svg class="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        v-model="keyword"
        class="search-bar__input"
        type="text"
        placeholder="搜索文章、用户..."
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup.enter="handleSearch"
      />
    </div>
    <button class="ai-tag" @click="showAiChat = true" title="AI 助手">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
        <circle cx="9" cy="10" r="1"/>
        <circle cx="15" cy="10" r="1"/>
      </svg>
      AI
    </button>
    <AiChat v-model:visible="showAiChat" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AiChat from './AiChat.vue'

const router = useRouter()
const keyword = ref('')
const isFocused = ref(false)
const showAiChat = ref(false)

function handleSearch() {
  if (keyword.value.trim()) {
    router.push({
      path: '/search',
      query: { key: keyword.value.trim() }
    })
  }
}
</script>

<style scoped lang="scss">
.search-wrapper {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.search-bar {
  position: relative;
  width: 200px;
  transition: width $duration-normal $ease-default;
  
  &.focused {
    width: 320px;
  }
  
  &__icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: $text-tertiary;
    pointer-events: none;
  }
  
  &__input {
    width: 100%;
    height: 36px;
    padding: 0 $space-4 0 36px;
    border: 1px solid $border;
    border-radius: $radius-full;
    background: $bg-secondary;
    font-size: $text-sm;
    color: $text-primary;
    transition: all $duration-fast;
    
    &::placeholder {
      color: $text-tertiary;
    }
    
    &:focus {
      outline: none;
      border-color: $primary;
      background: $bg-card;
      box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }
  }
}

.ai-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 $space-3;
  border: none;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: $text-xs;
  font-weight: 600;
  cursor: pointer;
  transition: all $duration-fast;
  white-space: nowrap;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

@media (max-width: $breakpoint-md) {
  .search-bar {
    width: 100%;
    
    &.focused {
      width: 100%;
    }
  }
  
  .ai-tag {
    flex-shrink: 0;
  }
}
</style>
