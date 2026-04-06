<template>
  <div class="following-page">
    <div class="card">
      <h2 class="section-title">我的关注</h2>
      <div v-if="followingList.length === 0" class="empty">
        <p>暂无关注</p>
      </div>
      <div v-else class="user-list">
        <div v-for="user in followingList" :key="user.focusUserID" class="user-item">
          <div class="user-avatar" @click="$router.push(`/user/${user.focusUserID}`)">
            <BAvatar :src="getAvatarUrl(user.focusUserAvatar)" :size="48" :alt="user.focusUserNickname" />
          </div>
          <div class="user-info" @click="$router.push(`/user/${user.focusUserID}`)">
            <h4 class="user-name">{{ user.focusUserNickname }}</h4>
            <p class="user-bio">{{ user.focusUserAbstract || '暂无简介' }}</p>
          </div>
          <BButton variant="ghost" size="sm" @click="unfollow(user.focusUserID)">取消关注</BButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getFollowingList, unfollowUser } from '@/api/modules/user'
import { getAvatarUrl } from '@/utils/image'
import BAvatar from '@/components/base/BAvatar/index.vue'
import BButton from '@/components/base/BButton/index.vue'

const userStore = useUserStore()
const followingList = ref<any[]>([])

async function fetchFollowingList() {
  try {
    const userId = userStore.userInfo?.userID
    if (!userId) return
    const res = await getFollowingList(userId)
    followingList.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch following list:', error)
  }
}

async function unfollow(userId: number) {
  try {
    await unfollowUser(userId)
    fetchFollowingList()
  } catch (error) {
    console.error('Failed to unfollow:', error)
  }
}

onMounted(() => {
  fetchFollowingList()
})
</script>

<style scoped lang="scss">
.following-page {
  .card {
    padding: $space-6;
  }
}

.section-title {
  font-size: $text-xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
  color: $text-primary;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.user-item {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-secondary;
  transition: all $duration-fast;

  &:hover {
    background: $bg-hover;
  }
}

.user-avatar {
  flex-shrink: 0;
  cursor: pointer;
}

.user-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.user-name {
  font-size: $text-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.user-bio {
  font-size: $text-sm;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
