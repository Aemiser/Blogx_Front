<template>
  <div class="settings-page">
    <div class="app-container">
      <h1 class="page-title">设置</h1>
      <div class="settings-content">
        <div class="settings-sidebar">
          <router-link to="/settings/profile" class="sidebar-item" exact-active-class="active">
            个人资料
          </router-link>
          <router-link to="/settings/account" class="sidebar-item" exact-active-class="active">
            账号安全
          </router-link>
          <router-link to="/settings/notification" class="sidebar-item" exact-active-class="active">
            通知设置
          </router-link>
        </div>
        <div class="settings-main card">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BButton from '@/components/base/BButton/index.vue'

const userStore = useUserStore()
const saving = ref(false)

const form = reactive({
  nickname: '',
  abstract: ''
})

async function handleSave() {
  saving.value = true
  try {
    await userStore.updateUserInfo(form)
    alert('保存成功')
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
</style>
