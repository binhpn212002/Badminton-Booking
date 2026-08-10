import type { ApiActivity, ApiListResponse } from '~/types/api'
import { useApiClient } from '~/services/court'

export type ActivityWritePayload = {
  title: string
  startDate: string
  endDate: string
  status: string
}

export async function fetchActivities(params?: { page?: number; limit?: number }) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiActivity>>(`${base}/activities`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  })
}

export async function createActivity(payload: ActivityWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiActivity>(`${base}/activities`, {
    method: 'POST',
    body: payload,
    headers,
  })
}

export async function updateActivity(id: number, payload: Partial<ActivityWritePayload>) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiActivity>(`${base}/activities/${id}`, {
    method: 'PUT',
    body: payload,
    headers,
  })
}

export async function deleteActivity(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch(`${base}/activities/${id}`, {
    method: 'DELETE',
    headers,
  })
}
