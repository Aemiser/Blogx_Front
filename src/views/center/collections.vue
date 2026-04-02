<template>
  <div class="collections-page">
    <div class="card">
      <div class="page-header">
        <h2 class="section-title">收藏夹</h2>
        <BButton variant="primary" size="sm" @click="showCreateDialog = true">
          新建收藏夹
        </BButton>
      </div>
      <div v-if="collections.length === 0" class="empty">
        <p>暂无收藏夹</p>
      </div>
      <div v-else class="collections-list">
        <div v-for="collection in collections" :key="collection.id" class="collection-item">
          <div class="collection-info">
            <h3 class="collection-title">{{ collection.title }}</h3>
            <p class="collection-abstract">{{ collection.abstract || '暂无描述' }}</p>
            <span class="collection-count">{{ collection.ArticleCount }}篇文章</span>
          </div>
          <div class="collection-actions">
            <BButton variant="ghost" size="sm" @click="editCollection(collection)">编辑</BButton>
            <BButton variant="ghost" size="sm" @click="deleteCollection(collection.id)">删除</BButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCollectionList, deleteCollection as deleteCollectionApi } from '@/api/modules/article'
import BButton from '@/components/base/BButton/index.vue'

const collections = ref<any[]>([])
const showCreateDialog = ref(false)

async function fetchCollections() {
  try {
    const res = await getCollectionList({
      type: 1,
      page: 1,
      limit: 20
    })
    collections.value = res.data.list
  } catch (error) {
    console.error('Failed to fetch collections:', error)
  }
}

function editCollection(collection: any) {
  console.log('Edit collection:', collection)
}

async function deleteCollection(id: number) {
  if (!confirm('确定要删除这个收藏夹吗？')) return
  try {
    await deleteCollectionApi({ idList: [id] })
    fetchCollections()
  } catch (error) {
    console.error('Failed to delete collection:', error)
  }
}

onMounted(() => {
  fetchCollections()
})
</script>

<style scoped lang="scss">
.collections-page {
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

.collections-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.collection-item {
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

.collection-info {
  flex: 1;
}

.collection-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.collection-abstract {
  font-size: $text-sm;
  color: $text-secondary;
  margin-bottom: $space-2;
}

.collection-count {
  font-size: $text-xs;
  color: $text-tertiary;
}

.collection-actions {
  display: flex;
  gap: $space-2;
}

.empty {
  text-align: center;
  padding: $space-12;
  color: $text-tertiary;
}
</style>
