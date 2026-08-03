export type AuthUser = {
  openId: string;
  displayName: string;
  avatarUrl: string;
};

export type TikTokLoginResponse = {
  accessToken: string;
  user: AuthUser;
};
