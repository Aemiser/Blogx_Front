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

  <div class="sidebar-card article-actions-sidebar">
    <div class="action-buttons">
      <button
        class="action-btn"
        :class="{ active: article?.isDigg }"
        @click="handleDigg"
        :title="`点赞 ${article?.diggCount || 0}`"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" :fill="article?.isDigg ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        <span class="action-count">{{ article?.diggCount || 0 }}</span>
      </button>
      <button
        class="action-btn"
        :class="{ active: article?.isCollect }"
        @click="handleCollect"
        :title="`收藏 ${article?.collectCount || 0}`"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" :fill="article?.isCollect ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span class="action-count">{{ article?.collectCount || 0 }}</span>
      </button>
      <button class="action-btn" @click="handleShare" title="分享">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ArticleDetail } from '@/types'
import { diggArticle, collectArticle } from '@/api/modules/article'
import { useUserStore } from '@/stores/user'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content: string
  article?: ArticleDetail | null
}>()

const router = useRouter()
const userStore = useUserStore()
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

async function handleDigg() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!props.article) return
  
  try {
    await diggArticle(props.article.id)
    props.article.isDigg = !props.article.isDigg
    props.article.diggCount += props.article.isDigg ? 1 : -1
  } catch (error) {
    console.error('Failed to digg:', error)
  }
}

async function handleCollect() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!props.article) return
  
  try {
    await collectArticle({ articleID: props.article.id, collectID: 0 })
    props.article.isCollect = !props.article.isCollect
    props.article.collectCount += props.article.isCollect ? 1 : -1
  } catch (error) {
    console.error('Failed to collect:', error)
  }
}

function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  alert('链接已复制到剪贴板')
}
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

.article-actions-sidebar {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  position: sticky;
  top: calc($space-4 + 420px);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: $space-4;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $space-1;
  padding: $space-2;
  border: 1px solid $border;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $text-sm;
  transition: all $duration-fast;

  &:hover {
    border-color: $primary;
    color: $primary;
    background: rgba($primary, 0.1);
  }

  &.active {
    border-color: $primary;
    color: $primary;
  }

  .action-count {
    font-size: $text-xs;
    color: $text-tertiary;
  }
}

[data-theme="dark"] {
  .table-of-contents,
  .article-actions-sidebar {
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

  .action-btn {
    border-color: $dark-border;
    color: $dark-text-secondary;

    &:hover {
      border-color: $primary;
      color: $primary;
    }

    .action-count {
      color: $dark-text-tertiary;
    }
  }
}
</style>
