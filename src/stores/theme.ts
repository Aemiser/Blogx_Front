import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage } from '@/utils'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeMode>('light')
  const isDark = ref(false)

  function setTheme(mode: ThemeMode) {
    theme.value = mode
    storage.setTheme(mode)
    applyTheme(mode)
  }

  function applyTheme(mode: ThemeMode) {
    if (mode === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = mode === 'dark'
    }
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  function toggleTheme() {
    const newTheme = isDark.value ? 'light' : 'dark'
    setTheme(newTheme)
  }

  function init() {
    const savedTheme = storage.getTheme() as ThemeMode | null
    if (savedTheme) {
      theme.value = savedTheme
    }
    applyTheme(theme.value)

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        isDark.value = e.matches
        document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
      }
    })
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    init
  }
})
