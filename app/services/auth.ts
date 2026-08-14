import type {
  ApiAuthResponse,
  AuthUser,
  TikTokLoginResponse,
} from "~/types/auth";
import { useApiClient } from "~/services/court";
import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_ENV,
  TIKTOK_REDIRECT_URI,
  TIKTOK_SCOPES,
} from "~/utils/tiktok-credentials";

export type TikTokDebugInfo = {
  env: string;
  clientKey: string;
  redirectUri: string;
  requestedScopes: string;
  code: string;
  tokenRequest: {
    url: string;
    body: Record<string, string>;
  };
  tokenStatus: number;
  tokenResponse: unknown;
  grantedScope?: string;
  missingScopes?: string[];
  userStatus?: number;
  userResponse?: unknown;
};

function parseScopes(scope: string | undefined): string[] {
  if (!scope) return [];
  return scope
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function missingRequiredScopes(granted: string): string[] {
  const have = new Set(parseScopes(granted));
  return parseScopes(TIKTOK_SCOPES).filter((s) => !have.has(s));
}

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
    requestedScopes: TIKTOK_SCOPES,
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
  console.log("requestedScopes", TIKTOK_SCOPES);
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
    refresh_token?: string;
    open_id?: string;
    expires_in?: number;
    scope?: string;
    error?: string;
    error_description?: string;
    [key: string]: unknown;
  };

  debug.tokenStatus = tokenRes.status;
  debug.tokenResponse = tokenJson;
  debug.grantedScope = tokenJson.scope || "";
  debug.missingScopes = missingRequiredScopes(tokenJson.scope || "");
  console.log("token status", tokenRes.status);
  console.log("token response", tokenJson);
  console.log("grantedScope", debug.grantedScope);
  console.log("missingScopes", debug.missingScopes);
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

  if (debug.missingScopes.length > 0) {
    const err = new Error(
      `Token thiếu scope: ${debug.missingScopes.join(", ")}. Cần: ${TIKTOK_SCOPES}. Hãy login lại với authorize URL mới.`,
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

  const openId = profileOpenId(userJson, tokenJson.open_id);
  const user: AuthUser = {
    openId,
    displayName: userJson?.data?.user?.display_name || "TikTok User",
    avatarUrl: userJson?.data?.user?.avatar_url || "",
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
    refreshToken: tokenJson.refresh_token,
    openId,
    expiresIn: Number(tokenJson.expires_in || 0),
    scope: tokenJson.scope || "",
    user,
    debug,
  };
}

function profileOpenId(
  userJson: {
    data?: { user?: { open_id?: string } };
  },
  fallback?: string,
) {
  return userJson?.data?.user?.open_id || fallback || "";
}

function mapAuthUser(res: ApiAuthResponse): AuthUser {
  return {
    id: String(res.user.id),
    email: res.user.email,
    displayName: res.user.name || res.user.email,
    avatarUrl: "",
  };
}

export function readApiError(err: unknown, fallback: string) {
  const e = err as { data?: { message?: string | string[] }; message?: string };
  const msg = e?.data?.message ?? e?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg) return msg;
  return fallback;
}

export async function loginWithEmail(payload: {
  email: string;
  password: string;
}) {
  const { base, headers } = useApiClient();
  const res = await $fetch<ApiAuthResponse>(`${base}/users/login`, {
    method: "POST",
    headers,
    body: payload,
  });
  return {
    token: res.token,
    refreshToken: res.refreshToken,
    user: mapAuthUser(res),
  };
}

export async function registerWithEmail(payload: {
  email: string;
  password: string;
}) {
  const { base, headers } = useApiClient();
  const res = await $fetch<ApiAuthResponse>(`${base}/users/register`, {
    method: "POST",
    headers,
    body: payload,
  });
  return {
    token: res.token,
    refreshToken: res.refreshToken,
    user: mapAuthUser(res),
  };
}
