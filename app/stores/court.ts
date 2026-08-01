import { defineStore } from "pinia";
import { fetchCourtById, fetchCourts } from "~/services/court";
import type { Court } from "~/types/management";
import { mapApiCourtToCourt } from "~/utils/map-court";

export const useCourtStore = defineStore("court", () => {
  const courts = ref<Court[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const loaded = ref(false);

  async function fetchById(id: string | number) {
    const api = await fetchCourtById(Number(id));
    const court = mapApiCourtToCourt(api);
    upsert(court);
    return court;
  }

  async function loadCourts(
    force = false,
    params?: { page?: number; limit?: number },
  ) {
    if (loaded.value && !force && !params) return courts.value;
    loading.value = true;
    error.value = null;
    try {
      const res = await fetchCourts({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
      });
      courts.value = res.data.map(mapApiCourtToCourt);
      total.value = res.total;
      page.value = res.page;
      limit.value = res.limit;
      loaded.value = true;
      return courts.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Không tải được danh sách sân";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function upsert(court: Court) {
    const index = courts.value.findIndex((item) => item.id === court.id);
    if (index >= 0) courts.value[index] = court;
    else courts.value = [court, ...courts.value];
  }

  function remove(id: string) {
    courts.value = courts.value.filter((item) => item.id !== id);
  }

  return {
    courts,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    fetchById,
    loadCourts,
    upsert,
    remove,
  };
});
