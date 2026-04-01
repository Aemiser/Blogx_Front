import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
    roles?: number[]
    hideHeader?: boolean
    hideFooter?: boolean
    hideSidebar?: boolean
  }
}
