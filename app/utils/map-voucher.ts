import type { ApiVoucher } from '~/types/api'
import type { Voucher } from '~/types/management'

function mapType(type: string): Voucher['type'] {
  const value = type.trim().toLowerCase()
  if (value === '%' || value === 'percent') return 'percent'
  return 'fixed'
}

function mapStatus(status: string): Voucher['status'] {
  const value = status.trim().toLowerCase()
  if (value === 'active' || value === 'hoạt động') return 'active'
  if (value === 'draft' || value === 'nháp') return 'draft'
  return 'inactive'
}

export function mapApiVoucherToVoucher(api: ApiVoucher): Voucher {
  return {
    id: String(api.id),
    code: api.code,
    type: mapType(api.type),
    value: api.value,
    minOrder: api.minOrderAmount,
    usageLimit: api.maxUsage,
    usedCount: api.usedCount,
    startAt: api.startDate,
    endAt: api.endDate,
    status: mapStatus(api.status),
  }
}
