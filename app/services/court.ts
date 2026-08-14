import type { ApiCourt, ApiListResponse } from "~/types/api";

export function useApiClient() {
  const config = useRuntimeConfig();
  const base = String(config.public.apiBase).replace(/\/$/, "");

  const headers: Record<string, string> = {
    Accept: "application/json",
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
  const res = await $fetch<ApiCourt | { data: ApiCourt }>(`${base}/court/${id}`, {
    headers,
  });
  if (res && typeof res === "object" && "data" in res && res.data?.id) {
    return res.data;
  }
  return res as ApiCourt;
}

export type CourtWritePayload = Omit<
  ApiCourt,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "timeSlots"
> & {
  timeSlots: Array<{ start: number; end: number; price: number }>;
};

export async function createCourt(court: CourtWritePayload) {
  const { base, headers } = useApiClient();
  return await $fetch<ApiCourt>(`${base}/court`, {
    method: "POST",
    body: court,
    headers,
  });
}

export async function updateCourt(id: number, court: CourtWritePayload) {
  const { base, headers } = useApiClient();
  return await $fetch<ApiCourt>(`${base}/court/${id}`, {
    method: "PUT",
    body: court,
    headers,
  });
}
