import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SiteInfo } from '@/types'
import * as siteApi from '@/api/modules/site'

export const useSiteStore = defineStore('site', () => {
  const siteInfo = ref<SiteInfo | null>(null)
  const loading = ref(false)

  async function fetchSiteInfo() {
    loading.value = true
    try {
      const res = await siteApi.getSiteInfo()
      siteInfo.value = res.data
      return res
    } finally {
      loading.value = false
    }
  }

  return {
    siteInfo,
    loading,
    fetchSiteInfo
  }
})
