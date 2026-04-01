<template>
  <div class="profile-page">
    <div class="app-container">
      <div class="profile-header card" v-if="userInfo">
        <BAvatar :src="userInfo.avatar" :size="80" :alt="userInfo.nickname" />
        <div class="profile-info">
          <h1 class="profile-name">{{ userInfo.nickname }}</h1>
          <p class="profile-bio">{{ userInfo.abstract || '这个人很懒，什么都没写' }}</p>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.articleCount }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.fansCount }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.followCount }}</span>
              <span class="stat-label">关注</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-content">
        <div class="content-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="content-main">
          <div v-if="articles.length === 0" class="empty">
            <p>暂无文章</p>
          </div>
          <ArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { UserBaseInfo, Article } from '@/types'
import { getUserBase } from '@/api/modules/user'
import { getArticleList } from '@/api/modules/article'
import BAvatar from '@/components/base/BAvatar/index.vue'
import ArticleCard from '@/components/business/ArticleCard/index.vue'

const route = useRoute()

const userInfo = ref<UserBaseInfo | null>(null)
const articles = ref<Article[]>([])
const activeTab = ref('articles')

const tabs = [
  { label: '文章', value: 'articles' },
  { label: '收藏', value: 'collections' },
  { label: '关注', value: 'following' },
  { label: '粉丝', value: 'followers' }
]

async function fetchUserInfo() {
  const id = Number(route.params.id)
  if (!id) return
  
  try {
    const res = await getUserBase(id)
    userInfo.value = res.data
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}

async function fetchArticles() {
  const id = Number(route.params.id)
  if (!id) return
  
  try {
    const res = await getArticleList({
      type: 1,
      userID: id,
      page: 1,
      limit: 20
    })
    articles.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  }
}

watch(() => route.params.id, () => {
  fetchUserInfo()
  fetchArticles()
})

onMounted(() => {
  fetchUserInfo()
  fetchArticles()
})
</script>

<style scoped lang="scss">
.profile-page {
  padding: $space-6 0;
}

.profile-header {
  display: flex;
  gap: $space-6;
  padding: $space-6;
  margin-bottom: $space-6;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: $text-2xl;
  font-weight: $font-weight-bold;
  margin-bottom: $space-2;
}

.profile-bio {
  color: $text-secondary;
  margin-bottom: $space-4;
}

.profile-stats {
  display: flex;
  gap: $space-8;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: $text-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.stat-label {
  font-size: $text-xs;
  color: $text-tertiary;
}

.content-tabs {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-6;
}

.tab-btn {
  padding: $space-2 $space-4;
  border-radius: $radius-md;
  font-size: $text-base;
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

.content-main {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
