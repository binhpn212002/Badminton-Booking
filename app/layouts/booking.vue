<script setup lang="ts">
import AppNavbar from '~/components/layout/AppNavbar.vue'
</script>

<template>
  <a-layout class="booking-shell min-h-screen">
    <AppNavbar />
    <a-layout-content class="booking-content">
      <slot />
    </a-layout-content>
    <footer class="booking-footer">
      <NuxtLink to="/terms">Điều khoản sử dụng</NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink to="/privacy">Chính sách bảo mật</NuxtLink>
    </footer>
  </a-layout>
</template>

<style scoped>
.booking-shell {
  background: #f3f7f4;
}

.booking-content {
  min-height: calc(100vh - 64px - 52px);
}

.booking-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  padding: 0 16px;
  background: #fff;
  border-top: 1px solid #e8ece9;
  color: #6b7280;
  font-size: 0.875rem;
}

.booking-footer a {
  color: #4b5563;
  text-decoration: none;
}

.booking-footer a:hover {
  color: #26c73e;
}
</style>
