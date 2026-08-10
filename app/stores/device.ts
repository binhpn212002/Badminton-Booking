import { defineStore } from 'pinia'
import { deleteDevice, fetchDevices } from '~/services/device'
import type { Device } from '~/types/management'
import { mapApiDeviceToDevice } from '~/utils/map-device'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function loadDevices(
    force = false,
    params?: { page?: number; limit?: number },
  ) {
    if (loaded.value && !force && !params) return devices.value
    loading.value = true
    error.value = null
    try {
      const res = await fetchDevices({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
      })
      devices.value = res.data.map(mapApiDeviceToDevice)
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      loaded.value = true
      return devices.value
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Không tải được danh sách thiết bị'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    await deleteDevice(Number(id))
    devices.value = devices.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function upsert(device: Device) {
    const index = devices.value.findIndex((item) => item.id === device.id)
    if (index >= 0) devices.value[index] = device
    else {
      devices.value = [device, ...devices.value]
      total.value += 1
    }
  }

  return {
    devices,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    loadDevices,
    remove,
    upsert,
  }
})
