<template>
  <div class="search-page">
    <div class="app-container">
      <div class="search-header">
        <h1 class="search-title">搜索结果</h1>
        <div class="search-input-wrapper">
          <input
            v-model="keyword"
            class="input search-input"
            type="text"
            placeholder="搜索文章、用户..."
            @keyup.enter="handleSearch"
          />
          <BButton variant="primary" size="md" @click="handleSearch">
            搜索
          </BButton>
        </div>
      </div>
      
      <div class="app-content">
        <div class="app-content__main">
          <div class="search-filters">
            <button
              v-for="filter in filters"
              :key="filter.value"
              class="filter-btn"
              :class="{ active: activeFilter === filter.value }"
              @click="activeFilter = filter.value; handleSearch()"
            >
              {{ filter.label }}
            </button>
          </div>
          
          <div v-if="loading" class="loading">
            <div class="loading__spinner"></div>
          </div>
          
          <template v-else-if="results.length > 0">
            <div
              v-for="item in results"
              :key="item.id"
              class="search-result-item"
              @click="goDetail(item.id)"
            >
              <h3 class="result-title" v-html="item.title"></h3>
              <p class="result-abstract" v-if="item.abstract">{{ item.abstract }}</p>
              <div class="result-meta">
                <span>{{ item.nickName }}</span>
                <span>{{ formatNumber(item.lookCount) }} 阅读</span>
                <span>{{ item.commentCount }} 评论</span>
              </div>
            </div>
          </template>
          
          <div v-else class="empty">
            <p>未找到相关结果</p>
          </div>
        </div>
        
        <aside class="app-content__sidebar">
          <div class="sidebar-card">
            <h4 class="sidebar-card__title">热门标签</h4>
            <div class="tag-list">
              <button
                v-for="tag in tags"
                :key="tag.tag"
                class="tag-btn"
                @click="searchByTag(tag.tag)"
              >
                {{ tag.tag }} ({{ tag.articleCount }})
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Article, TagAggregation } from '@/types'
import { searchArticle, getTagAggregation } from '@/api/modules/search'
import { formatNumber } from '@/utils'
import BButton from '@/components/base/BButton/index.vue'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const loading = ref(false)
const results = ref<Article[]>([])
const tags = ref<TagAggregation[]>([])
const activeFilter = ref(0)

const filters = [
  { label: '综合', value: 0 },
  { label: '最新', value: 1 },
  { label: '最热', value: 2 },
  { label: '点赞', value: 3 },
  { label: '收藏', value: 4 }
]

async function handleSearch() {
  if (!keyword.value.trim()) return
  
  loading.value = true
  try {
    const res = await searchArticle({
      tag: '',
      type: activeFilter.value as 0 | 1 | 2 | 3 | 4,
      page: 1,
      limit: 20,
      key: keyword.value.trim()
    })
    results.value = res.data.list
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

async function fetchTags() {
  try {
    const res = await getTagAggregation()
    tags.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

function searchByTag(tag: string) {
  keyword.value = tag
  handleSearch()
}

function goDetail(id: number) {
  router.push(`/article/${id}`)
}

onMounted(() => {
  keyword.value = (route.query.key as string) || ''
  if (keyword.value) {
    handleSearch()
  }
  fetchTags()
})
</script>

<style scoped lang="scss">
.search-page {
  padding: $space-6 0;
}

.search-header {
  margin-bottom: $space-6;
}

.search-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-4;
}

.search-input-wrapper {
  display: flex;
  gap: $space-3;
  
  .search-input {
    flex: 1;
    max-width: 500px;
  }
}

.search-filters {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-6;
}

.filter-btn {
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  font-size: $text-sm;
  color: $text-secondary;
  background: $bg-card;
  transition: all $duration-fast;
  
  &:hover {
    color: $text-primary;
  }
  
  &.active {
    background: $primary;
    color: white;
  }
}

.search-result-item {
  background: $bg-card;
  padding: $space-4 $space-5;
  border-radius: $radius-lg;
  margin-bottom: $space-3;
  cursor: pointer;
  transition: all $duration-fast;
  
  &:hover {
    box-shadow: $shadow-md;
  }
}

.result-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-2;
  
  :deep(em) {
    font-style: normal;
    color: $accent;
  }
}

.result-abstract {
  font-size: $text-sm;
  color: $text-secondary;
  margin-bottom: $space-3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  gap: $space-3;
  font-size: $text-xs;
  color: $text-tertiary;
}

.sidebar-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
}

.sidebar-card__title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-4;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.tag-btn {
  padding: $space-1 $space-3;
  background: $bg-secondary;
  border-radius: $radius-full;
  font-size: $text-xs;
  color: $text-secondary;
  transition: all $duration-fast;
  
  &:hover {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

.loading,
.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}

[data-theme="dark"] {
  .filter-btn,
  .search-result-item,
  .sidebar-card {
    background: $dark-bg-card;
  }
  
  .tag-btn {
    background: $dark-bg-tertiary;
  }
}
</style>
