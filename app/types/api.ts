export type ApiCourtStatus = 'active' | 'inactive' | 'under_maintenance'

export type ApiCourtTimeSlot = {
  id: number
  createAt?: string
  updateAt?: string
  deleteAt?: string | null
  start: number
  end: number
  price: number
}

export type ApiCourt = {
  id: number
  createAt: string
  updateAt: string
  deleteAt: string | null
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
