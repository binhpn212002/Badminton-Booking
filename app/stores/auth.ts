import { defineStore } from "pinia";
import type { AuthUser } from "~/types/auth";

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";
const SCOPE_KEY = "tiktok_scope";
const OPEN_ID_KEY = "tiktok_open_id";
const EXPIRES_KEY = "tiktok_expires_in";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);
  const scope = ref<string | null>(null);
  const openId = ref<string | null>(null);
  const expiresIn = ref<number | null>(null);

  const isLoggedIn = computed(() => Boolean(token.value));
  const hasVideoUpload = computed(() =>
    (scope.value || "").split(",").map((s) => s.trim()).includes("video.upload"),
  );

  function hydrate() {
    if (!import.meta.client) return;
    token.value = localStorage.getItem(TOKEN_KEY);
    refreshToken.value = localStorage.getItem(REFRESH_KEY);
    scope.value = localStorage.getItem(SCOPE_KEY);
    openId.value = localStorage.getItem(OPEN_ID_KEY);
    const exp = localStorage.getItem(EXPIRES_KEY);
    expiresIn.value = exp ? Number(exp) : null;
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        user.value = JSON.parse(raw) as AuthUser;
      } catch {
        user.value = null;
      }
    }
  }

  function setSession(
    accessToken: string,
    nextUser: AuthUser,
    meta?: {
      scope?: string;
      openId?: string;
      expiresIn?: number;
      refreshToken?: string;
    },
  ) {
    token.value = accessToken;
    refreshToken.value = meta?.refreshToken || null;
    user.value = nextUser;
    scope.value = meta?.scope || null;
    openId.value = meta?.openId || nextUser.openId || null;
    expiresIn.value = meta?.expiresIn ?? null;

    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (meta?.refreshToken) localStorage.setItem(REFRESH_KEY, meta.refreshToken);
      else localStorage.removeItem(REFRESH_KEY);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      if (meta?.scope) localStorage.setItem(SCOPE_KEY, meta.scope);
      else localStorage.removeItem(SCOPE_KEY);
      if (openId.value) localStorage.setItem(OPEN_ID_KEY, openId.value);
      else localStorage.removeItem(OPEN_ID_KEY);
      if (meta?.expiresIn != null)
        localStorage.setItem(EXPIRES_KEY, String(meta.expiresIn));
      else localStorage.removeItem(EXPIRES_KEY);
    }
  }

  function logout() {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    scope.value = null;
    openId.value = null;
    expiresIn.value = null;
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SCOPE_KEY);
      localStorage.removeItem(OPEN_ID_KEY);
      localStorage.removeItem(EXPIRES_KEY);
    }
  }

  return {
    token,
    refreshToken,
    user,
    scope,
    openId,
    expiresIn,
    isLoggedIn,
    hasVideoUpload,
    hydrate,
    setSession,
    logout,
  };
});
