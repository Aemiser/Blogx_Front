<template>
  <article class="article-card" @click="goDetail">
    <!-- 左侧封面图 -->
    <div class="article-card__cover" v-if="article.cover">
      <img :src="getFullImageUrl(article.cover)" :alt="article.title" loading="lazy" />
    </div>
    <!-- 默认封面 -->
    <div class="article-card__cover article-card__cover--default" v-else>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
    
    <!-- 右侧内容 -->
    <div class="article-card__content">
      <h3 class="article-card__title">{{ article.title }}</h3>
      <p class="article-card__abstract" v-if="article.abstract">
        {{ article.abstract }}
      </p>
      <div class="article-card__tags" v-if="article.tagList?.length">
        <span class="article-card__tag" v-for="tag in article.tagList.slice(0, 3)" :key="tag">
          {{ tag }}
        </span>
      </div>
      <div class="article-card__meta">
        <div class="article-card__author">
          <BAvatar :src="article.userAvatar" :size="20" :alt="article.nickName" />
          <span>{{ article.nickName }}</span>
        </div>
        <span class="meta-separator">·</span>
        <span>{{ formatRelativeTime(article.createdAt) }}</span>
        <span class="meta-separator">·</span>
        <span>{{ formatNumber(article.lookCount) }} 阅读</span>
        <span class="meta-separator">·</span>
        <span>{{ article.commentCount }} 评论</span>
        <span class="meta-separator">·</span>
        <span>{{ article.diggCount }} 点赞</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Article } from '@/types'
import { formatNumber, formatRelativeTime } from '@/utils'
import { getFullImageUrl } from '@/utils/image'
import BAvatar from '@/components/base/BAvatar/index.vue'

const props = defineProps<{
  article: Article
}>()

const router = useRouter()

function goDetail() {
  const id = props.article.id
  if (!id || typeof id !== 'number' || isNaN(id)) {
    console.error('Invalid article ID:', id)
    return
  }
  router.push(`/article/${id}`)
}
</script>

<style scoped lang="scss">
.article-card {
  display: flex;
  gap: $space-4;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  cursor: pointer;
  transition: all $duration-fast $ease-default;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
  
  // 左侧封面
  &__cover {
    width: 200px;
    height: 130px;
    flex-shrink: 0;
    border-radius: $radius-md;
    overflow: hidden;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $duration-slow;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
    
    // 默认封面
    &--default {
      background: $bg-secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $text-quaternary;
    }
  }
  
  // 右侧内容
  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  
  &__title {
    font-size: $text-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $space-2;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    
    &:hover {
      color: $primary;
    }
  }
  
  &__abstract {
    font-size: $text-sm;
    color: $text-secondary;
    margin-bottom: $space-3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.6;
    flex: 1;
  }
  
  &__tags {
    display: flex;
    gap: $space-2;
    margin-bottom: $space-3;
  }
  
  &__tag {
    padding: 2px $space-2;
    background: rgba($primary, 0.1);
    color: $primary;
    font-size: $text-xs;
    border-radius: $radius-sm;
  }
  
  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-2;
    font-size: $text-xs;
    color: $text-tertiary;
    margin-top: auto;
  }
  
  &__author {
    display: flex;
    align-items: center;
    gap: $space-2;
    color: $text-secondary;
  }
}

.meta-separator {
  color: $text-quaternary;
}

// 响应式
@media (max-width: $breakpoint-md) {
  .article-card {
    flex-direction: column;
    
    &__cover {
      width: 100%;
      height: 160px;
    }
    
    &__content {
      padding: $space-3;
    }
    
    &__title {
      font-size: $text-base;
    }
    
    &__abstract {
      display: none;
    }
    
    &__meta {
      font-size: 11px;
    }
  }
}

// 深色主题
[data-theme="dark"] .article-card {
  background: var(--bg-card);
  
  &__cover--default {
    background: var(--bg-tertiary);
    color: var(--text-quaternary);
  }
  
  &__title {
    color: var(--text-primary);
    
    &:hover {
      color: var(--primary);
    }
  }
  
  &__abstract {
    color: var(--text-secondary);
  }
}
</style>
