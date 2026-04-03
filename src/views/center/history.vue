<template>
  <div class="history-page">
    <div class="card">
      <div class="page-header">
        <h2 class="section-title">浏览历史</h2>
        <BButton v-if="history.length > 0" variant="ghost" size="sm" @click="clearHistory">
          清空记录
        </BButton>
      </div>
      
      <div v-if="history.length === 0" class="empty">
        <p>暂无浏览记录</p>
      </div>
      
      <div v-else class="history-list">
        <div 
          v-for="item in history" 
          :key="item.id" 
          class="history-item"
          @click="$router.push(`/article/${item.articleID}`)"
        >
          <div class="history-cover" v-if="item.cover">
            <img :src="item.cover" alt="封面" />
          </div>
          <div class="history-content">
            <h3 class="history-title">{{ item.title || '暂无标题' }}</h3>
            <div class="history-meta">
              <span class="meta-author">{{ item.nickname }}</span>
              <span class="meta-item">{{ formatDate(item.lookData) }}</span>
            </div>
          </div>
          <div class="history-actions" @click.stop>
            <BButton variant="ghost" size="sm" @click="$router.push(`/article/${item.articleID}`)">
              查看
            </BButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHistory } from '@/api/modules/article'
import BButton from '@/components/base/BButton/index.vue'

const history = ref<any[]>([])

function formatDate(dateStr: string) {
  if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return ''
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

function clearHistory() {
  if (confirm('确定要清空所有浏览记录吗？')) {
    history.value = []
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-6;
}

.section-title {
  font-size: $text-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.history-item {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-secondary;
  cursor: pointer;
  transition: all $duration-fast;

  &:hover {
    background: $bg-hover;
  }
}

.history-cover {
  width: 80px;
  height: 60px;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
  background: $bg-tertiary;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: $text-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  display: flex;
  gap: $space-3;
}

.meta-author {
  font-size: $text-xs;
  color: $primary;
}

.meta-item {
  font-size: $text-xs;
  color: $text-tertiary;
}

.history-actions {
  flex-shrink: 0;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
