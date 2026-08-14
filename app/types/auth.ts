export type AuthUser = {
  id?: string
  email?: string
  openId?: string
  displayName: string
  avatarUrl?: string
}

export type ApiAuthUser = {
  id: number
  email: string
  name: string
}

export type ApiAuthResponse = {
  token: string
  refreshToken: string
  user: ApiAuthUser
}

export type TikTokLoginResponse = {
  accessToken: string;
  refreshToken?: string;
  openId: string;
  expiresIn: number;
  /** Ví dụ: user.info.basic,video.upload */
  scope: string;
  user: AuthUser;
};
