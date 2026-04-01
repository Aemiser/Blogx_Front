<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <router-link to="/" class="register-logo">Blogx</router-link>
        <h1 class="register-title">注册</h1>
        <p class="register-subtitle">创建您的账号，开始分享</p>
      </div>
      
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input
            v-model="form.email"
            class="input"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="captcha-row">
            <input
              v-model="form.code"
              class="input"
              type="text"
              placeholder="请输入邮箱验证码"
              required
            />
            <BButton
              variant="secondary"
              size="md"
              :disabled="countdown > 0"
              @click="sendEmailCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </BButton>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.pwd"
            class="input"
            type="password"
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input
            v-model="confirmPwd"
            class="input"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>
        
        <BButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="loading"
          style="width: 100%"
        >
          注册
        </BButton>
      </form>
      
      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { sendEmail } from '@/api/modules/user'
import { getCaptcha } from '@/api/modules/captcha'
import { register } from '@/api/modules/user'
import BButton from '@/components/base/BButton/index.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const countdown = ref(0)
const confirmPwd = ref('')
const emailID = ref('')
const captchaID = ref('')

const form = reactive({
  email: '',
  code: '',
  pwd: ''
})

async function sendEmailCode() {
  if (!form.email) {
    alert('请输入邮箱')
    return
  }
  
  try {
    // 先获取验证码
    const captchaRes = await getCaptcha()
    captchaID.value = captchaRes.data.captchaID
    
    // 发送邮件
    const res = await sendEmail({
      type: 1,
      email: form.email,
      captchaID: captchaID.value,
      captchaCode: '' // 这里需要用户输入验证码
    })
    
    emailID.value = res.data.emailID
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('Send email failed:', error)
    alert(error.message || '发送验证码失败')
  }
}

async function handleRegister() {
  if (form.pwd !== confirmPwd.value) {
    alert('两次输入的密码不一致')
    return
  }
  
  loading.value = true
  try {
    await register({
      emailID: emailID.value,
      code: form.code,
      pwd: form.pwd
    })
    
    alert('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    console.error('Register failed:', error)
    alert(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  padding: $space-4;
}

.register-container {
  width: 100%;
  max-width: 400px;
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $space-8;
  box-shadow: $shadow-lg;
}

.register-header {
  text-align: center;
  margin-bottom: $space-8;
}

.register-logo {
  font-size: $text-4xl;
  font-weight: $font-weight-bold;
  color: $primary;
  text-decoration: none;
}

.register-title {
  font-size: $text-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-top: $space-4;
}

.register-subtitle {
  font-size: $text-sm;
  color: $text-tertiary;
  margin-top: $space-2;
}

.register-form {
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

.register-footer {
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
  .register-page {
    background: $dark-bg-primary;
  }
  
  .register-container {
    background: $dark-bg-card;
  }
}
</style>
