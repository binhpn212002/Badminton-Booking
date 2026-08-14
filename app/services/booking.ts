import type { ApiBooking, ApiListResponse } from '~/types/api'
import { useApiClient } from '~/services/court'

export type BookingWritePayload = {
  courtId: number
  orderDate: string
  start: number
  end: number
  totalPrice: number
  name: string
  phoneNumber: string
  note?: string
  voucherCode?: string
}

export async function fetchBookings(params?: {
  page?: number
  limit?: number
  courtId?: number
  orderDate?: string
}) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiBooking>>(`${base}/bookings`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      courtId: params?.courtId,
      orderDate: params?.orderDate,
    },
  })
}

export async function createBooking(payload: BookingWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBooking>(`${base}/bookings`, {
    method: 'POST',
    body: payload,
    headers,
  })
}
