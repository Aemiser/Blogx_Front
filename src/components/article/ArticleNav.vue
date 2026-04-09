<template>
  <div class="sidebar-card table-of-contents" v-if="headings.length > 0">
    <h4 class="sidebar-card__title">目录</h4>
    <nav class="toc-nav">
      <a
        v-for="(title, index) in headings"
        :key="title.id"
        class="toc-item"
        :class="[`toc-item--${title.level}`, { active: currentIndex === index }]"
        :style="{ paddingLeft: `${12 + (title.level - 1) * 16}px` }"
        @click.prevent="handleClick(index)"
      >
        {{ title.text }}
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface TitleItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  headings: TitleItem[]
  currentIndex: number
}>()

const emit = defineEmits<{
  (e: 'update:currentIndex', index: number): void
}>()

const handleClick = (index: number) => {
  emit('update:currentIndex', index)
  
  const title = props.headings[index]
  if (!title) return
  
  nextTick(() => {
    const element = document.getElementById(title.id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  })
}
</script>

<style scoped>
.table-of-contents {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.sidebar-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toc-item.active {
  color: var(--primary);
  background: rgba(var(--primary-rgb, 102, 126, 234), 0.1);
  font-weight: 500;
}

.toc-item--1 { font-weight: 600; }
.toc-item--2 { font-size: 13px; }
.toc-item--3 { font-size: 12px; opacity: 0.8; }
</style>