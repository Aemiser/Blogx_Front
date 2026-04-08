import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage } from '@/utils'

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentTheme = 'default' | 'sakura' | 'miku' | 'hanabi'

export interface ThemeConfig {
  mode: ThemeMode
  accent: AccentTheme
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')
  const accent = ref<AccentTheme>('default')
  const isDark = ref(false)

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    saveConfig()
    applyTheme()
  }

  function setAccent(newAccent: AccentTheme) {
    accent.value = newAccent
    saveConfig()
    applyTheme()
  }

  function applyTheme() {
    if (mode.value === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = mode.value === 'dark'
    }
    
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    document.documentElement.setAttribute('data-accent', accent.value)
  }

  function toggleTheme() {
    const newMode = isDark.value ? 'light' : 'dark'
    setTheme(newMode)
  }

  function saveConfig() {
    const config: ThemeConfig = {
      mode: mode.value,
      accent: accent.value
    }
    storage.setTheme(config)
  }

  function loadConfig(): ThemeConfig {
    return storage.getTheme() as ThemeConfig
  }

  function init() {
    const saved = loadConfig()
    if (saved) {
      mode.value = saved.mode || 'light'
      accent.value = saved.accent || 'default'
    }
    applyTheme()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (mode.value === 'system') {
        isDark.value = e.matches
        document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
      }
    })
  }

  return {
    mode,
    accent,
    isDark,
    setTheme,
    setAccent,
    toggleTheme,
    init
  }
})
