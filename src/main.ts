import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'
import { useUserStore } from './stores/user'
import { useThemeStore } from './stores/theme'
import { useSiteStore } from './stores/site'
import './styles/index.scss'

// 创建应用
const app = createApp(App)

// 先初始化 stores
app.use(pinia)

const userStore = useUserStore()
const themeStore = useThemeStore()
const siteStore = useSiteStore()

// 初始化 userStore（在 pinia 初始化之后）
userStore.init()
themeStore.init()

// 使用 router
app.use(router)

// 站点配置
siteStore.fetchSiteInfo().catch(() => {
  console.warn('Failed to fetch site info')
})

app.mount('#app')
