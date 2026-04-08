<template>
  <div class="sort-tabs">
    <button
      v-for="sort in sortOptions"
      :key="sort.value"
      class="sort-tab"
      :class="{ active: modelValue === sort.value }"
      @click="handleClick(sort.value)"
    >
      <component :is="sort.icon" class="sort-tab__icon" />
      <span>{{ sort.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

// 图标组件
const RecommendIcon = {
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    ])
  }
}

const TimeIcon = {
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('polyline', { points: '12 6 12 12 16 14' })
    ])
  }
}

const ReplyIcon = {
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ])
  }
}

const LikeIcon = {
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3' })
    ])
  }
}

const CollectIcon = {
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' })
    ])
  }
}

const sortOptions = [
  { label: '猜你喜欢', value: 0, icon: RecommendIcon },
  { label: '最新发布', value: 1, icon: TimeIcon },
  { label: '最多回复', value: 2, icon: ReplyIcon },
  { label: '最多点赞', value: 3, icon: LikeIcon },
  { label: '最多收藏', value: 4, icon: CollectIcon }
]

function handleClick(value: number) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped lang="scss">
.sort-tabs {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-4;
  padding: $space-3 $space-4;
  background: $bg-card;
  border-radius: $radius-lg;
}

.sort-tab {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  font-size: $text-sm;
  color: $text-secondary;
  transition: all $duration-fast;
  border: none;
  background: transparent;
  cursor: pointer;
  
  &:hover {
    color: $primary;
    background: rgba($primary, 0.1);
  }
  
  &.active {
    color: white;
    background: $primary;
  }
  
  &__icon {
    flex-shrink: 0;
  }
}

[data-theme="dark"] .sort-tabs {
  background: var(--bg-card);
}

@media (max-width: $breakpoint-md) {
  .sort-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: $space-2 $space-3;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .sort-tab {
    padding: $space-2 $space-3;
    white-space: nowrap;
    font-size: $text-xs;
    
    span {
      display: none;
    }
    
    &.active span {
      display: inline;
    }
  }
}
</style>
