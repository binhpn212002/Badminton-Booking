import type { ApiBooking } from '~/types/api'
import type { Booking } from '~/types/management'

function padHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function normalizeDate(value: string) {
  return value.slice(0, 10)
}

export function mapApiBookingToBooking(api: ApiBooking): Booking {
  return {
    id: String(api.id),
    code: api.code,
    customerName: api.customerName,
    customerPhone: api.customerPhone,
    court: api.courtName,
    courtId: String(api.courtId),
    courtCode: api.courtCode,
    date: normalizeDate(api.bookingDate),
    timeSlot: `${padHour(api.startHour)}–${padHour(api.endHour)}`,
    startHour: api.startHour,
    endHour: api.endHour,
    status: api.status,
    total: api.total,
    note: api.note || '',
    createdAt: api.createdAt,
  }
}
