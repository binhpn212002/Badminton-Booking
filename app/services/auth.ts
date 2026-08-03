import type { AuthUser, TikTokLoginResponse } from "~/types/auth";
import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_ENV,
  TIKTOK_REDIRECT_URI,
} from "~/utils/tiktok-credentials";

export type TikTokDebugInfo = {
  env: string;
  clientKey: string;
  redirectUri: string;
  code: string;
  tokenRequest: {
    url: string;
    body: Record<string, string>;
  };
  tokenStatus: number;
  tokenResponse: unknown;
  userStatus?: number;
  userResponse?: unknown;
};

/** Đổi code → TikTok access_token ngay trên FE (không qua API riêng). */
export async function loginWithTikTokCode(
  code: string,
): Promise<TikTokLoginResponse & { debug: TikTokDebugInfo }> {
  const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";
  const tokenBody = {
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: TIKTOK_REDIRECT_URI,
  };

  const debug: TikTokDebugInfo = {
    env: TIKTOK_ENV,
    clientKey: TIKTOK_CLIENT_KEY,
    redirectUri: TIKTOK_REDIRECT_URI,
    code,
    tokenRequest: {
      url: tokenUrl,
      body: {
        ...tokenBody,
        client_secret: "***",
      },
    },
    tokenStatus: 0,
    tokenResponse: null,
  };

  console.group("[TikTok] exchange code → token");
  console.log("env", TIKTOK_ENV);
  console.log("request", debug.tokenRequest);
  console.log("code", code);

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams(tokenBody),
  });

  const tokenJson = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string;
    open_id?: string;
    error?: string;
    error_description?: string;
    [key: string]: unknown;
  };

  debug.tokenStatus = tokenRes.status;
  debug.tokenResponse = tokenJson;
  console.log("token status", tokenRes.status);
  console.log("token response", tokenJson);
  console.groupEnd();

  if (!tokenRes.ok || !tokenJson.access_token) {
    const err = new Error(
      tokenJson.error_description ||
        tokenJson.error ||
        "TikTok token exchange failed",
    ) as Error & { debug: TikTokDebugInfo };
    err.debug = debug;
    throw err;
  }

  const fields = "open_id,union_id,avatar_url,display_name";
  const userUrl = `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`;

  console.group("[TikTok] user.info");
  console.log("url", userUrl);

  const userRes = await fetch(userUrl, {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
  });

  const userJson = (await userRes.json().catch(() => ({}))) as {
    data?: {
      user?: {
        open_id?: string;
        display_name?: string;
        avatar_url?: string;
      };
    };
    error?: { message?: string };
    [key: string]: unknown;
  };

  debug.userStatus = userRes.status;
  debug.userResponse = userJson;
  console.log("user status", userRes.status);
  console.log("user response", userJson);
  console.groupEnd();

  const profile = userJson?.data?.user;
  const user: AuthUser = {
    openId: profile?.open_id || tokenJson.open_id || "",
    displayName: profile?.display_name || "TikTok User",
    avatarUrl: profile?.avatar_url || "",
  };

  if (!user.openId) {
    const err = new Error(
      userJson?.error?.message || "TikTok user info failed",
    ) as Error & { debug: TikTokDebugInfo };
    err.debug = debug;
    throw err;
  }

  return {
    accessToken: tokenJson.access_token,
    user,
    debug,
  };
}
