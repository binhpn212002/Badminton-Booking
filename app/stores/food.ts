import { defineStore } from 'pinia'
import { deleteFood, fetchFoods } from '~/services/food'
import type { FnbItem } from '~/types/management'
import { mapApiFoodToFnbItem } from '~/utils/map-food'

export const useFoodStore = defineStore('food', () => {
  const foods = ref<FnbItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function loadFoods(
    force = false,
    params?: { page?: number; limit?: number },
  ) {
    if (loaded.value && !force && !params) return foods.value
    loading.value = true
    error.value = null
    try {
      const res = await fetchFoods({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
      })
      foods.value = res.data.map(mapApiFoodToFnbItem)
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      loaded.value = true
      return foods.value
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Không tải được danh sách đồ ăn'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    await deleteFood(Number(id))
    foods.value = foods.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function upsert(food: FnbItem) {
    const index = foods.value.findIndex((item) => item.id === food.id)
    if (index >= 0) foods.value[index] = food
    else {
      foods.value = [food, ...foods.value]
      total.value += 1
    }
  }

  return {
    foods,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    loadFoods,
    remove,
    upsert,
  }
})
