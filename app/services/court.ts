import type { ApiCourt } from "~/types/api";

export function useApiBase() {
  const config = useRuntimeConfig();
  // Set tenant in HEADER
  const headers: Record<string, string> = useRequestHeaders();
  headers["X-Tenant"] = "1";
  // add token from localStorage
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return {
    base: `${config.public.apiBase}?tenant=1`,
    headers,
  };
}

export async function fetchCourts() {
  const base = useApiBase();
  return await $fetch<ApiCourt[]>(`${base.base}/court`, {
    headers: base.headers,
  });
}

export async function fetchCourtById(id: string | number) {
  const base = useApiBase();
  return await $fetch<ApiCourt>(`${base.base}/court/${id}`, {
    headers: base.headers,
  });
}

export async function createCourt(court: ApiCourt) {
  const base = useApiBase();
  return await $fetch<ApiCourt>(`${base}/court`, {
    method: "POST",
    body: court,
    headers: base.headers,
  });
}
