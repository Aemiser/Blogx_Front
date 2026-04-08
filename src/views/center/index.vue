<template>
  <div class="center-page">
    <div class="app-container">
      <!-- 移动端顶部导航 -->
      <div class="mobile-tabs">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="mobile-tab"
          active-class="active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </div>
      
      <div class="center-layout">
        <aside class="center-sidebar card">
          <nav class="sidebar-nav">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="nav-item"
              active-class="active"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text">{{ item.label }}</span>
            </router-link>
          </nav>
        </aside>
        <div class="center-main">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const menuItems = [
  { path: '/center/info', icon: '👤', label: '我' },
  { path: '/center/collections', icon: '📁', label: '收藏' },
  { path: '/center/articles', icon: '📝', label: '文章' },
  { path: '/center/comments', icon: '💬', label: '评论' },
  { path: '/center/history', icon: '📖', label: '历史' },
  { path: '/center/following', icon: '❤️', label: '关注' },
  { path: '/center/fans', icon: '👥', label: '粉丝' },
  { path: '/center/settings', icon: '⚙️', label: '设置' }
]
</script>

<style scoped lang="scss">
.center-page {
  padding: $space-6 0;
}

.center-layout {
  display: flex;
  gap: $space-6;
}

.center-sidebar {
  width: 200px;
  flex-shrink: 0;
  padding: $space-4;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.center-main {
  flex: 1;
  min-width: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3 $space-4;
  border-radius: $radius-md;
  color: $text-secondary;
  transition: all $duration-fast;
  text-decoration: none;

  &:hover {
    background: $bg-hover;
    color: $text-primary;
  }

  &.active {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

.nav-icon {
  font-size: $text-lg;
}

.nav-text {
  font-size: $text-base;
}

/* 移动端顶部导航 */
.mobile-tabs {
  display: none;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: var(--bg-card);
  border-radius: $radius-lg;
  padding: $space-2;
  margin-bottom: $space-4;
  gap: $space-1;

  &::-webkit-scrollbar {
    display: none;
  }
}

.mobile-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: $text-xs;
  white-space: nowrap;
  transition: all $duration-fast;

  &:hover {
    color: var(--text-secondary);
    background: var(--bg-hover);
  }

  &.active {
    color: var(--primary);
    background: rgba($primary, 0.1);
  }

  .nav-icon {
    font-size: $text-lg;
  }

  .nav-text {
    font-size: $text-xs;
  }
}

@media (max-width: $breakpoint-md) {
  .center-page {
    padding: $space-4 0;
  }

  .mobile-tabs {
    display: flex;
  }

  .center-sidebar {
    display: none;
  }

  .center-layout {
    gap: $space-4;
  }
}
</style>
