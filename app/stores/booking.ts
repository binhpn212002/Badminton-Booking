import { defineStore } from 'pinia'
import {
  createBooking,
  fetchBookings,
  type BookingWritePayload,
} from '~/services/booking'
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

  async function loadByCourtDate(courtId: number, bookingDate: string) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchBookings({
        page: 1,
        limit: 100,
        courtId,
        bookingDate,
      })
      bookings.value = res.data
        .map(mapApiBookingToBooking)
        .filter((item) => item.status !== 'cancelled')
      return bookings.value
    } catch (err) {
      error.value = readError(err, 'Không tải được lịch đặt sân')
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

  return {
    bookings,
    loading,
    submitting,
    error,
    loadByCourtDate,
    submit,
  }
})
