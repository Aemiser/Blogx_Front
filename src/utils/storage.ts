const TOKEN_KEY = 'blogx_token'
const USER_KEY = 'blogx_user'
const THEME_KEY = 'blogx_theme'

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  getUser<T>(): T | null {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  setUser<T>(user: T): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY)
  },

  getTheme<T>(): T | null {
    const theme = localStorage.getItem(THEME_KEY)
    return theme ? JSON.parse(theme) : null
  },

  setTheme<T>(theme: T): void {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme))
  },

  removeTheme(): void {
    localStorage.removeItem(THEME_KEY)
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(THEME_KEY)
  }
}
