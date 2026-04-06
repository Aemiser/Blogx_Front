<template>
  <div class="info-page">
    <div class="card user-card" v-if="userInfo">
      <div class="user-header">
        <BAvatar :src="getAvatarUrl(userInfo.avatar)" :size="80" :alt="userInfo.nickname" />
        <h2 class="user-name">{{ userInfo.nickname }}</h2>
        <p class="user-bio">{{ userInfo.abstract || '这个人很懒，什么都没写' }}</p>
      </div>
      <div class="user-stats">
        <div class="stat-item" @click="$router.push('/center/articles')">
          <span class="stat-value">{{ userInfo.articleCount || 0 }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-item" @click="$router.push('/center/following')">
          <span class="stat-value">{{ userInfo.followCount || 0 }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item" @click="$router.push('/center/fans')">
          <span class="stat-value">{{ userInfo.fansCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">基本信息</h3>
      <div class="info-content" v-if="userInfo">
        <div class="info-item">
          <span class="info-label">昵称</span>
          <span class="info-value">{{ userInfo.nickname }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ userInfo.email || '未绑定' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">个人简介</span>
          <span class="info-value">{{ userInfo.abstract || '暂无简介' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">注册来源</span>
          <span class="info-value">{{ getRegisterSource(userInfo.registerSource) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">码龄</span>
          <span class="info-value">{{ userInfo.codeAge }}年</span>
        </div>
        <div class="info-item">
          <span class="info-label">浏览量</span>
          <span class="info-value">{{ userInfo.lookCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserBase } from '@/api/modules/user'
import { useUserStore } from '@/stores/user'
import { getAvatarUrl } from '@/utils/image'
import BAvatar from '@/components/base/BAvatar/index.vue'

const userStore = useUserStore()
const userInfo = ref<any>(null)

function getRegisterSource(source: number) {
  const sources: Record<number, string> = {
    1: '邮箱注册',
    2: 'QQ登录',
    3: '微信登录',
    4: 'GitHub登录',
    5: '系统注册'
  }
  return sources[source] || '未知'
}

async function fetchUserInfo() {
  try {
    const userId = userStore.userInfo?.userID
    if (!userId) return
    const res = await getUserBase(userId)
    userInfo.value = res.data
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="scss">
.info-page {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.card {
  padding: $space-6;
}

.user-card {
  .user-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-bottom: $space-6;
  }

  .user-name {
    font-size: $text-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-top: $space-4;
    margin-bottom: $space-2;
  }

  .user-bio {
    font-size: $text-sm;
    color: $text-secondary;
  }

  .user-stats {
    display: flex;
    gap: $space-8;
    justify-content: center;
    padding-top: $space-4;
    border-top: 1px solid $border;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: $space-2 $space-4;
    border-radius: $radius-md;
    transition: all $duration-fast;

    &:hover {
      background: $bg-hover;
    }

    .stat-value {
      font-size: $text-xl;
      font-weight: $font-weight-bold;
      color: $primary;
    }

    .stat-label {
      font-size: $text-xs;
      color: $text-tertiary;
      margin-top: $space-1;
    }
  }
}

.section-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-5;
  color: $text-primary;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  padding: $space-4 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  width: 100px;
  flex-shrink: 0;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.info-value {
  flex: 1;
  font-size: $text-base;
  color: $text-primary;
}
</style>
