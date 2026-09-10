import { message } from 'ant-design-vue'
import type { ApiAuthUser, AuthUser } from '~/types/auth'

function mapUser(api: ApiAuthUser): AuthUser {
  return {
    id: String(api.id),
    email: api.email,
    displayName: api.name || api.email,
    avatarUrl: api.avatarUrl || '',
    role: api.role || 'customer',
    openId: api.tiktokOpenId || undefined,
  }
}

/**
 * Nhận session sau khi BE callback TikTok redirect về FE
 * (?auth=tiktok&token=...&refreshToken=...&user=...)
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const applyCallback = () => {
    if (route.query.auth !== 'tiktok') return

    const error = typeof route.query.error === 'string' ? route.query.error : ''
    if (error) {
      message.error(decodeURIComponent(error))
      router.replace({ path: route.path, query: {} })
      return
    }

    const token = typeof route.query.token === 'string' ? route.query.token : ''
    const refreshToken =
      typeof route.query.refreshToken === 'string' ? route.query.refreshToken : ''
    const userRaw = typeof route.query.user === 'string' ? route.query.user : ''

    if (!token || !userRaw) {
      router.replace({ path: route.path, query: {} })
      return
    }

    try {
      const apiUser = JSON.parse(userRaw) as ApiAuthUser
      auth.setSession(token, mapUser(apiUser), { refreshToken })
      message.success(`Xin chào, ${apiUser.name || apiUser.email}`)
    } catch {
      message.error('Không đọc được thông tin đăng nhập TikTok')
    }

    router.replace({ path: route.path, query: {} })
  }

  watch(
    () => route.query.auth,
    () => applyCallback(),
    { immediate: true },
  )
})
