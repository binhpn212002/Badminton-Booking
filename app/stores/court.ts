import { defineStore } from 'pinia'
import type { Court } from '~/types/management'
import { mockCourts } from '~/utils/mock-management'

export const useCourtStore = defineStore('court', () => {
  const courts = ref<Court[]>([...mockCourts])

  function getById(id: string) {
    return courts.value.find((item) => item.id === id)
  }

  function upsert(court: Court) {
    const index = courts.value.findIndex((item) => item.id === court.id)
    if (index >= 0) courts.value[index] = court
    else courts.value = [court, ...courts.value]
  }

  function remove(id: string) {
    courts.value = courts.value.filter((item) => item.id !== id)
  }

  return { courts, getById, upsert, remove }
})
