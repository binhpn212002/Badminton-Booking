<script setup lang="ts">
import { message } from "ant-design-vue";
import { loginWithTikTokCode } from "~/services/auth";

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { consumeState } = useTikTokAuth();

const statusText = ref("Đang đăng nhập bằng TikTok…");

onMounted(async () => {
  const error = typeof route.query.error === "string" ? route.query.error : "";
  if (error) {
    statusText.value = "Bạn đã hủy hoặc không thể đăng nhập TikTok.";
    message.error(statusText.value);
    setTimeout(() => router.replace("/"), 1500);
    return;
  }

  const code = typeof route.query.code === "string" ? route.query.code : "";
  const state = typeof route.query.state === "string" ? route.query.state : "";

  if (!code) {
    statusText.value = "Thiếu mã xác thực từ TikTok.";
    message.error(statusText.value);
    setTimeout(() => router.replace("/"), 1500);
    return;
  }

  if (!consumeState(state)) {
    statusText.value = "Phiên đăng nhập không hợp lệ (state).";
    message.error(statusText.value);
    setTimeout(() => router.replace("/"), 1500);
    return;
  }

  try {
    const res = await loginWithTikTokCode(code);
    auth.setSession(res.accessToken, res.user);
    message.success(`Xin chào, ${res.user.displayName}`);
    statusText.value = "Đăng nhập thành công. Đang chuyển hướng…";
    await router.replace("/");
  } catch (e: unknown) {
    statusText.value =
      e instanceof Error ? e.message : "Đăng nhập TikTok thất bại.";
    message.error(statusText.value);
    setTimeout(() => router.replace("/"), 2000);
  }
});
</script>

<template>
  <div class="callback-page">
    <p class="brand">Badminton Booking</p>
    <p>{{ statusText }}</p>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
  background: #f3f7f4;
  color: #374151;
  font-family: "Be Vietnam Pro", sans-serif;
}

.brand {
  margin: 0;
  color: #26c73e;
  font-weight: 600;
}
</style>
