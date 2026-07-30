<script setup lang="ts">
withDefaults(
  defineProps<{
    status: string
    map?: Record<string, { color: string; label: string }>
  }>(),
  {
    map: () => ({
      ACTIVE: { color: 'success', label: 'Hoạt động' },
      MAINTENANCE: { color: 'warning', label: 'Bảo trì' },
      CLOSED: { color: 'default', label: 'Đóng cửa' },
      active: { color: 'success', label: 'Hoạt động' },
      inactive: { color: 'default', label: 'Ngưng' },
      maintenance: { color: 'warning', label: 'Bảo trì' },
      pending: { color: 'processing', label: 'Chờ xử lý' },
      confirmed: { color: 'success', label: 'Đã xác nhận' },
      cancelled: { color: 'error', label: 'Đã hủy' },
      done: { color: 'default', label: 'Hoàn thành' },
      paid: { color: 'success', label: 'Đã thanh toán' },
      unpaid: { color: 'warning', label: 'Chưa thanh toán' },
      processing: { color: 'processing', label: 'Đang xử lý' },
      shipped: { color: 'cyan', label: 'Đã giao' },
      draft: { color: 'default', label: 'Nháp' },
    }),
  },
)
</script>

<template>
  <a-tag :color="map[status]?.color ?? 'default'">
    {{ map[status]?.label ?? status }}
  </a-tag>
</template>
