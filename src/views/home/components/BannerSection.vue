<template>
  <div class="banner-section" v-if="loading || banners.length > 0">
    <!-- 加载状态 -->
    <div v-if="loading" class="banner-skeleton">
      <div class="skeleton"></div>
    </div>
    
    <!-- 轮播图 -->
    <div v-else-if="banners.length > 0" class="banner-carousel">
      <div class="banner-carousel__track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="banner-carousel__slide"
          @click="handleClick(banner)"
        >
          <img :src="getCoverUrl(banner.cover)" :alt="banner.href" />
        </div>
      </div>
      <!-- 左右切换按钮 -->
      <button class="banner-carousel__prev" @click="prev" v-if="banners.length > 1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="banner-carousel__next" @click="next" v-if="banners.length > 1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <!-- 指示器 -->
      <div class="banner-carousel__dots" v-if="banners.length > 1">
        <button
          v-for="(_, index) in banners"
          :key="index"
          class="banner-carousel__dot"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Banner } from '@/types'
import { getBannerList } from '@/api/modules/banner'
import { getCoverUrl } from '@/utils/image'

const banners = ref<Banner[]>([])
const currentIndex = ref(0)
const loading = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

async function fetchBanners() {
  loading.value = true
  try {
    const res = await getBannerList({ show: true, limit: '5' })
    const list = res.data?.list
    banners.value = Array.isArray(list) ? list : []
    if (banners.value.length > 1) {
      startAutoplay()
    }
  } catch (error) {
    console.error('Failed to fetch banners:', error)
    banners.value = []
  } finally {
    loading.value = false
  }
}

function handleClick(banner: Banner) {
  if (banner.href) {
    window.open(banner.href, '_blank')
  }
}

function prev() {
  currentIndex.value = currentIndex.value === 0 ? banners.value.length - 1 : currentIndex.value - 1
  resetAutoplay()
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % banners.value.length
  resetAutoplay()
}

function goTo(index: number) {
  currentIndex.value = index
  resetAutoplay()
}

function startAutoplay() {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % banners.value.length
  }, 4000)
}

function resetAutoplay() {
  stopAutoplay()
  startAutoplay()
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  fetchBanners()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped lang="scss">
.banner-section {
  margin-bottom: $space-6;
}

// 骨架屏
.banner-skeleton {
  border-radius: $radius-lg;
  overflow: hidden;
  
  .skeleton {
    width: 100%;
    height: 280px;
  }
}

.banner-carousel {
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $bg-tertiary;
  
  &__track {
    display: flex;
    transition: transform $duration-slow $ease-default;
  }
  
  &__slide {
    flex: 0 0 100%;
    cursor: pointer;
    position: relative;
    
    img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.02);
    }
    
    // 底部渐变遮罩
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
      pointer-events: none;
    }
  }
  
  // 左右切换按钮
  &__prev,
  &__next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.3);
    border: none;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all $duration-fast;
    z-index: 10;
  }
  
  &__prev {
    left: 16px;
  }
  
  &__next {
    right: 16px;
  }
  
  &:hover &__prev,
  &:hover &__next {
    opacity: 1;
  }
  
  &__prev:hover,
  &__next:hover {
    background: rgba(0, 0, 0, 0.5);
  }
  
  &__dots {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
  }
  
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transition: all $duration-fast;
    cursor: pointer;
    border: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.8);
    }
    
    &.active {
      background: white;
      width: 24px;
      border-radius: 4px;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .banner-carousel__slide img,
  .banner-skeleton .skeleton {
    height: 180px;
  }
  
  .banner-carousel__prev,
  .banner-carousel__next {
    display: none;
  }
  
  .banner-carousel__dot {
    width: 6px;
    height: 6px;
    
    &.active {
      width: 18px;
    }
  }
}
</style>
