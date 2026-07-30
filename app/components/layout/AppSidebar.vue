<script setup lang="ts">
import type { MenuProps } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { h } from "vue";

const collapsed = defineModel<boolean>("collapsed", { default: false });
const route = useRoute();
const router = useRouter();

const selectedKeys = computed(() => [route.path]);
const openKeys = ref<string[]>(
  route.path.startsWith("/dashboard/settings") ? ["settings"] : [],
);

watch(
  () => route.path,
  (path) => {
    if (
      path.startsWith("/dashboard/settings") &&
      !openKeys.value.includes("settings")
    ) {
      openKeys.value = [...openKeys.value, "settings"];
    }
  },
);

const items: MenuProps["items"] = [
  {
    key: "/dashboard/courts",
    icon: () => h(Icon, { icon: "mdi:badminton", width: 18 }),
    label: "Sân",
  },
  {
    key: "/dashboard/equipment",
    icon: () => h(Icon, { icon: "mdi:tennis-ball", width: 18 }),
    label: "Thiết bị",
  },
  {
    key: "/dashboard/fnb",
    icon: () => h(Icon, { icon: "mdi:food-fork-drink", width: 18 }),
    label: "Đồ ăn & uống",
  },
  {
    key: "/dashboard/bookings",
    icon: () => h(Icon, { icon: "mdi:calendar-check", width: 18 }),
    label: "Danh sách booking",
  },
  {
    key: "/dashboard/orders",
    icon: () => h(Icon, { icon: "mdi:clipboard-list", width: 18 }),
    label: "Danh sách Order",
  },
  {
    key: "/dashboard/users",
    icon: () => h(Icon, { icon: "mdi:account-group", width: 18 }),
    label: "Người dùng",
  },
  {
    key: "/dashboard/vouchers",
    icon: () => h(Icon, { icon: "mdi:ticket-percent", width: 18 }),
    label: "Voucher",
  },
  {
    key: "/dashboard/reports",
    icon: () => h(Icon, { icon: "mdi:chart-box", width: 18 }),
    label: "Báo cáo",
  },
  {
    key: "/dashboard/component",
    icon: () => h(Icon, { icon: "mdi:puzzle", width: 18 }),
    label: "Component",
  },
  {
    key: "settings",
    icon: () => h(Icon, { icon: "mdi:cog", width: 18 }),
    label: "Cài đặt",
    children: [
      { key: "/dashboard/settings/banner", label: "Banner" },
      { key: "/dashboard/settings/activities", label: "Hoạt động" },
      { key: "/dashboard/settings/email", label: "Cấu hình Email" },
      {
        key: "/dashboard/settings/bank-accounts",
        label: "Tài khoản ngân hàng",
      },
      { key: "/dashboard/settings/zalo-oa", label: "Cấu hình ZaloOA" },
      { key: "/dashboard/settings/vnpay", label: "Cấu hình VNPay" },
      { key: "/dashboard/settings/google", label: "Cấu hình Google" },
    ],
  },
];

const onClick: MenuProps["onClick"] = ({ key }) => {
  const path = String(key);
  if (path.startsWith("/")) router.push(path);
};
</script>

<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    collapsible
    :width="240"
    class="app-sidebar"
    theme="light"
  >
    <div class="brand px-4 py-4 text-base font-semibold">
      <NuxtLink to="/dashboard" class="text-gray-800 no-underline">
        <span v-if="!collapsed">Badminton Booking</span>
        <span v-else>BB</span>
      </NuxtLink>
    </div>

    <a-menu
      v-model:open-keys="openKeys"
      mode="inline"
      :selected-keys="selectedKeys"
      :items="items"
      class="!border-0"
      @click="onClick"
    />
  </a-layout-sider>
</template>

<style scoped>
.app-sidebar {
  background: #fff !important;
  min-height: 100vh;
  border-right: 1px solid #e8ece9;
}

.brand {
  border-bottom: 1px solid #e8ece9;
}
</style>
