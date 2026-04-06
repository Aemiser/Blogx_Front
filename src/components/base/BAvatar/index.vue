<template>
  <div class="b-avatar" :class="[`b-avatar--${size}`]" :style="avatarStyle">
    <img v-if="src && !imgError" :src="processedSrc" :alt="alt" @error="handleError" />
    <span v-else class="b-avatar__placeholder">
      {{ placeholderText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getAvatarUrl } from '@/utils/image'

const props = withDefaults(defineProps<{
  src?: string
  size?: number | 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
  fallback?: string
}>(), {
  size: 'md',
  alt: 'avatar'
})

const imgError = ref(false)

watch(() => props.src, () => {
  imgError.value = false
})

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48
}

const actualSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size]
})

const avatarStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`,
  fontSize: `${actualSize.value * 0.4}px`
}))

const placeholderText = computed(() => {
  return props.alt?.charAt(0)?.toUpperCase() || '?'
})

const processedSrc = computed(() => {
  return getAvatarUrl(props.src || '')
})

function handleError() {
  imgError.value = true
}
</script>

<style scoped lang="scss">
.b-avatar {
  border-radius: 50%;
  overflow: hidden;
  background: $bg-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &__placeholder {
    color: $text-tertiary;
    font-weight: $font-weight-medium;
  }
}
</style>
