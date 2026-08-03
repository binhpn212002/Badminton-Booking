<script setup lang="ts">
import type { MenuProps } from "ant-design-vue";

const loginOpen = ref(false);
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(() => {
  auth.hydrate();
});

const selectedKeys = computed(() => {
  if (route.path.startsWith("/booking")) return ["booking"];
  if (route.path.startsWith("/shop")) return ["shop"];
  return ["home"];
});

const items: MenuProps["items"] = [
  { key: "home", label: "Trang chủ", title: "Trang chủ" },
  { key: "booking", label: "Đặt sân", title: "Đặt sân" },
  { key: "shop", label: "Mua sắm", title: "Mua sắm" },
];

const pathByKey: Record<string, string> = {
  home: "/",
  booking: "/booking",
  shop: "/shop",
};

const onClick: MenuProps["onClick"] = ({ key }) => {
  const path = pathByKey[String(key)];
  if (path) router.push(path);
};

function handleLogout() {
  auth.logout();
}
</script>

<template>
  <a-layout-header class="app-navbar flex items-center gap-8 px-6">
    <NuxtLink to="/" class="brand shrink-0 text-lg font-semibold no-underline">
      Badminton Booking
    </NuxtLink>

    <a-menu
      mode="horizontal"
      :selected-keys="selectedKeys"
      :items="items"
      class="app-menu min-w-0 flex-1 !border-0"
      @click="onClick"
    />

    <div v-if="auth.isLoggedIn" class="user-chip shrink-0">
      <a-avatar
        v-if="auth.user?.avatarUrl"
        :src="auth.user.avatarUrl"
        :size="32"
      />
      <a-avatar v-else :size="32">
        {{ auth.user?.displayName?.charAt(0) || "U" }}
      </a-avatar>
      <span class="user-name">{{ auth.user?.displayName }}</span>
      <a-button type="link" class="!px-0" @click="handleLogout">Logout</a-button>
    </div>
    <template v-else>
      <a-button type="primary" class="shrink-0" @click="loginOpen = true">
        Login
      </a-button>
      <CommonLoginModal v-model:open="loginOpen" />
    </template>
  </a-layout-header>
</template>

<style scoped>
.app-navbar {
  background: #fff;
  height: 64px;
  line-height: 64px;
  padding-inline: 24px;
  border-bottom: 1px solid #e8ece9;
}

.brand {
  color: #1f2937;
  letter-spacing: 0.01em;
}

.app-menu {
  background: transparent;
  line-height: 62px;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1.2;
}

.user-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
  font-size: 0.9rem;
}
</style>
