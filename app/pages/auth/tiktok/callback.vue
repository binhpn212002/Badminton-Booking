<script setup lang="ts">
import { message } from "ant-design-vue";
import { loginWithTikTokCode, readApiError } from "~/services/auth";

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { consumeState } = useTikTokAuth();

const statusText = ref("Đang đăng nhập bằng TikTok…");
const done = ref(false);
const ok = ref(false);

function firstParam(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  if (typeof value === "string") return value;
  return value == null ? "" : String(value);
}

function readOAuthParams() {
  const fromWindow = new URLSearchParams(window.location.search);
  const code =
    fromWindow.get("code") || firstParam(route.query.code) || "";
  const state =
    fromWindow.get("state") || firstParam(route.query.state) || "";
  const error =
    fromWindow.get("error") || firstParam(route.query.error) || "";
  const errorDescription =
    fromWindow.get("error_description") ||
    firstParam(route.query.error_description) ||
    "";

  return {
    code: code ? decodeURIComponent(code) : "",
    state,
    error,
    errorDescription,
  };
}

onMounted(async () => {
  const oauth = readOAuthParams();

  if (oauth.error) {
    statusText.value = `TikTok lỗi: ${oauth.error} ${oauth.errorDescription}`.trim();
    done.value = true;
    message.error(statusText.value);
    return;
  }

  if (!oauth.code) {
    statusText.value = "Thiếu mã xác thực từ TikTok (?code=...).";
    done.value = true;
    message.error(statusText.value);
    return;
  }

  const stateOk = consumeState(oauth.state);
  if (!stateOk) {
    message.warning("State không khớp — vẫn tiếp tục đăng nhập.");
  }

  try {
    const res = await loginWithTikTokCode(oauth.code);
    auth.setSession(res.token, res.user, { refreshToken: res.refreshToken });
    ok.value = true;
    statusText.value = `Đăng nhập thành công — ${res.user.displayName}`;
    message.success(`Xin chào, ${res.user.displayName}`);
    await router.replace("/");
  } catch (e: unknown) {
    statusText.value = readApiError(e, "Đăng nhập TikTok thất bại.");
    message.error(statusText.value);
    done.value = true;
  }
});
</script>

<template>
  <div class="callback-page">
    <p class="brand">Badminton Booking</p>
    <p class="status">{{ statusText }}</p>
    <div v-if="done && !ok" class="actions">
      <a-button type="primary" @click="router.replace('/')">Về trang chủ</a-button>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  background: #f3f7f4;
  color: #374151;
  font-family: "Be Vietnam Pro", sans-serif;
}

.brand {
  margin: 0;
  color: #26c73e;
  font-weight: 600;
}

.status {
  margin: 0;
  text-align: center;
  max-width: 480px;
}
</style>
