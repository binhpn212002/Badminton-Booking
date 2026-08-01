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
  courtType: string
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
