<template>
  <div class="admin-articles">
    <div class="app-container">
      <div class="page-header">
        <h1 class="page-title">文章管理</h1>
      </div>
      
      <div class="card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>作者</th>
                <th>浏览</th>
                <th>评论</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in articles" :key="article.id">
                <td>{{ article.id }}</td>
                <td class="title-cell">{{ article.title }}</td>
                <td>{{ article.nickName }}</td>
                <td>{{ article.lookCount }}</td>
                <td>{{ article.commentCount }}</td>
                <td>
                  <span class="tag" :class="getStatusClass(article.status)">
                    {{ getStatusName(article.status) }}
                  </span>
                </td>
                <td>{{ formatRelativeTime(article.createdAt) }}</td>
                <td>
                  <button class="action-link" @click="viewArticle(article.id)">查看</button>
                  <button class="action-link danger" @click="deleteArticle(article.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Article } from '@/types'
import { getArticleList, adminDeleteArticle } from '@/api/modules/article'
import { formatRelativeTime } from '@/utils'

const router = useRouter()
const articles = ref<Article[]>([])

async function fetchArticles() {
  try {
    const res = await getArticleList({
      type: 3,
      page: 1,
      limit: 50
    })
    articles.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  }
}

function getStatusName(status: number) {
  const map: Record<number, string> = {
    1: '草稿',
    2: '待审核',
    3: '已发布',
    4: '已拒绝'
  }
  return map[status] || '未知'
}

function getStatusClass(status: number) {
  const map: Record<number, string> = {
    1: 'tag--default',
    2: 'tag--warning',
    3: 'tag--success',
    4: 'tag--error'
  }
  return map[status] || ''
}

function viewArticle(id: number) {
  router.push(`/article/${id}`)
}

async function deleteArticle(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return
  
  try {
    await adminDeleteArticle([id])
    articles.value = articles.value.filter(a => a.id !== id)
    alert('删除成功')
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.admin-articles {
  padding: $space-6 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-6;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: $space-3 $space-4;
    text-align: left;
    border-bottom: 1px solid $border-light;
  }
  
  th {
    font-weight: $font-weight-medium;
    color: $text-secondary;
    font-size: $text-sm;
  }
  
  td {
    font-size: $text-sm;
  }
  
  tbody tr:hover {
    background: $bg-hover;
  }
}

.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-link {
  color: $primary;
  font-size: $text-sm;
  cursor: pointer;
  margin-right: $space-2;
  
  &:hover {
    text-decoration: underline;
  }
  
  &.danger {
    color: $error;
  }
}
</style>
