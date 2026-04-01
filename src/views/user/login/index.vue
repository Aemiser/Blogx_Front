<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <router-link to="/" class="login-logo">Blogx</router-link>
        <h1 class="login-title">登录</h1>
        <p class="login-subtitle">欢迎回来，请登录您的账号</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.val"
            class="input"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.pwd"
            class="input"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-group" v-if="needCaptcha">
          <label class="form-label">验证码</label>
          <div class="captcha-row">
            <input
              v-model="form.captchaCode"
              class="input"
              type="text"
              placeholder="请输入验证码"
            />
            <img
              v-if="captchaImg"
              :src="captchaImg"
              class="captcha-img"
              @click="fetchCaptcha"
              alt="验证码"
            />
          </div>
        </div>
        
        <BButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="loading"
          style="width: 100%"
        >
          登录
        </BButton>
      </form>
      
      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register" class="link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/api/modules/captcha'
import BButton from '@/components/base/BButton/index.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const needCaptcha = ref(false)
const captchaImg = ref('')
const captchaID = ref('')

const form = reactive({
  val: '',
  pwd: '',
  captchaID: '',
  captchaCode: ''
})

async function fetchCaptcha() {
  try {
    const res = await getCaptcha()
    captchaID.value = res.data.captchaID
    captchaImg.value = res.data.captcha
    needCaptcha.value = true
  } catch (error) {
    console.error('Failed to fetch captcha:', error)
  }
}

async function handleLogin() {
  loading.value = true
  try {
    const params: any = {
      val: form.val,
      pwd: form.pwd
    }
    
    if (needCaptcha.value) {
      params.captchaID = captchaID.value
      params.captchaCode = form.captchaCode
    }
    
    await userStore.login(params)
    
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    console.error('Login failed:', error)
    alert(error.message || '登录失败')
    fetchCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 如果已登录，跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  padding: $space-4;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-8;
  box-shadow: $shadow-lg;
}

.login-header {
  text-align: center;
  margin-bottom: $space-8;
}

.login-logo {
  font-size: $text-4xl;
  font-weight: $font-weight-bold;
  color: $primary;
  text-decoration: none;
}

.login-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-top: $space-4;
}

.login-subtitle {
  font-size: $text-sm;
  color: $text-tertiary;
  margin-top: $space-2;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.form-label {
  font-size: $text-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.captcha-row {
  display: flex;
  gap: $space-3;
  
  .input {
    flex: 1;
  }
}

.captcha-img {
  height: 40px;
  border-radius: $radius-md;
  cursor: pointer;
}

.login-footer {
  text-align: center;
  margin-top: $space-6;
  font-size: $text-sm;
  color: $text-tertiary;
  
  .link {
    color: $primary;
    margin-left: $space-1;
  }
}

[data-theme="dark"] {
  .login-page {
    background: $dark-bg-primary;
  }
  
  .login-container {
    background: $dark-bg-card;
  }
}
</style>
