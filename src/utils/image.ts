const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

export function getFullImageUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}/${normalizedPath}`
}

export function getCoverUrl(cover: string): string {
  if (!cover) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="280" viewBox="0 0 1200 280"%3E%3Crect fill="%23f4f5f7" width="1200" height="280"/%3E%3Ctext fill="%239499a0" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EBlogx%3C/text%3E%3C/svg%3E'
  }
  return getFullImageUrl(cover)
}

export function getAvatarUrl(avatar: string): string {
  if (!avatar) return ''
  return getFullImageUrl(avatar)
}