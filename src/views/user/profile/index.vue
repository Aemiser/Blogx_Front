<template>
  <div class="profile-page">
    <div class="app-container">
      <div class="profile-header card" v-if="userInfo">
        <BAvatar :src="userInfo.avatar" :size="80" :alt="userInfo.nickname" />
        <div class="profile-info">
          <h1 class="profile-name">{{ userInfo.nickname }}</h1>
          <p class="profile-bio">{{ userInfo.place || '这个人很懒，什么都没写' }}</p>
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
            @click="handleTabChange(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="content-main">
          <!-- 文章标签页 -->
          <div v-if="activeTab === 'articles'">
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
            
            <div v-else-if="error" class="article-list__error">
              <div class="error">
                <svg class="error__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchArticles">重试</button>
              </div>
            </div>
            
            <template v-else-if="articles.length > 0">
              <ArticleCard
                v-for="article in articles"
                :key="article.id"
                :article="article"
              />
              
              <div class="article-list__pagination" v-if="totalPages > 0">
                <button 
                  class="page-btn prev" 
                  @click="goToPage(currentPage - 1)" 
                  :disabled="currentPage === 1 || loadingMore"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                
                <template v-for="pageNum in displayPages" :key="pageNum">
                  <span v-if="pageNum === -1" class="page-ellipsis">...</span>
                  <button 
                    v-else
                    class="page-btn"
                    :class="{ active: pageNum === currentPage }"
                    @click="goToPage(pageNum)"
                    :disabled="loadingMore"
                  >
                    {{ pageNum }}
                  </button>
                </template>
                
                <button 
                  class="page-btn next" 
                  @click="goToPage(currentPage + 1)" 
                  :disabled="currentPage === totalPages || loadingMore"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
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
          
          <!-- 收藏标签页 -->
          <div v-else-if="activeTab === 'collections'">
            <div v-if="loading" class="collections-loading">
              <div v-for="i in 3" :key="i" class="collection-skeleton">
                <div class="skeleton title"></div>
                <div class="skeleton abstract"></div>
                <div class="skeleton count"></div>
              </div>
            </div>
            
            <div v-else-if="error" class="collections-error">
              <div class="error">
                <svg class="error__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchCollections">重试</button>
              </div>
            </div>
            
            <div v-else-if="collections.length > 0" class="collections-list">
              <div v-for="collection in collections" :key="collection.id" class="collection-item">
                <div class="collection-info">
                  <h3 class="collection-title">{{ collection.title }}</h3>
                  <p class="collection-abstract">{{ collection.abstract || '暂无描述' }}</p>
                  <span class="collection-count">{{ collection.ArticleCount }}篇文章</span>
                </div>
              </div>
            </div>
            
            <div v-else class="collections-empty">
              <div class="empty">
                <svg class="empty__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <p>暂无收藏</p>
              </div>
            </div>
          </div>
          
          <!-- 关注标签页 -->
          <div v-else-if="activeTab === 'following'">
            <div v-if="loading" class="users-loading">
              <div v-for="i in 5" :key="i" class="user-skeleton">
                <div class="skeleton avatar"></div>
                <div class="skeleton info"></div>
              </div>
            </div>
            
            <div v-else-if="error" class="users-error">
              <div class="error">
                <svg class="error__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchFollowing">重试</button>
              </div>
            </div>
            
            <div v-else-if="following.length > 0" class="users-list">
              <div v-for="user in following" :key="user.focusUserID" class="user-item">
                <div class="user-avatar">
                  <BAvatar :src="user.focusUserAvatar" :size="48" :alt="user.focusUserNickname" />
                </div>
                <div class="user-info">
                  <h4 class="user-name">{{ user.focusUserNickname }}</h4>
                  <p class="user-bio">{{ user.focusUserAbstract || '这个人很懒，什么都没写' }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="users-empty">
              <div class="empty">
                <svg class="empty__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>暂无关注</p>
              </div>
            </div>
          </div>
          
          <!-- 粉丝标签页 -->
          <div v-else-if="activeTab === 'followers'">
            <div v-if="loading" class="users-loading">
              <div v-for="i in 5" :key="i" class="user-skeleton">
                <div class="skeleton avatar"></div>
                <div class="skeleton info"></div>
              </div>
            </div>
            
            <div v-else-if="error" class="users-error">
              <div class="error">
                <svg class="error__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchFans">重试</button>
              </div>
            </div>
            
            <div v-else-if="fans.length > 0" class="users-list">
              <div v-for="user in fans" :key="user.fansUserID" class="user-item">
                <div class="user-avatar">
                  <BAvatar :src="user.fansUserAvatar" :size="48" :alt="user.fansUserNickname" />
                </div>
                <div class="user-info">
                  <h4 class="user-name">{{ user.fansUserNickname }}</h4>
                  <p class="user-bio">{{ user.fansUserAbstract || '这个人很懒，什么都没写' }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="users-empty">
              <div class="empty">
                <svg class="empty__icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>暂无粉丝</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { UserBaseInfo, Article, Collection, FocusUser, FansUser } from '@/types'
import { getUserBase, getFollowingList, getFansList } from '@/api/modules/user'
import { getArticleList, getCollectionList } from '@/api/modules/article'
import BAvatar from '@/components/base/BAvatar/index.vue'
import ArticleCard from '@/components/business/ArticleCard/index.vue'

const route = useRoute()

const userInfo = ref<UserBaseInfo | null>(null)
const articles = ref<Article[]>([])
const collections = ref<Collection[]>([])
const following = ref<FocusUser[]>([])
const fans = ref<FansUser[]>([])
const activeTab = ref('articles')
const loading = ref(false)
const loadingMore = ref(false)
const page = ref(1)
const limit = 10
const total = ref(0)
const error = ref<string | null>(null)

const currentPage = computed(() => page.value)
const totalPages = computed(() => Math.ceil(total.value / limit))
const displayPages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // 省略号
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1)
      pages.push(total)
    }
  }
  return pages
})

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
  
  if (page.value === 1) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = null
  
  try {
    const res = await getArticleList({
      type: 1,
      userID: id,
      page: page.value,
      limit: limit
    })
    articles.value = res.data.list
    total.value = res.data.count
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    error.value = '加载文章失败，请稍后重试'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function goToPage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value || loadingMore.value) return
  page.value = newPage
  fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function fetchCollections() {
  const id = Number(route.params.id)
  if (!id) return
  
  loading.value = true
  error.value = null
  
  try {
    const res = await getCollectionList({
      type: 1,
      UserID: id,
      page: 1,
      limit: 20
    })
    collections.value = res.data.list
  } catch (err) {
    console.error('Failed to fetch collections:', err)
    error.value = '加载收藏夹失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function fetchFollowing() {
  const id = Number(route.params.id)
  if (!id) return
  
  loading.value = true
  error.value = null
  
  try {
    const res = await getFollowingList(id)
    following.value = res.data.list
  } catch (err) {
    console.error('Failed to fetch following:', err)
    error.value = '加载关注列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

async function fetchFans() {
  const id = Number(route.params.id)
  if (!id) return
  
  loading.value = true
  error.value = null
  
  try {
    const res = await getFansList(id)
    fans.value = res.data.list
  } catch (err) {
    console.error('Failed to fetch fans:', err)
    error.value = '加载粉丝列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function handleTabChange(tab: string) {
  activeTab.value = tab
  page.value = 1
  error.value = null
  
  switch (tab) {
    case 'articles':
      fetchArticles()
      break
    case 'collections':
      fetchCollections()
      break
    case 'following':
      fetchFollowing()
      break
    case 'followers':
      fetchFans()
      break
  }
}

watch(() => route.params.id, () => {
  page.value = 1
  loading.value = true
  error.value = null
  fetchUserInfo()
  handleTabChange(activeTab.value)
})

onMounted(() => {
  loading.value = true
  fetchUserInfo()
  handleTabChange(activeTab.value)
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

.article-list__loading {
  display: flex;
  flex-direction: column;
  gap: $space-4;
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

.article-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $space-2;
  padding: $space-4 0;
}

.page-ellipsis {
  color: $text-tertiary;
  user-select: none;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 $space-2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $text-sm;
  cursor: pointer;
  transition: all $duration-fast;
  
  &:hover:not(:disabled):not(.active) {
    border-color: $primary;
    color: $primary;
  }
  
  &.active {
    background: $primary;
    border-color: $primary;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.prev,
  &.next {
    padding: 0;
  }
}

.article-list__empty {
  text-align: center;
  padding: $space-12 0;
  color: $text-tertiary;
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

.article-list__error {
  text-align: center;
  padding: $space-12 0;
  color: $text-tertiary;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  
  &__icon {
    color: $danger;
  }
  
  p {
    color: $text-secondary;
    margin: 0;
  }
}

.retry-btn {
  padding: $space-2 $space-4;
  background: $primary;
  color: white;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $duration-fast;
  
  &:hover {
    background: darken($primary, 10%);
  }
}

[data-theme="dark"] {
  .article-card-skeleton,
  .page-btn {
    background: $dark-bg-card;
    border-color: $dark-border;
  }
}

/* 收藏标签页样式 */
.collections-loading {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.collection-skeleton {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-4;
  
  .title {
    height: 24px;
    width: 60%;
    margin-bottom: $space-2;
  }
  
  .abstract {
    height: 40px;
    width: 100%;
    margin-bottom: $space-2;
  }
  
  .count {
    height: 16px;
    width: 30%;
  }
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.collection-item {
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-card;
  transition: all $duration-fast;
  
  &:hover {
    background: $bg-hover;
  }
}

.collection-info {
  flex: 1;
}

.collection-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.collection-abstract {
  font-size: $text-sm;
  color: $text-secondary;
  margin-bottom: $space-2;
}

.collection-count {
  font-size: $text-xs;
  color: $text-tertiary;
}

.collections-empty,
.collections-error {
  text-align: center;
  padding: $space-12 0;
  color: $text-tertiary;
}

/* 用户列表样式（关注、粉丝） */
.users-loading {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.user-skeleton {
  display: flex;
  gap: $space-4;
  padding: $space-4;
  background: $bg-card;
  border-radius: $radius-lg;
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  
  .info {
    flex: 1;
    height: 40px;
  }
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.user-item {
  display: flex;
  gap: $space-4;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-card;
  transition: all $duration-fast;
  
  &:hover {
    background: $bg-hover;
  }
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.user-bio {
  font-size: $text-sm;
  color: $text-secondary;
  margin: 0;
}

.users-empty,
.users-error {
  text-align: center;
  padding: $space-12 0;
  color: $text-tertiary;
}
</style>
