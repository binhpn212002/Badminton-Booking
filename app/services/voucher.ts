import type { ApiListResponse, ApiVoucher } from '~/types/api'
import { useApiClient } from '~/services/court'

export type VoucherWritePayload = {
  code: string
  type: string
  value: number
  minOrderAmount: number
  usedCount?: number
  maxUsage: number
  startDate: string
  endDate: string
  status: string
}

export async function fetchVouchers(params?: { page?: number; limit?: number }) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiVoucher>>(`${base}/vouchers`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  })
}

export async function createVoucher(payload: VoucherWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiVoucher>(`${base}/vouchers`, {
    method: 'POST',
    body: payload,
    headers,
  })
}

export async function updateVoucher(id: number, payload: Partial<VoucherWritePayload>) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiVoucher>(`${base}/vouchers/${id}`, {
    method: 'PUT',
    body: payload,
    headers,
  })
}

export async function deleteVoucher(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch(`${base}/vouchers/${id}`, {
    method: 'DELETE',
    headers,
  })
}
