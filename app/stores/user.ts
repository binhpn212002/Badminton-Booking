import { defineStore } from 'pinia'
import { fetchUsers } from '~/services/user'
import type { User } from '~/types/management'
import { mapApiUserToUser } from '~/utils/map-user'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function readError(err: unknown, fallback: string) {
    const e = err as { data?: { message?: string | string[] }; message?: string }
    const msg = e?.data?.message ?? e?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (typeof msg === 'string' && msg) return msg
    return fallback
  }

  async function loadUsers(
    force = false,
    params?: { page?: number; limit?: number; name?: string },
  ) {
    if (loaded.value && !force && !params) return users.value
    loading.value = true
    error.value = null
    try {
      const res = await fetchUsers({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
        name: params?.name,
      })
      users.value = res.data.map(mapApiUserToUser)
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      loaded.value = true
      return users.value
    } catch (err) {
      error.value = readError(err, 'Không tải được danh sách người dùng')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    loadUsers,
  }
})
