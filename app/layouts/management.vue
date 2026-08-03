<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'

const collapsed = ref(false)
const route = useRoute()

const titles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/courts': 'Sân',
  '/dashboard/equipment': 'Thiết bị',
  '/dashboard/fnb': 'Đồ ăn & uống',
  '/dashboard/bookings': 'Danh sách booking',
  '/dashboard/orders': 'Danh sách Order',
  '/dashboard/users': 'Người dùng',
  '/dashboard/vouchers': 'Voucher',
  '/dashboard/reports': 'Báo cáo',
  '/dashboard/component': 'Component',
  '/dashboard/settings/banner': 'Banner',
  '/dashboard/settings/activities': 'Hoạt động',
  '/dashboard/settings/email': 'Cấu hình Email',
  '/dashboard/settings/bank-accounts': 'Tài khoản ngân hàng',
  '/dashboard/settings/zalo-oa': 'Cấu hình ZaloOA',
  '/dashboard/settings/vnpay': 'Cấu hình VNPay',
  '/dashboard/settings/google': 'Cấu hình Google',
  '/dashboard/settings/tiktok': 'Cấu hình TikTok',
}

const pageTitle = computed(() => {
  if (route.path === '/dashboard/courts/create') return 'Thêm sân'
  if (/^\/dashboard\/courts\/[^/]+\/edit$/.test(route.path)) return 'Cập nhật sân'
  if (/^\/dashboard\/courts\/[^/]+$/.test(route.path)) return 'Chi tiết sân'
  return titles[route.path] ?? 'Quản lý'
})
</script>

<template>
  <a-layout class="min-h-screen">
    <AppSidebar v-model:collapsed="collapsed" />
    <a-layout>
      <a-layout-header class="mgmt-header flex items-center px-6">
        <h1 class="m-0 text-base font-semibold text-gray-800">{{ pageTitle }}</h1>
      </a-layout-header>
      <a-layout-content class="bg-[#f5f7f6] p-6">
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.mgmt-header {
  background: #fff;
  height: 64px;
  line-height: 64px;
  border-bottom: 1px solid #e8ece9;
  padding-inline: 24px;
}
</style>
