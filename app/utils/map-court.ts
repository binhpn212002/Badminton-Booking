import type { ApiCourt, ApiCourtStatus } from '~/types/api'
import type { Court, CourtStatus } from '~/types/management'

function padHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function mapStatus(status: ApiCourtStatus): CourtStatus {
  if (status === 'under_maintenance') return 'MAINTENANCE'
  if (status === 'inactive') return 'CLOSED'
  return 'ACTIVE'
}

export function mapApiCourtToCourt(api: ApiCourt): Court {
  const timeSlots = [...(api.timeSlots || [])].sort((a, b) => a.start - b.start)
  const priceSlots = timeSlots.map((slot) => ({
    from: padHour(Number(slot.start)),
    to: padHour(Number(slot.end)),
    price: Number(slot.price) || 0,
  }))
  const firstSlot = priceSlots[0]
  const lastSlot = priceSlots[priceSlots.length - 1]

  return {
    id: String(api.id),
    branchId: '',
    location: api.location,
    code: api.courtCode,
    name: api.name,
    description: api.description || '',
    status: mapStatus(api.status),
    image: api.imageUrl || '',
    gallery: api.imageUrl ? [api.imageUrl] : [],
    length: api.height,
    width: api.width,
    surface: api.surface || 'pvc',
    indoor: api.isIndoor,
    floorType: api.surface || '',
    lighting: '',
    ceilingHeight: api.roofHeight,
    airCondition: api.hasConditioning,
    fan: api.hasFans,
    capacity: api.peopleCapacity,
    priceSlots,
    isAvailable: api.isActive && !api.isMaintenance,
    isMaintenance: api.isMaintenance,
    maintenanceReason: api.reasonForMaintenance || '',
    availableFrom: firstSlot?.from || api.openingHours || '06:00',
    availableTo: lastSlot?.to || api.endingHours || '22:00',
    createdAt: api.createdAt,
  }
}
