<template>
  <div class="sidebar-card table-of-contents" v-if="headings.length > 0">
    <h4 class="sidebar-card__title">目录</h4>
    <nav class="toc-nav">
      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        class="toc-item"
        :class="[`toc-item--${heading.level}`, { active: activeId === heading.id }]"
        @click.prevent="scrollToHeading(heading.id)"
      >
        {{ heading.text }}
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content: string
}>()

const headings = ref<Heading[]>([])
const activeId = ref('')

function parseHeadings(content: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const result: Heading[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '')

    result.push({ id, text, level })
  }

  headings.value = result
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

function updateActiveHeading() {
  const headingElements = headings.value.map(h => document.getElementById(h.id))
  const scrollTop = window.scrollY + 100

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const element = headingElements[i]
    if (element && element.offsetTop <= scrollTop) {
      activeId.value = headings.value[i].id
      return
    }
  }

  if (headings.value.length > 0) {
    activeId.value = headings.value[0].id
  }
}

watch(() => props.content, (newContent) => {
  if (newContent) {
    parseHeadings(newContent)
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', updateActiveHeading)
  updateActiveHeading()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeading)
})
</script>

<style scoped lang="scss">
.table-of-contents {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  margin-bottom: $space-4;
  position: sticky;
  top: $space-4;
}

.sidebar-card__title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $space-4;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  max-height: 400px;
  overflow-y: auto;
}

.toc-item {
  display: block;
  padding: $space-2 $space-3;
  font-size: $text-sm;
  color: $text-secondary;
  text-decoration: none;
  border-radius: $radius-sm;
  border-left: 2px solid transparent;
  transition: all $duration-fast;
  line-height: 1.4;

  &:hover {
    color: $primary;
    background: $bg-hover;
  }

  &.active {
    color: $primary;
    border-left-color: $primary;
    background: rgba($primary, 0.1);
  }

  &--1 {
    padding-left: $space-3;
    font-weight: $font-weight-medium;
  }

  &--2 {
    padding-left: $space-5;
  }

  &--3 {
    padding-left: $space-6;
    font-size: $text-xs;
  }

  &--4,
  &--5,
  &--6 {
    padding-left: $space-8;
    font-size: $text-xs;
  }
}

[data-theme="dark"] {
  .table-of-contents {
    background: $dark-bg-card;
  }

  .sidebar-card__title {
    color: $dark-text-primary;
  }

  .toc-item {
    color: $dark-text-secondary;

    &:hover {
      color: $primary;
      background: $dark-bg-hover;
    }

    &.active {
      background: rgba($primary, 0.2);
    }
  }
}
</style>
