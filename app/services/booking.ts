import type { ApiBooking, ApiListResponse } from '~/types/api'
import { useApiClient } from '~/services/court'

export type BookingWritePayload = {
  customerName: string
  customerPhone: string
  courtId: number
  bookingDate: string
  startHour: number
  endHour: number
  total: number
  note?: string
  status?: string
}

export async function fetchBookings(params?: {
  page?: number
  limit?: number
  courtId?: number
  bookingDate?: string
  status?: string
  code?: string
}) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiBooking>>(`${base}/bookings`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      courtId: params?.courtId,
      bookingDate: params?.bookingDate,
      status: params?.status,
      code: params?.code,
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

export async function updateBooking(
  id: number,
  payload: Partial<BookingWritePayload>,
) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBooking>(`${base}/bookings/${id}`, {
    method: 'PUT',
    body: payload,
    headers,
  })
}

export async function deleteBooking(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch(`${base}/bookings/${id}`, {
    method: 'DELETE',
    headers,
  })
}
