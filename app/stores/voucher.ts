import { defineStore } from 'pinia'
import { deleteVoucher, fetchVouchers } from '~/services/voucher'
import type { Voucher } from '~/types/management'
import { mapApiVoucherToVoucher } from '~/utils/map-voucher'

export const useVoucherStore = defineStore('voucher', () => {
  const vouchers = ref<Voucher[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function loadVouchers(
    force = false,
    params?: { page?: number; limit?: number },
  ) {
    if (loaded.value && !force && !params) return vouchers.value
    loading.value = true
    error.value = null
    try {
      const res = await fetchVouchers({
        page: params?.page ?? page.value,
        limit: params?.limit ?? limit.value,
      })
      vouchers.value = res.data.map(mapApiVoucherToVoucher)
      total.value = res.total
      page.value = res.page
      limit.value = res.limit
      loaded.value = true
      return vouchers.value
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Không tải được danh sách voucher'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    await deleteVoucher(Number(id))
    vouchers.value = vouchers.value.filter((item) => item.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function upsert(voucher: Voucher) {
    const index = vouchers.value.findIndex((item) => item.id === voucher.id)
    if (index >= 0) vouchers.value[index] = voucher
    else {
      vouchers.value = [voucher, ...vouchers.value]
      total.value += 1
    }
  }

  return {
    vouchers,
    total,
    page,
    limit,
    loading,
    error,
    loaded,
    loadVouchers,
    remove,
    upsert,
  }
})
