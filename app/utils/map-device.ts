import type { ApiDevice } from '~/types/api'
import type { Device } from '~/types/management'

function mapStatus(status: string): Device['status'] {
  const value = status.trim().toLowerCase()
  if (value === 'active' || value === 'hoạt động') return 'active'
  return 'inactive'
}

export function mapApiDeviceToDevice(api: ApiDevice): Device {
  return {
    id: String(api.id),
    name: api.name,
    sku: api.sku,
    category: api.category,
    stock: api.stock,
    price: api.price,
    status: mapStatus(api.status),
    updatedAt: api.updatedAt,
  }
}
