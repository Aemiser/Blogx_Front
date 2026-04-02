<template>
  <div class="sidebar-card article-author" v-if="author">
    <div class="author-avatar" @click="goProfile">
      <BAvatar :src="avatarUrl" :size="64" :alt="displayName" />
    </div>
    <div class="author-name" @click="goProfile">{{ displayName }}</div>
    <div class="author-stats">
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(author.lookCount || 0) }}</span>
        <span class="stat-label">阅读</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ author.commentCount || 0 }}</span>
        <span class="stat-label">评论</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ author.diggCount || 0 }}</span>
        <span class="stat-label">点赞</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatNumber } from '@/utils'
import BAvatar from '@/components/base/BAvatar/index.vue'

const props = defineProps<{
  author: {
    userID: number
    nickName?: string
    nickname?: string
    userAvatar?: string
    useravatar?: string
    lookCount?: number
    commentCount?: number
    diggCount?: number
  }
}>()

const router = useRouter()

const displayName = computed(() => {
  return props.author.nickName || props.author.nickname || '未知用户'
})

const avatarUrl = computed(() => {
  return props.author.userAvatar || props.author.useravatar || ''
})

function goProfile() {
  router.push(`/user/${props.author.userID}`)
}
</script>

<style scoped lang="scss">
.article-author {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-6 $space-4;
  margin-bottom: $space-4;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.author-avatar {
  cursor: pointer;
  transition: transform $duration-fast;

  &:hover {
    transform: scale(1.05);
  }
}

.author-name {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-top: $space-3;
  cursor: pointer;
  transition: color $duration-fast;

  &:hover {
    color: $primary;
  }
}

.author-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: $space-4;
  padding-top: $space-4;
  border-top: 1px solid $border-light;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .stat-value {
    font-size: $text-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .stat-label {
    font-size: $text-xs;
    color: $text-tertiary;
  }
}

[data-theme="dark"] {
  .article-author {
    background: $dark-bg-card;
  }

  .author-name,
  .stat-item .stat-value {
    color: $dark-text-primary;
  }

  .author-stats {
    border-color: $dark-border;
  }
}
</style>
