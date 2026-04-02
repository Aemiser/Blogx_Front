<template>
  <div class="fans-page">
    <div class="card">
      <h2 class="section-title">我的粉丝</h2>
      <div v-if="fansList.length === 0" class="empty">
        <p>暂无粉丝</p>
      </div>
      <div v-else class="user-list">
        <div v-for="user in fansList" :key="user.fansUserID" class="user-item">
          <div class="user-avatar">
            <BAvatar :src="user.fansUserAvatar" :size="48" :alt="user.fansUserNickname" />
          </div>
          <div class="user-info">
            <h4 class="user-name">{{ user.fansUserNickname }}</h4>
            <p class="user-bio">{{ user.fansUserAbstract || '暂无简介' }}</p>
          </div>
          <BButton variant="ghost" size="sm" @click="follow(user.fansUserID)">回关</BButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getFansList, followUser } from '@/api/modules/user'
import BAvatar from '@/components/base/BAvatar/index.vue'
import BButton from '@/components/base/BButton/index.vue'

const userStore = useUserStore()
const fansList = ref<any[]>([])

async function fetchFansList() {
  try {
    const userId = userStore.userInfo?.userID
    if (!userId) return
    const res = await getFansList(userId)
    fansList.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch fans list:', error)
  }
}

async function follow(userId: number) {
  try {
    await followUser(userId)
    alert('关注成功')
  } catch (error) {
    console.error('Failed to follow:', error)
  }
}

onMounted(() => {
  fetchFansList()
})
</script>

<style scoped lang="scss">
.fans-page {
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
}

.user-info {
  flex: 1;
  min-width: 0;
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
