<template>
  <div class="history-page">
    <div class="card">
      <h2 class="section-title">浏览历史</h2>
      <div v-if="history.length === 0" class="empty">
        <p>暂无浏览记录</p>
      </div>
      <div v-else class="history-list">
        <div v-for="item in history" :key="item.id" class="history-item">
          <div class="history-info">
            <h3 class="history-title">{{ item.title }}</h3>
            <div class="history-meta">
              <span class="meta-item">{{ formatDate(item.createdAt) }}</span>
              <span class="meta-item">{{ item.lookCount }}次浏览</span>
            </div>
          </div>
          <div class="history-actions">
            <BButton variant="ghost" size="sm" @click="$router.push(`/article/${item.articleID}`)">查看</BButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getHistory } from '@/api/modules/article'
import BButton from '@/components/base/BButton/index.vue'

const userStore = useUserStore()
const history = ref<any[]>([])

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

async function fetchHistory() {
  try {
    const res = await getHistory({
      type: 1,
      page: 1,
      limit: 20
    })
    history.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch history:', error)
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped lang="scss">
.history-page {
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-secondary;
  transition: all $duration-fast;

  &:hover {
    background: $bg-hover;
  }
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.history-meta {
  display: flex;
  gap: $space-4;
}

.meta-item {
  font-size: $text-xs;
  color: $text-tertiary;
}

.history-actions {
  display: flex;
  gap: $space-2;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
