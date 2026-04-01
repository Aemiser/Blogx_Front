<template>
  <div class="home-page">
    <div class="app-container">
      <!-- Banner 区域 -->
      <BannerSection />
      
      <!-- 排序选项 -->
      <SortTabs v-model="activeSort" @change="handleSortChange" />

      <!-- 分类标签 -->
<!--      <CategoryTabs v-model="activeCategory" @change="handleCategoryChange" />-->
      
      <div class="app-content">
        <div class="app-content__main">
          <!-- 文章列表 -->
          <ArticleList :category-id="activeCategory" :sort-type="activeSort" />
        </div>
        <aside class="app-content__sidebar">
          <!-- 作者推荐 -->
          <AuthorRecommend />
          <!-- 热门文章 -->
          <HotArticles />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BannerSection from './components/BannerSection.vue'
import SortTabs from './components/SortTabs.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import ArticleList from './components/ArticleList.vue'
import AuthorRecommend from '@/components/layout/AppSidebar/components/AuthorRecommend.vue'
import HotArticles from '@/components/layout/AppSidebar/components/HotArticles.vue'

const activeSort = ref(0)
const activeCategory = ref<number | undefined>(undefined)

function handleSortChange(value: number) {
  activeSort.value = value
}

function handleCategoryChange(id: number | undefined) {
  activeCategory.value = id
}
</script>

<style scoped lang="scss">
.home-page {
  padding-bottom: $space-8;
}
</style>
