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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getCommentList, deleteComment as deleteCommentApi } from '@/api/modules/comment'
import BButton from '@/components/base/BButton/index.vue'

const userStore = useUserStore()
const comments = ref<any[]>([])

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

async function fetchComments() {
  try {
    const res = await getCommentList({
      type: 2,
      articleID: 0,
      page: 1,
      limit: 20
    })
    comments.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  }
}

async function deleteComment(id: number) {
  if (!confirm('确定要删除这条评论吗？')) return
  try {
    await deleteCommentApi(id)
    fetchComments()
  } catch (error) {
    console.error('Failed to delete comment:', error)
  }
}

onMounted(() => {
  fetchComments()
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
</style>
