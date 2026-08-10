/** Generic response cho các API danh sách (paginate). */
export type ApiListResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

/** Timestamps chuẩn từ BE. */
export type ApiTimestamps = {
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ApiCourtStatus = 'active' | 'inactive' | 'under_maintenance'

export type ApiCourtSurface =
  | 'pvc'
  | 'hardcourt'
  | 'clay'
  | 'carpet'
  | 'synthetic_grass'

export const API_COURT_SURFACE_OPTIONS: Array<{
  value: ApiCourtSurface
  label: string
}> = [
  { value: 'pvc', label: 'PVC' },
  { value: 'hardcourt', label: 'Hardcourt' },
  { value: 'clay', label: 'Clay' },
  { value: 'carpet', label: 'Carpet' },
  { value: 'synthetic_grass', label: 'Synthetic grass' },
]

export type ApiCourtTimeSlot = ApiTimestamps & {
  id: number
  start: number
  end: number
  price: number
}

export type ApiCourt = ApiTimestamps & {
  id: number
  name: string
  location: string
  courtCode: string
  status: ApiCourtStatus
  imageUrl: string
  description: string
  width: number
  height: number
  peopleCapacity: number
  surface: ApiCourtSurface
  roofHeight: number
  isIndoor: boolean
  hasConditioning: boolean
  hasFans: boolean
  isActive: boolean
  isMaintenance: boolean
  openingHours: string
  endingHours: string
  reasonForMaintenance: string
  timeSlots: ApiCourtTimeSlot[]
}

export type ApiDevice = ApiTimestamps & {
  id: number
  sku: string
  name: string
  category: string
  stock: number
  price: number
  status: string
}

export type ApiFood = ApiTimestamps & {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: string
}

export type ApiVoucher = ApiTimestamps & {
  id: number
  code: string
  type: string
  value: number
  minOrderAmount: number
  usedCount: number
  maxUsage: number
  startDate: string
  endDate: string
  status: string
}

export type ApiActivity = ApiTimestamps & {
  id: number
  title: string
  startDate: string
  endDate: string
  status: string
}

export type ApiBanner = ApiTimestamps & {
  id: number
  sortOrder: number
  title: string
  image: string
  link: string
  status: string
}

export type ApiBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'done'

export type ApiBooking = ApiTimestamps & {
  id: number
  code: string
  customerName: string
  customerPhone: string
  courtId: number
  courtName: string
  courtCode: string
  bookingDate: string
  startHour: number
  endHour: number
  total: number
  status: ApiBookingStatus
  note: string | null
}
