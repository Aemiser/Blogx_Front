<template>
  <div class="sidebar-card article-author" v-if="author">
    <h4 class="sidebar-card__title">作者介绍</h4>
    <div class="author-info" @click="goProfile">
      <BAvatar :src="author.userAvatar" :size="48" :alt="author.nickName" />
      <div class="author-info__detail">
        <div class="author-info__name">{{ author.nickName }}</div>
        <div class="author-info__bio">{{ author.abstract || '这个人很懒，什么都没写' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BAvatar from '@/components/base/BAvatar/index.vue'

const props = defineProps<{
  author: {
    userID: number
    nickName: string
    userAvatar: string
    abstract?: string
  }
}>()

const router = useRouter()

function goProfile() {
  router.push(`/user/${props.author.userID}`)
}
</script>

<style scoped lang="scss">
.article-author {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  margin-bottom: $space-4;
}

.sidebar-card__title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $space-4;
}

.author-info {
  display: flex;
  align-items: center;
  gap: $space-3;
  cursor: pointer;
  padding: $space-2;
  border-radius: $radius-md;
  transition: background $duration-fast;

  &:hover {
    background: $bg-hover;
  }

  &__detail {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: $text-base;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  &__bio {
    font-size: $text-sm;
    color: $text-tertiary;
    margin-top: $space-1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

[data-theme="dark"] {
  .article-author {
    background: $dark-bg-card;
  }

  .sidebar-card__title,
  .author-info__name {
    color: $dark-text-primary;
  }

  .author-info:hover {
    background: $dark-bg-hover;
  }
}
</style>
