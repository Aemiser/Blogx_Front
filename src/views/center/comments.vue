<template>
  <div class="comments-page">
    <div class="card">
      <h2 class="section-title">发布的评论</h2>
      <div v-if="comments.length === 0" class="empty">
        <p>暂无评论</p>
      </div>
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-content">
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-meta">
              <span class="meta-item">文章：{{ comment.articleTitle || '未知文章' }}</span>
              <span class="meta-item">{{ formatDate(comment.createdAt) }}</span>
            </div>
          </div>
          <div class="comment-actions">
            <BButton variant="ghost" size="sm" @click="$router.push(`/article/${comment.articleID}`)">查看文章</BButton>
            <BButton variant="ghost" size="sm" @click="deleteComment(comment.id)">删除</BButton>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getCommentList, deleteComment as deleteCommentApi } from '@/api/modules/comment'
import BButton from '@/components/base/BButton/index.vue'

const userStore = useUserStore()
const comments = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

async function fetchComments(isLoadMore = false) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getCommentList({
      type: 2,
      articleID: 0,
      page: page.value,
      limit: 20
    })
    if (isLoadMore) {
      comments.value.push(...res.data.list)
    } else {
      comments.value = res.data.list
    }
    hasMore.value = res.data.list.length >= 20
    if (hasMore.value) {
      page.value++
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  } finally {
    loading.value = false
  }
}

function setupObserver() {
  if (!loadMoreRef.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !loading.value) {
      fetchComments(true)
    }
  }, { threshold: 0.1 })
  observer.observe(loadMoreRef.value)
}

function deleteComment(id: number) {
  if (!confirm('确定要删除这条评论吗？')) return
  deleteCommentApi(id).then(() => {
    fetchComments()
  }).catch((error) => {
    console.error('Failed to delete comment:', error)
  })
}

onMounted(() => {
  fetchComments()
  setupObserver()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.comments-page {
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

.comments-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $space-4;
  border-radius: $radius-md;
  background: $bg-secondary;
  transition: all $duration-fast;

  &:hover {
    background: $bg-hover;
  }
}

.comment-content {
  flex: 1;
}

.comment-text {
  font-size: $text-base;
  color: $text-primary;
  margin-bottom: $space-2;
}

.comment-meta {
  display: flex;
  gap: $space-4;
}

.meta-item {
  font-size: $text-xs;
  color: $text-tertiary;
}

.comment-actions {
  display: flex;
  gap: $space-2;
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
