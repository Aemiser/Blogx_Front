<template>
  <div class="category-tabs">
    <button
      class="category-tabs__item"
      :class="{ active: !modelValue }"
      @click="handleClick(undefined)"
    >
      推荐
    </button>
    <button
      v-for="category in categories"
      :key="category.value"
      class="category-tabs__item"
      :class="{ active: modelValue === category.value }"
      @click="handleClick(category.value)"
    >
      {{ category.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { CategoryOption } from '@/types'
import { getCategoryOptions } from '@/api/modules/article'

const props = defineProps<{
  modelValue?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void
  (e: 'change', value: number | undefined): void
}>()

const categories = ref<CategoryOption[]>([])

async function fetchCategories() {
  try {
    const res = await getCategoryOptions()
    categories.value = res.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

function handleClick(id: number | undefined) {
  emit('update:modelValue', id)
  emit('change', id)
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.category-tabs {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-6;
  overflow-x: auto;
  padding-bottom: $space-2;
  
  &::-webkit-scrollbar {
    height: 0;
  }
  
  &__item {
    flex-shrink: 0;
    padding: $space-2 $space-4;
    border-radius: $radius-full;
    font-size: $text-base;
    color: $text-secondary;
    background: $bg-card;
    transition: all $duration-fast;
    white-space: nowrap;
    
    &:hover {
      color: $text-primary;
      background: $bg-hover;
    }
    
    &.active {
      color: white;
      background: $primary;
    }
  }
}

[data-theme="dark"] .category-tabs__item {
  background: $dark-bg-card;
  
  &:hover {
    background: $dark-bg-hover;
  }
}
</style>
