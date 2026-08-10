import type { ApiDevice, ApiListResponse } from '~/types/api'
import { useApiClient } from '~/services/court'

export type DeviceWritePayload = {
  sku: string
  name: string
  category: string
  stock: number
  price: number
  status: string
}

export async function fetchDevices(params?: { page?: number; limit?: number }) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiDevice>>(`${base}/devices`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  })
}

export async function createDevice(payload: DeviceWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiDevice>(`${base}/devices`, {
    method: 'POST',
    body: payload,
    headers,
  })
}

export async function updateDevice(id: number, payload: Partial<DeviceWritePayload>) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiDevice>(`${base}/devices/${id}`, {
    method: 'PUT',
    body: payload,
    headers,
  })
}

export async function deleteDevice(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch(`${base}/devices/${id}`, {
    method: 'DELETE',
    headers,
  })
}
