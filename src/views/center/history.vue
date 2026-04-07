<template>
  <div class="history-page">
    <div class="card">
      <div class="page-header">
        <h2 class="section-title">浏览历史</h2>
        <BButton v-if="groupedHistory.length > 0" variant="ghost" size="sm" @click="clearHistory">
          清空记录
        </BButton>
      </div>
      
      <div v-if="groupedHistory.length === 0" class="empty">
        <p>暂无浏览记录</p>
      </div>
      
      <div v-else class="history-list">
        <div v-for="group in groupedHistory" :key="group.date" class="history-group">
          <div class="history-date">
            <span class="date-text">{{ group.date }}</span>
          </div>
          <div class="group-items">
            <div 
              v-for="item in group.items" 
              :key="item.id" 
              class="history-item"
              @click="$router.push(`/article/${item.articleID}`)"
            >
              <div class="history-cover" v-if="item.cover">
                <img :src="getFullImageUrl(item.cover)" alt="封面" />
              </div>
              <div class="history-content">
                <h3 class="history-title">{{ item.title || '暂无标题' }}</h3>
                <div class="history-meta">
                  <span class="meta-author">{{ item.nickname }}</span>
                  <span class="meta-item">{{ formatTime(item.lookData) }}</span>
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
      <div ref="loadMoreRef" class="load-more">
        <span v-if="loading">加载中...</span>
        <span v-else-if="hasMore">下拉加载更多</span>
        <span v-else>没有更多了</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getHistory } from '@/api/modules/article'
import { getFullImageUrl } from '@/utils/image'
import BButton from '@/components/base/BButton/index.vue'

interface HistoryItem {
  id: number
  articleID: number
  title: string
  cover: string
  nickname: string
  lookData: string
}

const history = ref<HistoryItem[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

interface GroupedHistory {
  date: string
  items: HistoryItem[]
}

const groupedHistory = computed<GroupedHistory[]>(() => {
  const groups = new Map<string, { date: string, items: HistoryItem[] }>()
  
  for (const item of history.value) {
    if (!item.lookData || item.lookData === '0001-01-01T00:00:00Z') continue
    
    const date = new Date(item.lookData)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let dateKey: string
    
    if (isSameDay(date, today)) {
      dateKey = '今天'
    } else if (isSameDay(date, yesterday)) {
      dateKey = '昨天'
    } else {
      dateKey = date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    }
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, { date: dateKey, items: [] })
    }
    groups.get(dateKey)!.items.push(item)
  }
  
  const result = Array.from(groups.values())
  
  result.sort((a, b) => {
    const aDate = a.items[0]?.lookData ? new Date(a.items[0].lookData).getTime() : 0
    const bDate = b.items[0]?.lookData ? new Date(b.items[0].lookData).getTime() : 0
    return bDate - aDate
  })
  
  return result
})

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

function formatTime(dateStr: string) {
  if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function fetchHistory(isLoadMore = false) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getHistory({
      type: 1,
      page: page.value,
      limit: 20
    })
    const list = res.data?.list || []
    if (isLoadMore) {
      history.value.push(...list)
    } else {
      history.value = list
    }
    hasMore.value = list.length >= 20
    if (hasMore.value) {
      page.value++
    }
  } catch (error) {
    console.error('Failed to fetch history:', error)
  } finally {
    loading.value = false
  }
}

function setupObserver() {
  if (!loadMoreRef.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !loading.value) {
      fetchHistory(true)
    }
  }, { threshold: 0.1 })
  observer.observe(loadMoreRef.value)
}

function clearHistory() {
  if (confirm('确定要清空所有浏览记录吗？')) {
    history.value = []
  }
}

onMounted(() => {
  fetchHistory()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
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
  gap: $space-6;
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.history-date {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding-bottom: $space-2;
  border-bottom: 1px solid $border;
  
  .date-text {
    font-size: $text-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }
  
  .date-time {
    font-size: $text-xs;
    color: $text-tertiary;
  }
}

.group-items {
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

.load-more {
  text-align: center;
  padding: $space-4;
  color: $text-tertiary;
  font-size: $text-sm;
}
</style>
