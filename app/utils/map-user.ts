import type { ApiUser } from '~/types/api'
import type { User } from '~/types/management'

export function mapApiUserToUser(api: ApiUser): User {
  return {
    id: String(api.id),
    name: api.name || api.email,
    email: api.email,
    phone: '',
    role: api.role || 'customer',
    status: 'active',
    createdAt: api.createdAt,
  }
}
