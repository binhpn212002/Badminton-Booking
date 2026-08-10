import type { ApiFood, ApiListResponse } from '~/types/api'
import { useApiClient } from '~/services/court'

export type FoodWritePayload = {
  name: string
  category: string
  price: number
  stock: number
  status: string
}

export async function fetchFoods(params?: { page?: number; limit?: number }) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiFood>>(`${base}/foods`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  })
}

export async function createFood(payload: FoodWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiFood>(`${base}/foods`, {
    method: 'POST',
    body: payload,
    headers,
  })
}

export async function updateFood(id: number, payload: Partial<FoodWritePayload>) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiFood>(`${base}/foods/${id}`, {
    method: 'PUT',
    body: payload,
    headers,
  })
}

export async function deleteFood(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch(`${base}/foods/${id}`, {
    method: 'DELETE',
    headers,
  })
}
