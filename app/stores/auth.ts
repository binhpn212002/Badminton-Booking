import { defineStore } from "pinia";
import type { AuthUser } from "~/types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);

  const isLoggedIn = computed(() => Boolean(token.value));

  function hydrate() {
    if (!import.meta.client) return;
    token.value = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        user.value = JSON.parse(raw) as AuthUser;
      } catch {
        user.value = null;
      }
    }
  }

  function setSession(accessToken: string, nextUser: AuthUser) {
    token.value = accessToken;
    user.value = nextUser;
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  return { token, user, isLoggedIn, hydrate, setSession, logout };
});
