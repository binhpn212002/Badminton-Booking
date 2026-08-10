import { defineStore } from 'pinia'
import { deleteActivity, fetchActivities } from '~/services/activity'
import type { Activity } from '~/types/management'
import { mapApiActivityToActivity } from '~/utils/map-activity'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<Activity[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function loadActivities(
    force = false,
    params?: { page?: number; limit?: number },
  ) {
    if (loaded.value && !force && !params) return activities.value
    loading.value = true
    error.value = null
    try {
      const res = await fetchActivities({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
      })
      activities.value = res.data.map(mapApiActivityToActivity)
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      loaded.value = true
      return activities.value
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Không tải được danh sách hoạt động'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    await deleteActivity(Number(id))
    activities.value = activities.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function upsert(activity: Activity) {
    const index = activities.value.findIndex((item) => item.id === activity.id)
    if (index >= 0) activities.value[index] = activity
    else {
      activities.value = [activity, ...activities.value]
      total.value += 1
    }
  }

  return {
    activities,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    loadActivities,
    remove,
    upsert,
  }
})
