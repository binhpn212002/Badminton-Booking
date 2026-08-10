import type { ApiActivity } from '~/types/api'
import type { Activity } from '~/types/management'

function mapStatus(status: string): Activity['status'] {
  const value = status.trim().toLowerCase()
  if (value === 'active' || value === 'hoạt động') return 'active'
  if (value === 'draft' || value === 'nháp') return 'draft'
  return 'inactive'
}

export function mapApiActivityToActivity(api: ApiActivity): Activity {
  return {
    id: String(api.id),
    title: api.title,
    startAt: api.startDate,
    endAt: api.endDate,
    status: mapStatus(api.status),
  }
}
