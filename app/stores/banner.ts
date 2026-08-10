import { defineStore } from 'pinia'
import { deleteBanner, fetchBanners } from '~/services/banner'
import type { Banner } from '~/types/management'
import { mapApiBannerToBanner } from '~/utils/map-banner'

export const useBannerStore = defineStore('banner', () => {
  const banners = ref<Banner[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function loadBanners(
    force = false,
    params?: { page?: number; limit?: number },
  ) {
    if (loaded.value && !force && !params) return banners.value
    loading.value = true
    error.value = null
    try {
      const res = await fetchBanners({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
      })
      banners.value = res.data
        .map(mapApiBannerToBanner)
        .sort((a, b) => a.sort - b.sort)
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      loaded.value = true
      return banners.value
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Không tải được danh sách banner'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    await deleteBanner(Number(id))
    banners.value = banners.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function upsert(banner: Banner) {
    const index = banners.value.findIndex((item) => item.id === banner.id)
    if (index >= 0) banners.value[index] = banner
    else {
      banners.value = [banner, ...banners.value]
      total.value += 1
    }
    banners.value = [...banners.value].sort((a, b) => a.sort - b.sort)
  }

  return {
    banners,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    loadBanners,
    remove,
    upsert,
  }
})
