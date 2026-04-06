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
              v-for="type in searchTypes"
              :key="type.value"
              class="filter-btn"
              :class="{ active: activeSearchType === type.value }"
              @click="activeSearchType = type.value; handleSearch()"
            >
              {{ type.label }}
            </button>
          </div>
          
          <div v-if="loading" class="loading">
            <div class="loading__spinner"></div>
          </div>
          
          <!-- 文章搜索结果 -->
          <template v-else-if="activeSearchType === 'article' && results.length > 0">
            <div
              v-for="item in results"
              :key="item.articleID"
              class="search-result-item"
              @click="goDetail(item.articleID)"
            >
              <h3 class="result-title" v-html="item.head"></h3>
              <p class="result-abstract" v-if="item.body" v-html="decodeHtml(item.body)"></p>
            </div>
          </template>
          
          <!-- 用户搜索结果 -->
          <template v-else-if="activeSearchType === 'user' && userResults.length > 0">
            <div
              v-for="user in userResults"
              :key="user.userID"
              class="search-result-item"
              @click="goUser(user.userID)"
            >
              <img :src="getAvatarUrl(user.avatar)" class="user-avatar" />
              <div class="user-info">
                <h3 class="user-name">{{ user.nickname }}</h3>
                <p class="user-abstract" v-if="user.abstract">{{ user.abstract }}</p>
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
import type { FullTextSearchResult, UserSearchResult } from '@/types'
import { fullTextSearch, searchUser, getTagAggregation } from '@/api/modules/search'
import { formatNumber } from '@/utils'
import { getAvatarUrl } from '@/utils/image'
import BButton from '@/components/base/BButton/index.vue'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const loading = ref(false)
const results = ref<(FullTextSearchResult | UserSearchResult)[]>([])
const userResults = ref<UserSearchResult[]>([])
const tags = ref<TagAggregation[]>([])
const activeSearchType = ref<'article' | 'user'>('article')

const searchTypes = [
  { label: '文章', value: 'article' as const },
  { label: '用户', value: 'user' as const }
]

async function handleSearch() {
  if (!keyword.value.trim()) return
  
  loading.value = true
  try {
    if (activeSearchType.value === 'article') {
      const res = await fullTextSearch({
        key: keyword.value.trim(),
        page: 1,
        limit: 20
      })
      results.value = res.data.list
    } else {
      const res = await searchUser({
        key: keyword.value.trim(),
        page: 1,
        limit: 20
      })
      results.value = res.data.list
      userResults.value = res.data.list
    }
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

function goUser(id: number) {
  router.push(`/user/${id}`)
}

function decodeHtml(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
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
  display: flex;
  align-items: center;
  gap: $space-4;
  
  &:hover {
    box-shadow: $shadow-md;
  }
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: $radius-full;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: $text-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.user-abstract {
  font-size: $text-sm;
  color: $text-tertiary;
  margin-top: $space-1;
}

.result-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-2;
  line-height: 1.5;
  
  :deep(em) {
    font-style: italic;
    color: $primary;
    font-weight: $font-weight-semibold;
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
  line-height: 1.6;
  
  :deep(em) {
    font-style: italic;
    color: $primary;
  }
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
