import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams, UpdateUserParams } from '@/types'
import * as userApi from '@/api/modules/user'
import { storage } from '@/utils'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 2)

  async function login(params: LoginParams) {
    const res = await userApi.login(params)
    token.value = res.data
    storage.setToken(res.data)
    await fetchUserInfo()
    return res
  }

  async function fetchUserInfo() {
    try {
      const res = await userApi.getUserDetail()
      userInfo.value = res.data
      storage.setUser(res.data)
      return res
    } catch (error) {
      logout()
      throw error
    }
  }

  async function updateUserInfo(data: UpdateUserParams) {
    const res = await userApi.updateUser(data)
    await fetchUserInfo()
    return res
  }

  function logout() {
    userInfo.value = null
    token.value = null
    storage.clear()
  }

  function init() {
    const savedToken = storage.getToken()
    const savedUser = storage.getUser<UserInfo>()
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUser) {
      userInfo.value = savedUser
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isAdmin,
    login,
    fetchUserInfo,
    updateUserInfo,
    logout,
    init
  }
}, {
  persist: false
})
