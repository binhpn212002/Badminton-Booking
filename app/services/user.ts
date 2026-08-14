import type { ApiListResponse, ApiUser } from '~/types/api'
import { useApiClient } from '~/services/court'

export async function fetchUsers(params?: {
  page?: number
  limit?: number
  name?: string
}) {
  const { base, headers } = useApiClient()
  return await $fetch<ApiListResponse<ApiUser>>(`${base}/users`, {
    headers,
    query: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      name: params?.name,
    },
  })
}
