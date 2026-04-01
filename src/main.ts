import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'
import { useUserStore } from './stores/user'
import { useThemeStore } from './stores/theme'
import { useSiteStore } from './stores/site'
import './styles/index.scss'

const app = createApp(App)

app.use(pinia)
app.use(router)

// 初始化 stores
const userStore = useUserStore()
const themeStore = useThemeStore()
const siteStore = useSiteStore()

userStore.init()
themeStore.init()

// 尝试获取站点配置
siteStore.fetchSiteInfo().catch(() => {
  console.warn('Failed to fetch site info')
})

// 如果已登录，获取用户信息
if (userStore.isLoggedIn) {
  userStore.fetchUserInfo().catch(() => {
    console.warn('Failed to fetch user info')
  })
}

app.mount('#app')
