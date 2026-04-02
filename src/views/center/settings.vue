<template>
  <div class="settings-page">
    <div class="card">
      <h2 class="section-title">设置</h2>
      <div class="settings-section">
        <h3 class="subsection-title">个人资料</h3>
        <form class="settings-form" @submit.prevent="handleSaveProfile">
          <div class="form-group">
            <label class="form-label">昵称</label>
            <input
              v-model="profileForm.nickname"
              class="input"
              type="text"
              placeholder="请输入昵称"
            />
          </div>
          <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea
              v-model="profileForm.abstract"
              class="textarea"
              placeholder="介绍一下自己"
              rows="4"
            ></textarea>
          </div>
          <BButton variant="primary" :loading="savingProfile" @click="handleSaveProfile">
            保存修改
          </BButton>
        </form>
      </div>

      <div class="settings-section">
        <h3 class="subsection-title">账号安全</h3>
        <div class="security-item">
          <div class="security-info">
            <span class="security-label">邮箱</span>
            <span class="security-value">{{ userInfo?.email || '未绑定' }}</span>
          </div>
          <BButton variant="ghost" size="sm" @click="showBindEmailDialog = true">
            {{ userInfo?.email ? '更换邮箱' : '绑定邮箱' }}
          </BButton>
        </div>
        <div class="security-item">
          <div class="security-info">
            <span class="security-label">密码</span>
            <span class="security-value">已设置</span>
          </div>
          <BButton variant="ghost" size="sm" @click="showChangePasswordDialog = true">
            修改密码
          </BButton>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="subsection-title">隐私设置</h3>
        <div class="privacy-item">
          <div class="privacy-info">
            <span class="privacy-label">公开收藏夹</span>
            <span class="privacy-desc">其他用户可以查看你的收藏夹</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="privacyForm.openCollect" @change="updatePrivacy" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="privacy-item">
          <div class="privacy-info">
            <span class="privacy-label">公开关注列表</span>
            <span class="privacy-desc">其他用户可以查看你的关注列表</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="privacyForm.openFollow" @change="updatePrivacy" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="privacy-item">
          <div class="privacy-info">
            <span class="privacy-label">公开粉丝列表</span>
            <span class="privacy-desc">其他用户可以查看你的粉丝列表</span>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="privacyForm.openFans" @change="updatePrivacy" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUserDetail, updateUser, changePassword, bindEmail } from '@/api/modules/user'
import BButton from '@/components/base/BButton/index.vue'

const userInfo = ref<any>(null)
const savingProfile = ref(false)
const showBindEmailDialog = ref(false)
const showChangePasswordDialog = ref(false)

const profileForm = reactive({
  nickname: '',
  abstract: ''
})

const privacyForm = reactive({
  openCollect: true,
  openFollow: false,
  openFans: false
})

async function fetchUserInfo() {
  try {
    const res = await getUserDetail()
    userInfo.value = res.data
    profileForm.nickname = res.data.nickname
    profileForm.abstract = res.data.abstract
    privacyForm.openCollect = res.data.openCollect
    privacyForm.openFollow = res.data.openFollow
    privacyForm.openFans = res.data.openFans
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    await updateUser(profileForm)
    alert('保存成功')
    fetchUserInfo()
  } catch (error) {
    console.error('Save failed:', error)
  } finally {
    savingProfile.value = false
  }
}

async function updatePrivacy() {
  try {
    await updateUser(privacyForm)
  } catch (error) {
    console.error('Update privacy failed:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="scss">
.settings-page {
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

.settings-section {
  margin-bottom: $space-8;
  padding-bottom: $space-6;
  border-bottom: 1px solid $border;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.subsection-title {
  font-size: $text-lg;
  font-weight: $font-weight-medium;
  margin-bottom: $space-4;
  color: $text-primary;
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
  color: $text-secondary;
}

.security-item,
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }
}

.security-info,
.privacy-info {
  flex: 1;
}

.security-label,
.privacy-label {
  display: block;
  font-size: $text-base;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.security-value,
.privacy-desc {
  font-size: $text-sm;
  color: $text-secondary;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $bg-secondary;
    transition: $duration-fast;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: $duration-fast;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: $primary;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }
}
</style>
