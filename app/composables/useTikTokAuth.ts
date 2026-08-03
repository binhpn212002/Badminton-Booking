import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_REDIRECT_URI,
  TIKTOK_SCOPES,
} from "~/utils/tiktok-credentials";

const STATE_KEY = "tiktok_oauth_state";

function randomState() {
  if (import.meta.client && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useTikTokAuth() {
  function getAuthorizeUrl() {
    const state = randomState();
    if (import.meta.client) {
      sessionStorage.setItem(STATE_KEY, state);
      // Xóa token/session cũ trước khi xin scope mới
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      scope: TIKTOK_SCOPES,
      response_type: "code",
      redirect_uri: TIKTOK_REDIRECT_URI,
      state,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  function startLogin() {
    const url = getAuthorizeUrl();
    console.log("[TikTok] authorize URL", url);
    window.location.href = url;
  }

  function consumeState(returnedState?: string | null) {
    if (!import.meta.client) return false;
    const expected = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    if (!expected || !returnedState) return false;
    return expected === returnedState;
  }

  return { getAuthorizeUrl, startLogin, consumeState };
}
