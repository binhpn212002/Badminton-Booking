import type { ApiBanner, ApiListResponse } from '~/types/api'
import { useApiClient } from '~/services/court'

export type BannerWritePayload = {
  sortOrder: number
  title: string
  image: string
  link: string
  status: string
}

export async function fetchBanners(params?: { page?: number; limit?: number }) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiBanner>>(`${base}/banners`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  })
}

export async function createBanner(payload: BannerWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBanner>(`${base}/banners`, {
    method: 'POST',
    body: payload,
    headers,
  })
}

export async function updateBanner(id: number, payload: Partial<BannerWritePayload>) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBanner>(`${base}/banners/${id}`, {
    method: 'PUT',
    body: payload,
    headers,
  })
}

export async function deleteBanner(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch(`${base}/banners/${id}`, {
    method: 'DELETE',
    headers,
  })
}
