<template>
  <div class="sidebar-card hot-articles">
    <h4 class="sidebar-card__title">热门文章</h4>
    <div class="article-list">
      <div
        v-for="(article, index) in articles"
        :key="article.id"
        class="article-item"
        @click="goDetail(article.id)"
      >
        <span class="article-item__rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
        <div class="article-item__info">
          <div class="article-item__title">{{ article.title }}</div>
          <div class="article-item__views">{{ formatNumber(article.lookCount) }} 阅读</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RecommendArticle } from '@/types'
import { getRecommendArticles } from '@/api/modules/article'
import { formatNumber } from '@/utils'

const router = useRouter()
const articles = ref<RecommendArticle[]>([])

async function fetchArticles() {
  try {
    const res = await getRecommendArticles(10)
    articles.value = res.data?.list || []
  } catch (error) {
    console.error('Failed to fetch hot articles:', error)
  }
}

function goDetail(id: number) {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.hot-articles {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
}

.sidebar-card__title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $space-4;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.article-item {
  display: flex;
  align-items: flex-start;
  gap: $space-3;
  padding: $space-2;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $duration-fast;
  
  &:hover {
    background: $bg-hover;
  }
  
  &__rank {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $text-xs;
    font-weight: $font-weight-medium;
    color: $text-tertiary;
    background: $bg-secondary;
    border-radius: $radius-sm;
    
    &.top {
      background: $primary;
      color: white;
    }
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__title {
    font-size: $text-sm;
    color: $text-primary;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }
  
  &__views {
    font-size: $text-xs;
    color: $text-tertiary;
    margin-top: 4px;
  }
}

[data-theme="dark"] {
  .hot-articles,
  .sidebar-card__title {
    background: $dark-bg-card;
    color: $dark-text-primary;
  }
  
  .article-item:hover {
    background: $dark-bg-hover;
  }
  
  .article-item__rank {
    background: $dark-bg-tertiary;
    
    &.top {
      background: $primary;
    }
  }
}
</style>
