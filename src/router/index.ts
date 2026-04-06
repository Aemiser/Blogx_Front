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
    path: '/preview',
    name: 'Preview',
    component: () => import('@/views/article/preview/index.vue'),
    meta: { title: '文章预览', hideHeader: true, hideFooter: true }
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
    redirect: '/center'
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import('@/views/center/index.vue'),
    meta: { title: '用户中心', requiresAuth: true },
    redirect: '/center/info',
    children: [
      {
        path: 'info',
        name: 'CenterInfo',
        component: () => import('@/views/center/info.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      },
      {
        path: 'collections',
        name: 'CenterCollections',
        component: () => import('@/views/center/collections.vue'),
        meta: { title: '收藏夹', requiresAuth: true }
      },
      {
        path: 'articles',
        name: 'CenterArticles',
        component: () => import('@/views/center/articles.vue'),
        meta: { title: '发布的文章', requiresAuth: true }
      },
      {
        path: 'comments',
        name: 'CenterComments',
        component: () => import('@/views/center/comments.vue'),
        meta: { title: '发布的评论', requiresAuth: true }
      },
      {
        path: 'history',
        name: 'CenterHistory',
        component: () => import('@/views/center/history.vue'),
        meta: { title: '浏览历史', requiresAuth: true }
      },
      {
        path: 'following',
        name: 'CenterFollowing',
        component: () => import('@/views/center/following.vue'),
        meta: { title: '我的关注', requiresAuth: true }
      },
      {
        path: 'fans',
        name: 'CenterFans',
        component: () => import('@/views/center/fans.vue'),
        meta: { title: '我的粉丝', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'CenterSettings',
        component: () => import('@/views/center/settings.vue'),
        meta: { title: '设置', requiresAuth: true }
      }
    ]
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
    component: () => import('@/views/admin/layout/index.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true },
    redirect: '/admin',
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/index.vue'),
        meta: { title: '数据统计', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/index.vue'),
        meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('@/views/admin/articles/index.vue'),
        meta: { title: '文章管理', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'articles/examine',
        name: 'AdminArticlesExamine',
        component: () => import('@/views/admin/articles/examine/index.vue'),
        meta: { title: '文章审核', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'banner',
        name: 'AdminBanner',
        component: () => import('@/views/admin/banner/index.vue'),
        meta: { title: 'Banner 管理', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'site',
        name: 'AdminSite',
        component: () => import('@/views/admin/site/index.vue'),
        meta: { title: '站点管理', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/logs/index.vue'),
        meta: { title: '日志查看', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'images',
        name: 'AdminImages',
        component: () => import('@/views/admin/images/index.vue'),
        meta: { title: '图片管理', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      },
      {
        path: 'upload',
        name: 'AdminUpload',
        component: () => import('@/views/admin/upload/index.vue'),
        meta: { title: '图片上传', requiresAuth: true, requiresAdmin: true, hideHeader: true, hideFooter: true }
      }
    ]
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
