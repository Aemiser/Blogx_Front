import { ref } from 'vue'
import Toast from '@/components/base/Toast/index.vue'

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

export function useToast() {
  const show = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const ref = window.__toastRef__ as any
    ref?.value?.show(message, type, duration)
  }

  const success = (message: string, duration = 3000) => {
    show(message, 'success', duration)
  }

  const error = (message: string, duration = 3000) => {
    show(message, 'error', duration)
  }

  const warning = (message: string, duration = 3000) => {
    show(message, 'warning', duration)
  }

  const info = (message: string, duration = 3000) => {
    show(message, 'info', duration)
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    toastRef
  }
}

export const toast = {
  success: (message: string) => useToast().success(message),
  error: (message: string) => useToast().error(message),
  warning: (message: string) => useToast().warning(message),
  info: (message: string) => useToast().info(message)
}