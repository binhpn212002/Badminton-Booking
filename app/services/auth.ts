import type { ApiAuthResponse, AuthUser } from "~/types/auth";
import { useApiClient } from "~/services/court";

export type TikTokPublicConfig = {
  clientKey: string;
  redirectUri: string;
  scopes: string;
};

export function readApiError(err: unknown, fallback: string) {
  const e = err as { data?: { message?: string | string[] }; message?: string };
  const msg = e?.data?.message ?? e?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg) return msg;
  return fallback;
}

function mapAuthUser(res: ApiAuthResponse): AuthUser {
  return {
    id: String(res.user.id),
    email: res.user.email,
    displayName: res.user.name || res.user.email,
    avatarUrl: res.user.avatarUrl || "",
    role: res.user.role || "customer",
    openId: res.user.tiktokOpenId || undefined,
  };
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

export async function fetchTikTokConfig() {
  const { base, headers } = useApiClient();
  return await $fetch<TikTokPublicConfig>(`${base}/users/auth/tiktok/config`, {
    headers,
  });
}

/** Đổi code TikTok → JWT app qua NestJS BE (secret không lộ browser). */
export async function loginWithTikTokCode(code: string) {
  const { base, headers } = useApiClient();
  const res = await $fetch<ApiAuthResponse>(`${base}/users/auth/tiktok`, {
    method: "POST",
    headers,
    body: { code },
  });
  return {
    token: res.token,
    refreshToken: res.refreshToken,
    user: mapAuthUser(res),
  };
}
