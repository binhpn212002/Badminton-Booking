import { defineStore } from 'pinia'
import {
  cancelBooking,
  createBooking,
  fetchBookings,
  updateBookingStatus,
  type BookingWritePayload,
} from '~/services/booking'
import type { ApiBookingStatus } from '~/types/api'
import type { Booking } from '~/types/management'
import { mapApiBookingToBooking } from '~/utils/map-booking'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  function readError(err: unknown, fallback: string) {
    const e = err as { data?: { message?: string | string[] }; message?: string }
    const msg = e?.data?.message ?? e?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (typeof msg === 'string' && msg) return msg
    return fallback
  }

  async function loadByCourtDate(courtId: number, orderDate: string) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchBookings({
        page: 1,
        limit: 100,
        courtId,
        orderDate,
      })
      bookings.value = res.data
        .map(mapApiBookingToBooking)
        .filter((b) => b.status !== 'cancelled')
      return bookings.value
    } catch (err) {
      error.value = readError(err, 'Không tải được lịch đặt sân')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadAll(params?: {
    page?: number
    limit?: number
    keyword?: string
    status?: ApiBookingStatus
  }) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchBookings({
        page: params?.page ?? 1,
        limit: params?.limit ?? 100,
        keyword: params?.keyword,
        status: params?.status,
      })
      bookings.value = res.data.map(mapApiBookingToBooking)
      return bookings.value
    } catch (err) {
      error.value = readError(err, 'Không tải được danh sách đặt sân')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submit(payload: BookingWritePayload) {
    submitting.value = true
    error.value = null
    try {
      const api = await createBooking(payload)
      const booking = mapApiBookingToBooking(api)
      bookings.value = [...bookings.value, booking]
      return booking
    } catch (err) {
      error.value = readError(err, 'Không tạo được đặt sân')
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function setStatus(id: string, status: ApiBookingStatus) {
    submitting.value = true
    error.value = null
    try {
      const api = await updateBookingStatus(Number(id), status)
      const booking = mapApiBookingToBooking(api)
      bookings.value = bookings.value.map((b) => (b.id === id ? booking : b))
      return booking
    } catch (err) {
      error.value = readError(err, 'Không cập nhật được trạng thái')
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function cancel(id: string) {
    submitting.value = true
    error.value = null
    try {
      const api = await cancelBooking(Number(id))
      const booking = mapApiBookingToBooking(api)
      bookings.value = bookings.value.map((b) => (b.id === id ? booking : b))
      return booking
    } catch (err) {
      error.value = readError(err, 'Không hủy được đặt sân')
      throw err
    } finally {
      submitting.value = false
    }
  }

  return {
    bookings,
    loading,
    submitting,
    error,
    loadByCourtDate,
    loadAll,
    submit,
    setStatus,
    cancel,
  }
})
