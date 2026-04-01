<template>
  <div class="sidebar-card author-recommend">
    <h4 class="sidebar-card__title">推荐作者</h4>
    <div class="author-list">
      <div
        v-for="author in authors"
        :key="author.userID"
        class="author-item"
        @click="goProfile(author.userID)"
      >
        <BAvatar :src="author.userAvatar" :size="40" :alt="author.userNickname" />
        <div class="author-item__info">
          <div class="author-item__name">{{ author.userNickname }}</div>
          <div class="author-item__bio">{{ author.userAbstract || '这个人很懒，什么都没写' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RecommendAuthor } from '@/types'
import { getRecommendAuthors } from '@/api/modules/user'
import BAvatar from '@/components/base/BAvatar/index.vue'

const router = useRouter()
const authors = ref<RecommendAuthor[]>([])

async function fetchAuthors() {
  try {
    const res = await getRecommendAuthors(1, 5)
    authors.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch authors:', error)
  }
}

function goProfile(id: number) {
  router.push(`/user/${id}`)
}

onMounted(() => {
  fetchAuthors()
})
</script>

<style scoped lang="scss">
.author-recommend {
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

.author-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.author-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-2;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $duration-fast;
  
  &:hover {
    background: $bg-hover;
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__name {
    font-size: $text-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__bio {
    font-size: $text-xs;
    color: $text-tertiary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;
  }
}

[data-theme="dark"] {
  .author-recommend,
  .sidebar-card__title {
    background: $dark-bg-card;
    color: $dark-text-primary;
  }
  
  .author-item:hover {
    background: $dark-bg-hover;
  }
}
</style>
