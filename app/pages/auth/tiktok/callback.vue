<script setup lang="ts">
import { message } from "ant-design-vue";
import { loginWithTikTokCode, type TikTokDebugInfo } from "~/services/auth";

definePageMeta({ layout: false });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { consumeState } = useTikTokAuth();

const statusText = ref("Đang đăng nhập bằng TikTok…");
const debugLogs = ref<Record<string, unknown>>({});
const debugPayload = ref<TikTokDebugInfo | null>(null);
const done = ref(false);
const ok = ref(false);

function pretty(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function firstParam(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  if (typeof value === "string") return value;
  return value == null ? "" : String(value);
}

/** Ưu tiên window.location — tránh mất query khi Netlify/Nuxt redirect trailing slash */
function readOAuthParams() {
  const fromWindow = new URLSearchParams(window.location.search);
  const code =
    fromWindow.get("code") ||
    firstParam(route.query.code) ||
    "";
  const state =
    fromWindow.get("state") ||
    firstParam(route.query.state) ||
    "";
  const error =
    fromWindow.get("error") ||
    firstParam(route.query.error) ||
    "";
  const errorDescription =
    fromWindow.get("error_description") ||
    firstParam(route.query.error_description) ||
    "";

  return {
    code: code ? decodeURIComponent(code) : "",
    state,
    error,
    errorDescription,
    href: window.location.href,
    search: window.location.search,
  };
}

onMounted(async () => {
  const oauth = readOAuthParams();
  debugLogs.value = {
    href: oauth.href,
    search: oauth.search,
    routeQuery: { ...route.query },
    code: oauth.code,
    state: oauth.state,
    error: oauth.error,
    errorDescription: oauth.errorDescription,
    expectedState: sessionStorage.getItem("tiktok_oauth_state"),
  };
  console.log("[TikTok callback]", debugLogs.value);

  if (oauth.error) {
    statusText.value = `TikTok lỗi: ${oauth.error} ${oauth.errorDescription}`.trim();
    done.value = true;
    message.error(statusText.value);
    return;
  }

  if (!oauth.code) {
    statusText.value =
      "Thiếu mã xác thực từ TikTok. Kiểm tra URL có ?code=... không (xem debug).";
    done.value = true;
    message.error(statusText.value);
    return;
  }

  const stateOk = consumeState(oauth.state);
  debugLogs.value.stateOk = stateOk;
  if (!stateOk) {
    message.warning("State không khớp — vẫn gọi API để debug.");
  }

  try {
    const res = await loginWithTikTokCode(oauth.code);
    debugPayload.value = res.debug;
    debugLogs.value.resultUser = res.user;
    debugLogs.value.accessTokenPreview = `${res.accessToken.slice(0, 24)}…`;

    auth.setSession(res.accessToken, res.user);
    ok.value = true;
    statusText.value = `OK — ${res.user.displayName}. Xem debug bên dưới.`;
    message.success(`Xin chào, ${res.user.displayName}`);
  } catch (e: unknown) {
    const err = e as Error & { debug?: TikTokDebugInfo };
    debugPayload.value = err.debug || null;
    debugLogs.value.catchError = err.message || String(e);
    statusText.value = err.message || "Đăng nhập TikTok thất bại.";
    message.error(statusText.value);
  } finally {
    done.value = true;
    console.log("[TikTok callback] final", {
      debugLogs: debugLogs.value,
      debugPayload: debugPayload.value,
    });
  }
});
</script>

<template>
  <div class="callback-page">
    <p class="brand">Badminton Booking</p>
    <p class="status">{{ statusText }}</p>

    <div v-if="done" class="actions">
      <a-button type="primary" @click="router.replace('/')">Về trang chủ</a-button>
    </div>

    <section class="debug">
      <h2>Debug — URL / query</h2>
      <pre>{{ pretty(debugLogs) }}</pre>

      <h2>Debug — TikTok request / response</h2>
      <pre v-if="debugPayload">{{ pretty(debugPayload) }}</pre>
      <pre v-else>Chưa có response từ TikTok API</pre>

      <p class="hint">
        URL sau Continue phải có <code>?code=...</code>.
        Nếu <code>search</code> rỗng → Redirect URI trên Portal chưa khớp.
      </p>
    </section>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px 48px;
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
  max-width: 720px;
}

.actions {
  margin-top: 4px;
}

.debug {
  width: min(920px, 100%);
  text-align: left;
  background: #111827;
  color: #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.debug h2 {
  margin: 0 0 8px;
  font-size: 0.95rem;
  color: #86efac;
}

.debug h2 + pre {
  margin-bottom: 16px;
}

pre {
  margin: 0;
  padding: 12px;
  overflow: auto;
  background: #0b1220;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.hint {
  margin: 12px 0 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

code {
  color: #86efac;
}
</style>
