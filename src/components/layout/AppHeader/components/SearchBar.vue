<template>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')
const isFocused = ref(false)

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

@media (max-width: $breakpoint-md) {
  .search-bar {
    width: 100%;
    
    &.focused {
      width: 100%;
    }
  }
}
</style>
