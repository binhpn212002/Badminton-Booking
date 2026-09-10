import { fetchTikTokConfig } from "~/services/auth";

export function useTikTokAuth() {
  async function getAuthorizeUrl() {
    const config = await fetchTikTokConfig();
    if (!config.clientKey) {
      throw new Error("Thiếu TIKTOK_CLIENT_KEY trên server");
    }

    if (import.meta.client) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tiktok_scope");
      localStorage.removeItem("tiktok_open_id");
      localStorage.removeItem("tiktok_expires_in");
    }

    const state =
      import.meta.client && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`;

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

  return { getAuthorizeUrl, startLogin };
}
