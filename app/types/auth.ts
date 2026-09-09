export type AuthUser = {
  id?: string
  email?: string
  openId?: string
  displayName: string
  avatarUrl?: string
  role?: 'admin' | 'staff' | 'customer'
}

export type ApiAuthUser = {
  id: number
  email: string
  name: string
  role: 'admin' | 'staff' | 'customer'
  avatarUrl?: string | null
  tiktokOpenId?: string | null
}

export type ApiAuthResponse = {
  token: string
  refreshToken: string
  user: ApiAuthUser
}
