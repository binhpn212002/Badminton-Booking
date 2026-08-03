export type AuthUser = {
  openId: string;
  displayName: string;
  avatarUrl: string;
};

export type TikTokLoginResponse = {
  accessToken: string;
  refreshToken?: string;
  openId: string;
  expiresIn: number;
  /** Ví dụ: user.info.basic,video.upload */
  scope: string;
  user: AuthUser;
};
