<template>
  <a-layout class="booking-shell min-h-screen">
    <LayoutAppNavbar />
    <a-layout-content class="booking-content">
      <slot />
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.booking-shell {
  background: #f3f7f4;
}

.booking-content {
  min-height: calc(100vh - 64px);
}
</style>
