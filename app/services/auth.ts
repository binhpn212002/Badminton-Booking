import type { AuthUser, TikTokLoginResponse } from "~/types/auth";
import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_REDIRECT_URI,
} from "~/utils/tiktok-credentials";

/** Đổi code → TikTok access_token ngay trên FE (không qua API riêng). */
export async function loginWithTikTokCode(
  code: string,
): Promise<TikTokLoginResponse> {
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: TIKTOK_REDIRECT_URI,
    }),
  });

  const tokenJson = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string;
    open_id?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(
      tokenJson.error_description ||
        tokenJson.error ||
        "TikTok token exchange failed",
    );
  }

  const fields = "open_id,union_id,avatar_url,display_name";
  const userRes = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`,
    {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
      },
    },
  );

  const userJson = (await userRes.json().catch(() => ({}))) as {
    data?: {
      user?: {
        open_id?: string;
        display_name?: string;
        avatar_url?: string;
      };
    };
    error?: { message?: string };
  };

  const profile = userJson?.data?.user;
  const user: AuthUser = {
    openId: profile?.open_id || tokenJson.open_id || "",
    displayName: profile?.display_name || "TikTok User",
    avatarUrl: profile?.avatar_url || "",
  };

  if (!user.openId) {
    throw new Error(userJson?.error?.message || "TikTok user info failed");
  }

  return {
    accessToken: tokenJson.access_token,
    user,
  };
}
