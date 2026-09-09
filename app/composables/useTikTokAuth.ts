import { fetchTikTokConfig } from "~/services/auth";

const STATE_KEY = "tiktok_oauth_state";

function randomState() {
  if (import.meta.client && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useTikTokAuth() {
  async function getAuthorizeUrl() {
    const config = await fetchTikTokConfig();
    if (!config.clientKey) {
      throw new Error("Thiếu TIKTOK_CLIENT_KEY trên server");
    }

    const state = randomState();
    if (import.meta.client) {
      sessionStorage.setItem(STATE_KEY, state);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tiktok_scope");
      localStorage.removeItem("tiktok_open_id");
      localStorage.removeItem("tiktok_expires_in");
    }

    const params = new URLSearchParams({
      client_key: config.clientKey,
      scope: config.scopes || "user.info.basic",
      response_type: "code",
      redirect_uri: config.redirectUri,
      state,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  async function startLogin() {
    const url = await getAuthorizeUrl();
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
