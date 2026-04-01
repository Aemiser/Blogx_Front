<template>
  <div class="admin-dashboard">
    <div class="app-container">
      <h1 class="page-title">管理后台</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__value">{{ stats.userCount }}</span>
            <span class="stat-card__label">用户总数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card__icon articles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__value">{{ stats.articleCount }}</span>
            <span class="stat-card__label">文章总数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card__icon comments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__value">{{ stats.commentCount }}</span>
            <span class="stat-card__label">评论总数</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card__icon views">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <span class="stat-card__value">{{ stats.flowCount }}</span>
            <span class="stat-card__label">总浏览量</span>
          </div>
        </div>
      </div>
      
      <div class="admin-nav">
        <router-link to="/admin/users" class="nav-card">
          <h3>用户管理</h3>
          <p>管理用户账号和权限</p>
        </router-link>
        <router-link to="/admin/articles" class="nav-card">
          <h3>文章管理</h3>
          <p>审核和管理文章内容</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DataSum } from '@/types'
import { getDataSum } from '@/api/modules/logs'

const stats = ref<DataSum>({
  flowCount: 0,
  userCount: 0,
  articleCount: 0,
  messageCount: 0,
  commentCount: 0,
  newLoginCount: 0,
  newSignCount: 0
})

async function fetchStats() {
  try {
    const res = await getDataSum()
    stats.value = res.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: $space-6 0;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
  margin-bottom: $space-8;
}

.stat-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-5;
  display: flex;
  align-items: center;
  gap: $space-4;
  
  &__icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.users {
      background: rgba($primary, 0.1);
      color: $primary;
    }
    
    &.articles {
      background: rgba($success, 0.1);
      color: $success;
    }
    
    &.comments {
      background: rgba($warning, 0.1);
      color: $warning;
    }
    
    &.views {
      background: rgba($accent, 0.1);
      color: $accent;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
  }
  
  &__value {
    font-size: $text-2xl;
    font-weight: $font-weight-bold;
  }
  
  &__label {
    font-size: $text-sm;
    color: $text-tertiary;
  }
}

.admin-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-4;
}

.nav-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $space-6;
  transition: all $duration-fast;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
  
  h3 {
    font-size: $text-lg;
    font-weight: $font-weight-semibold;
    margin-bottom: $space-2;
  }
  
  p {
    font-size: $text-sm;
    color: $text-tertiary;
  }
}

@media (max-width: $breakpoint-md) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .admin-nav {
    grid-template-columns: 1fr;
  }
}
</style>
