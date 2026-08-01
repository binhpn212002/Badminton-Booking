import { defineStore } from 'pinia'
import type { Court } from '~/types/management'
import { fetchCourts } from '~/services/court'
import { mapApiCourtToCourt } from '~/utils/map-court'

export const useCourtStore = defineStore('court', () => {
  const courts = ref<Court[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function getById(id: string) {
    return courts.value.find((item) => item.id === id)
  }

  async function loadCourts(force = false) {
    if (loaded.value && !force) return courts.value
    loading.value = true
    error.value = null
    try {
      const data = await fetchCourts()
      courts.value = data.map(mapApiCourtToCourt)
      loaded.value = true
      return courts.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Không tải được danh sách sân'
      throw err
    } finally {
      loading.value = false
    }
  }

  function upsert(court: Court) {
    const index = courts.value.findIndex((item) => item.id === court.id)
    if (index >= 0) courts.value[index] = court
    else courts.value = [court, ...courts.value]
  }

  function remove(id: string) {
    courts.value = courts.value.filter((item) => item.id !== id)
  }

  return { courts, loading, error, loaded, getById, loadCourts, upsert, remove }
})
