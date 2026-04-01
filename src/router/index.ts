import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/article/detail/index.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/editor',
    name: 'CreateArticle',
    component: () => import('@/views/article/editor/index.vue'),
    meta: { title: '写文章', requiresAuth: true }
  },
  {
    path: '/editor/:id',
    name: 'EditArticle',
    component: () => import('@/views/article/editor/index.vue'),
    meta: { title: '编辑文章', requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/user/profile/index.vue'),
    meta: { title: '用户主页' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/search/index.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/login/index.vue'),
    meta: { title: '登录', hideHeader: true, hideFooter: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/register/index.vue'),
    meta: { title: '注册', hideHeader: true, hideFooter: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/profile/index.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/message/index.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'ChatList',
    component: () => import('@/views/chat/index.vue'),
    meta: { title: '会话列表', requiresAuth: true }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/views/collections/index.vue'),
    meta: { title: '收藏夹', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: { title: '设置', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/dashboard/index.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/users/index.vue'),
    meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/articles',
    name: 'AdminArticles',
    component: () => import('@/views/admin/articles/index.vue'),
    meta: { title: '文章管理', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = to.meta.title ? `${to.meta.title} - Blogx` : 'Blogx'

  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'Forbidden' })
    return
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
