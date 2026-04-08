<template>
  <div class="settings-page">
    <div class="app-container">
      <h1 class="page-title">设置</h1>
      <div class="settings-content">
        <div class="settings-sidebar">
          <router-link to="/settings" class="sidebar-item" exact-active-class="active">
            个人资料
          </router-link>
          <router-link to="/settings/theme" class="sidebar-item" exact-active-class="active">
            主题设置
          </router-link>
        </div>
        <div class="settings-main card">
          <div v-if="currentRoute === '/settings'">
            <h2 class="settings-section-title">个人资料</h2>
            <form class="settings-form" @submit.prevent="handleSave">
              <div class="form-group">
                <label class="form-label">昵称</label>
                <input
                  v-model="form.nickname"
                  class="input"
                  type="text"
                  placeholder="请输入昵称"
                />
              </div>
              <div class="form-group">
                <label class="form-label">个人简介</label>
                <textarea
                  v-model="form.abstract"
                  class="textarea"
                  placeholder="介绍一下自己"
                  rows="4"
                ></textarea>
              </div>
              <BButton variant="primary" :loading="saving" @click="handleSave">
                保存修改
              </BButton>
            </form>
          </div>
          <div v-else-if="currentRoute === '/settings/theme'">
            <h2 class="settings-section-title">主题设置</h2>
            <div class="theme-section">
              <div class="theme-group">
                <h3 class="theme-group-title">外观模式</h3>
                <div class="theme-options">
                  <div 
                    class="theme-option" 
                    :class="{ active: themeStore.mode === 'light' }"
                    @click="themeStore.setTheme('light')"
                  >
                    <div class="theme-option-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    </div>
                    <span class="theme-option-name">浅色模式</span>
                  </div>
                  <div 
                    class="theme-option" 
                    :class="{ active: themeStore.mode === 'dark' }"
                    @click="themeStore.setTheme('dark')"
                  >
                    <div class="theme-option-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    </div>
                    <span class="theme-option-name">深色模式</span>
                  </div>
                </div>
              </div>
              
              <div class="theme-group">
                <h3 class="theme-group-title">主题风格</h3>
                <p class="theme-group-desc">选择你喜欢的二次元风格主题</p>
                <div class="theme-options accent-options">
                  <div 
                    class="theme-option accent-option" 
                    :class="{ active: themeStore.accent === 'default' }"
                    @click="themeStore.setAccent('default')"
                  >
                    <div class="theme-option-preview default-preview"></div>
                    <span class="theme-option-name">默认风格</span>
                  </div>
                  <div 
                    class="theme-option accent-option" 
                    :class="{ active: themeStore.accent === 'sakura' }"
                    @click="themeStore.setAccent('sakura')"
                  >
                    <div class="theme-option-preview sakura-preview"></div>
                    <span class="theme-option-name">樱花粉</span>
                  </div>
                  <div 
                    class="theme-option accent-option" 
                    :class="{ active: themeStore.accent === 'miku' }"
                    @click="themeStore.setAccent('miku')"
                  >
                    <div class="theme-option-preview miku-preview"></div>
                    <span class="theme-option-name">初音蓝</span>
                  </div>
                  <div 
                    class="theme-option accent-option" 
                    :class="{ active: themeStore.accent === 'hanabi' }"
                    @click="themeStore.setAccent('hanabi')"
                  >
                    <div class="theme-option-preview hanabi-preview"></div>
                    <span class="theme-option-name">烟花紫</span>
                  </div>
                </div>
              </div>
              
              <div class="theme-preview">
                <h3 class="theme-preview-title">主题预览</h3>
                <div class="theme-preview-card">
                  <div class="preview-header">
                    <div class="preview-avatar"></div>
                    <div class="preview-info">
                      <div class="preview-name"></div>
                      <div class="preview-desc"></div>
                    </div>
                  </div>
                  <div class="preview-content"></div>
                  <div class="preview-actions">
                    <div class="preview-btn"></div>
                    <div class="preview-btn"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import BButton from '@/components/base/BButton/index.vue'
import { toast } from '@/composables/useToast'

const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const saving = ref(false)

const currentRoute = computed(() => {
  return route.path
})

