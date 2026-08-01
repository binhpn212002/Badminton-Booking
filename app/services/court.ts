import type { ApiCourt, ApiListResponse } from "~/types/api";

export function useApiClient() {
  const config = useRuntimeConfig();
  const base = String(config.public.apiBase).replace(/\/$/, "");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Tenant": "1",
  };

  if (import.meta.client) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return { base, headers };
}

export async function fetchCourts(params?: { page?: number; limit?: number }) {
  const { base, headers } = useApiClient();
  return await $fetch<ApiListResponse<ApiCourt>>(`${base}/court`, {
    headers,
    query: {
      tenant: 1,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });
}

export async function fetchCourtById(id: number) {
  const { base, headers } = useApiClient();
  return await $fetch<ApiCourt>(`${base}/court/${id}`, {
    headers,
  });
}

export async function createCourt(court: Partial<ApiCourt>) {
  const { base, headers } = useApiClient();
  return await $fetch<ApiCourt>(`${base}/court`, {
    method: "POST",
    body: court,
    headers,
    query: { tenant: 1 },
  });
}
