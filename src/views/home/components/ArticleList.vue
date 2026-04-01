<template>
  <div class="article-list">
    <div v-if="loading" class="article-list__loading">
      <div v-for="i in 5" :key="i" class="article-card-skeleton">
        <div class="skeleton cover"></div>
        <div class="content">
          <div class="skeleton title"></div>
          <div class="skeleton abstract"></div>
          <div class="skeleton meta"></div>
        </div>
      </div>
    </div>
    
    <template v-else-if="articles.length > 0">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
      
      <div class="article-list__more" v-if="hasMore">
        <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
      
      <div class="article-list__empty" v-else>
        没有更多了
      </div>
    </template>
    
    <div v-else class="article-list__empty">
      <div class="empty">
        <svg class="empty__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>暂无文章</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Article } from '@/types'
import { searchArticle } from '@/api/modules/search'
import ArticleCard from '@/components/business/ArticleCard/index.vue'

const props = defineProps<{
  categoryId?: number
  sortType?: number
}>()

const articles = ref<Article[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const limit = 10
const total = ref(0)

const hasMore = computed(() => articles.value.length < total.value)

// 获取分类名称作为 tag 参数
function getTagValue(): string {
  // 如果没有分类，返回空字符串
  if (!props.categoryId) return ''
  // 这里需要根据 categoryId 获取分类名称
  // 暂时返回空字符串，后续可以优化
  return ''
}

async function fetchArticles(isLoadMore = false) {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }
  
  try {
    const res = await searchArticle({
      tag: getTagValue(),
      type: (props.sortType ?? 0) as 0 | 1 | 2 | 3 | 4,
      page: String(page.value),
      limit: String(limit),
      key: ''
    })
    
    if (isLoadMore) {
      articles.value = [...articles.value, ...res.data.list]
    } else {
      articles.value = res.data.list
    }
    total.value = res.data.count
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  page.value++
  fetchArticles(true)
}

// 监听分类和排序变化
watch([() => props.categoryId, () => props.sortType], () => {
  page.value = 1
  fetchArticles()
})

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.article-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  
  &__loading {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }
  
  &__more {
    display: flex;
    justify-content: center;
    padding: $space-4 0;
  }
  
  &__empty {
    text-align: center;
    padding: $space-12 0;
    color: $text-tertiary;
  }
}

.article-card-skeleton {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  display: flex;
  gap: $space-4;
  
  .cover {
    width: 200px;
    height: 130px;
    flex-shrink: 0;
    border-radius: $radius-md;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }
  
  .title {
    height: 24px;
    width: 60%;
  }
  
  .abstract {
    height: 40px;
    width: 100%;
  }
  
  .meta {
    height: 16px;
    width: 70%;
    margin-top: auto;
  }
}

@media (max-width: $breakpoint-md) {
  .article-card-skeleton {
    flex-direction: column;
    
    .cover {
      width: 100%;
      height: 160px;
    }
  }
}

.load-more-btn {
  padding: $space-3 $space-8;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $text-base;
  cursor: pointer;
  transition: all $duration-fast;
  
  &:hover:not(:disabled) {
    border-color: $primary;
    color: $primary;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  
  &__icon {
    color: $text-quaternary;
  }
}

[data-theme="dark"] {
  .article-card-skeleton,
  .load-more-btn {
    background: $dark-bg-card;
    border-color: $dark-border;
  }
}
</style>