const form = reactive({
  nickname: '',
  abstract: ''
})

async function handleSave() {
  saving.value = true
  try {
    await userStore.updateUserInfo(form)
    toast.success('保存成功')
  } catch (error) {
    console.error('Save failed:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    form.nickname = userStore.userInfo.nickname
    form.abstract = userStore.userInfo.abstract
  }
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: $space-6 0;
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.settings-content {
  display: flex;
  gap: $space-6;
}

.settings-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.sidebar-item {
  display: block;
  padding: $space-3 $space-4;
  border-radius: $radius-md;
  color: $text-secondary;
  transition: all $duration-fast;
  
  &:hover {
    background: $bg-hover;
    color: $text-primary;
  }
  
  &.active {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

.settings-main {
  flex: 1;
  padding: $space-6;
}

.settings-section-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-6;
}

.settings-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: $space-5;
}

.form-label {
  display: block;
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  margin-bottom: $space-2;
}

.theme-section {
  max-width: 600px;
}

.theme-group {
  margin-bottom: $space-8;
}

.theme-group-title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-2;
  color: $text-primary;
}

.theme-group-desc {
  font-size: $text-sm;
  color: $text-tertiary;
  margin-bottom: $space-4;
}

.theme-options {
  display: flex;
  gap: $space-4;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  padding: $space-4;
  border-radius: $radius-lg;
  border: 2px solid $border;
  cursor: pointer;
  transition: all $duration-fast;
  min-width: 100px;
  
  &:hover {
    border-color: rgba($primary, 0.5);
    background: $bg-hover;
  }
  
  &.active {
    border-color: $primary;
    background: rgba($primary, 0.08);
  }
}

.theme-option-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background: $bg-secondary;
  color: $text-secondary;
  
  .active & {
    background: $primary;
    color: white;
  }
}

.theme-option-name {
  font-size: $text-sm;
  color: $text-secondary;
  
  .active & {
    color: $primary;
    font-weight: $font-weight-medium;
  }
}

.accent-option {
  padding: $space-3;
}

.theme-option-preview {
  width: 60px;
  height: 40px;
  border-radius: $radius-md;
  overflow: hidden;
}

.default-preview {
  background: linear-gradient(135deg, #00a1d6 0%, #fb7299 100%);
}

.sakura-preview {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff9ec4 100%);
}

.miku-preview {
  background: linear-gradient(135deg, #00e5ff 0%, #00c853 100%);
}

.hanabi-preview {
  background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);
}

.theme-preview {
  margin-top: $space-6;
  padding-top: $space-6;
  border-top: 1px solid $border-light;
}

.theme-preview-title {
  font-size: $text-base;
  font-weight: $font-weight-semibold;
  margin-bottom: $space-4;
}

.theme-preview-card {
  background: $bg-card;
  border: 1px solid $border;
  border-radius: $radius-lg;
  padding: $space-4;
}

.preview-header {
  display: flex;
  gap: $space-3;
  margin-bottom: $space-3;
}

.preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: $radius-full;
  background: $bg-tertiary;
}

.preview-info {
  flex: 1;
}

.preview-name {
  height: 14px;
  width: 100px;
  background: $bg-tertiary;
  border-radius: $radius-sm;
  margin-bottom: $space-2;
}

.preview-desc {
  height: 10px;
  width: 160px;
  background: $bg-tertiary;
  border-radius: $radius-sm;
}

.preview-content {
  height: 60px;
  background: $bg-secondary;
  border-radius: $radius-md;
  margin-bottom: $space-3;
}

.preview-actions {
  display: flex;
  gap: $space-2;
}

.preview-btn {
  width: 60px;
  height: 28px;
  background: $primary;
  border-radius: $radius-md;
  opacity: 0.8;
}

[data-theme="dark"] {
  .theme-option-icon {
    background: $dark-bg-tertiary;
  }
  
  .theme-option-preview {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .theme-preview-card {
    background: $dark-bg-card;
    border-color: $dark-border;
  }
  
  .preview-name,
  .preview-desc,
  .preview-content {
    background: $dark-bg-tertiary;
  }
}
</style>
