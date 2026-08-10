import type { ApiFood } from '~/types/api'
import type { FnbItem } from '~/types/management'

function mapStatus(status: string): FnbItem['status'] {
  const value = status.trim().toLowerCase()
  if (value === 'active' || value === 'hoạt động') return 'active'
  return 'inactive'
}

export function mapApiFoodToFnbItem(api: ApiFood): FnbItem {
  return {
    id: String(api.id),
    name: api.name,
    category: api.category,
    price: api.price,
    stock: api.stock,
    status: mapStatus(api.status),
    updatedAt: api.updatedAt,
  }
}
