import type { ApiBanner } from '~/types/api'
import type { Banner } from '~/types/management'

function mapStatus(status: string): Banner['status'] {
  const value = status.trim().toLowerCase()
  if (value === 'active' || value === 'hoạt động') return 'active'
  return 'inactive'
}

export function mapApiBannerToBanner(api: ApiBanner): Banner {
  return {
    id: String(api.id),
    title: api.title,
    image: api.image,
    link: api.link,
    sort: api.sortOrder,
    status: mapStatus(api.status),
  }
}
