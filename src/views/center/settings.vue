<template>
  <div class="settings-page">
    <div class="card">
      <h2 class="section-title">设置</h2>
      
      <div class="settings-section">
        <h3 class="subsection-title">头像</h3>
        <div class="avatar-section">
          <div class="avatar-preview">
            <img 
              v-if="avatarUrl || userInfo?.avatar" 
              :src="avatarUrl || getFullImageUrl(userInfo?.avatar)" 
              alt="头像预览" 
              class="avatar-img" 
            />
            <div v-else class="avatar-placeholder">
              <BAvatar :src="getAvatarUrl(userInfo?.avatar)" :size="80" />
            </div>
          </div>
          
          <div class="avatar-upload">
            <input 
              type="file" 
              ref="fileInput"
              accept="image/*" 
              @change="handleFileChange"
              style="display: none"
            />
            <BButton variant="primary" size="sm" @click="triggerUpload" :loading="uploading">
              {{ uploading ? '上传中...' : '更换头像' }}
            </BButton>
            
            <div v-if="uploading" class="progress-bar">
              <div class="progress-line"></div>
            </div>
            
            <p v-if="avatarUrl" class="upload-tip success">图片已更换，保存后生效</p>
            <p v-else class="upload-tip">支持 jpg、png、gif 格式，图片大小不超过5MB</p>
          </div>
        </div>
      </div>

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
          <BButton variant="primary" size="sm" :loading="savingProfile" @click="handleSaveProfile">
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

    <!-- 绑定邮箱弹窗 -->
    <div v-if="showBindEmailDialog" class="dialog-overlay" @click.self="showBindEmailDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ userInfo?.email ? '更换邮箱' : '绑定邮箱' }}</h3>
          <span class="dialog-close" @click="showBindEmailDialog = false">&times;</span>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <input
              v-model="emailForm.email"
              class="input"
              type="email"
              placeholder="请输入邮箱地址"
            />
          </div>
          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="code-input-group">
              <input
                v-model="emailForm.code"
                class="input"
                type="text"
                placeholder="请输入验证码"
                maxlength="6"
              />
              <BButton 
                variant="secondary" 
                size="sm" 
                :disabled="countdown > 0"
                @click="sendEmailCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </BButton>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <BButton variant="ghost" @click="showBindEmailDialog = false">取消</BButton>
          <BButton variant="primary" :loading="bindingEmail" @click="handleBindEmail">确认绑定</BButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUserDetail, updateUser, sendEmail, bindEmail } from '@/api/modules/user'
import { uploadImage } from '@/api/modules/banner'
import { getFullImageUrl, getAvatarUrl } from '@/utils/image'
import BButton from '@/components/base/BButton/index.vue'
import BAvatar from '@/components/base/BAvatar/index.vue'
import { toast } from '@/composables/useToast'

const userInfo = ref<any>(null)
const savingProfile = ref(false)
const uploading = ref(false)
const showBindEmailDialog = ref(false)
const showChangePasswordDialog = ref(false)
const bindingEmail = ref(false)
const countdown = ref(0)
let countdownTimer: any = null

const avatarUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const emailForm = reactive({
  email: '',
  code: '',
  emailID: ''
})

const profileForm = reactive({
  nickname: '',
  abstract: '',
  avatar: ''
})

const privacyForm = reactive({
  openCollect: true,
  openFollow: false,
  openFans: false
})

function triggerUpload() {
  fileInput.value?.click()
}

function getPathFromUrl(url: string) {
  if (!url) return ''
  const baseUrl = window.location.origin
  return url.replace(baseUrl, '')
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    toast.warning('请上传 jpg、png、gif 格式的图片')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.warning('图片大小不能超过 5MB')
    return
  }

  uploading.value = true
  
  try {
    const res = await uploadImage(file)
    const uploadedPath = res.data
    avatarUrl.value = getFullImageUrl(uploadedPath)
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error('图片上传失败')
    avatarUrl.value = ''
  } finally {
    uploading.value = false
  }
}

async function fetchUserInfo() {
  try {
    const res = await getUserDetail()
    userInfo.value = res.data
    profileForm.nickname = res.data.nickname
    profileForm.abstract = res.data.abstract
    profileForm.avatar = res.data.avatar ? getFullImageUrl(res.data.avatar) : ''
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
    const data: any = {
      nickname: profileForm.nickname,
      abstract: profileForm.abstract
    }
    
    if (avatarUrl.value) {
      const path = getPathFromUrl(avatarUrl.value)
      data.avatar = path
      profileForm.avatar = path
    }
    
    await updateUser(data)
    avatarUrl.value = ''
    toast.success('保存成功')
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

async function sendEmailCode() {
  if (!emailForm.email) {
    toast.warning('请输入邮箱地址')
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.email)) {
    toast.warning('请输入有效的邮箱地址')
    return
  }
  
  try {
    const res = await sendEmail({
      type: 1,
      email: emailForm.email,
      captchaID: '',
      captchaCode: ''
    })
    emailForm.emailID = res.data.emailID
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
    toast.success('验证码已发送到您的邮箱')
  } catch (error: any) {
    console.error('Send email failed:', error)
    toast.error(error.response?.data?.msg || '发送失败')
  }
}

async function handleBindEmail() {
  if (!emailForm.email) {
    toast.warning('请输入邮箱地址')
    return
  }
  if (!emailForm.code) {
    toast.warning('请输入验证码')
    return
  }
  
  bindingEmail.value = true
  try {
    await bindEmail({
      emailID: emailForm.emailID,
      emailCode: emailForm.code
    })
    toast.success('绑定成功')
    showBindEmailDialog.value = false
    emailForm.email = ''
    emailForm.code = ''
    fetchUserInfo()
  } catch (error: any) {
    console.error('Bind email failed:', error)
    toast.error(error.response?.data?.msg || '绑定失败')
  } finally {
    bindingEmail.value = false
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

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $border;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
}

.progress-bar {
  width: 200px;
  height: 2px;
  background: $bg-secondary;
  border-radius: 1px;
  overflow: hidden;
}

.progress-line {
  height: 100%;
  width: 30%;
  background: $primary;
  animation: loading 1s ease-in-out infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

.avatar-upload .upload-tip {
  font-size: $text-xs;
  color: $text-tertiary;
  
  &.success {
    color: $success;
  }
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

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: $bg-card;
  border-radius: $radius-lg;
  width: 400px;
  max-width: 90vw;
  box-shadow: $shadow-xl;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 $space-5;
  border-bottom: 1px solid $border;

  h3 {
    font-size: $text-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.dialog-close {
  font-size: $text-2xl;
  color: $text-tertiary;
  cursor: pointer;
  line-height: 1;
  
  &:hover {
    color: $text-primary;
  }
}

.dialog-body {
  padding: $space-5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
  padding: $space-4 $space-5;
  border-top: 1px solid $border;
}

.code-input-group {
  display: flex;
  gap: $space-3;
  
  .input {
    flex: 1;
  }
}
</style>
