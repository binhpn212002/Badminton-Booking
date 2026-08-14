import type { ApiBooking } from '~/types/api'
import type { Booking } from '~/types/management'

function padHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function normalizeDate(value: string) {
  return String(value).slice(0, 10)
}

export function mapApiBookingToBooking(api: ApiBooking): Booking {
  const date = normalizeDate(api.orderDate)
  return {
    id: String(api.id),
    code: `BK${String(api.id).padStart(6, '0')}`,
    customerName: api.name,
    customerPhone: api.phoneNumber,
    court: api.court?.name || '',
    courtId: String(api.court?.id ?? ''),
    courtCode: api.court?.courtCode || '',
    date,
    timeSlot: `${padHour(api.start)}–${padHour(api.end)}`,
    startHour: api.start,
    endHour: api.end,
    status: 'confirmed',
    total: api.totalPrice,
    note: api.note || '',
    createdAt: api.createdAt,
  }
}
