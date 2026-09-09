import type {
  ApiBooking,
  ApiBookingReportSummary,
  ApiBookingStatus,
  ApiListResponse,
} from '~/types/api'
import { useApiClient } from '~/services/court'

export type BookingWritePayload = {
  courtId: number
  orderDate: string
  start: number
  end: number
  totalPrice?: number
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
  status?: ApiBookingStatus
  phoneNumber?: string
  userId?: number
  keyword?: string
}) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiBooking>>(`${base}/bookings`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      courtId: params?.courtId,
      orderDate: params?.orderDate,
      status: params?.status,
      phoneNumber: params?.phoneNumber,
      userId: params?.userId,
      keyword: params?.keyword,
    },
  })
}

export async function fetchBookingById(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBooking>(`${base}/bookings/${id}`, { headers })
}

export async function createBooking(payload: BookingWritePayload) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBooking>(`${base}/bookings`, {
    method: 'POST',
    body: payload,
    headers,
  })
}

export async function cancelBooking(id: number) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBooking>(`${base}/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers,
  })
}

export async function updateBookingStatus(id: number, status: ApiBookingStatus) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBooking>(`${base}/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status },
    headers,
  })
}

export async function fetchBookingReportSummary(params?: {
  from?: string
  to?: string
}) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiBookingReportSummary>(`${base}/bookings/reports/summary`, {
    headers,
    query: {
      from: params?.from,
      to: params?.to,
    },
  })
}
