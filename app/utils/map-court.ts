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
    priceSlots: (api.timeSlots || []).map((slot) => ({
      from: padHour(slot.start),
      to: padHour(slot.end),
      price: slot.price,
    })),
    isAvailable: api.isActive && !api.isMaintenance,
    isMaintenance: api.isMaintenance,
    maintenanceReason: api.reasonForMaintenance || '',
    availableFrom: api.openingHours || '06:00',
    availableTo: api.endingHours || '22:00',
    createdAt: api.createdAt,
  }
}
