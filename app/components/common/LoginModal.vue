<script setup lang="ts">
import { message } from "ant-design-vue";
import {
  loginWithEmail,
  readApiError,
  registerWithEmail,
} from "~/services/auth";

const open = defineModel<boolean>("open", { default: false });

const auth = useAuthStore();
const tab = ref<"login" | "register">("login");
const submitting = ref(false);
const tiktokLoading = ref(false);
const { startLogin } = useTikTokAuth();

const loginForm = reactive({
  email: "",
  password: "",
});

const registerForm = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});

watch(open, (value) => {
  if (!value) return;
  tab.value = "login";
  loginForm.email = "";
  loginForm.password = "";
  registerForm.email = "";
  registerForm.password = "";
  registerForm.confirmPassword = "";
});

function handleCancel() {
  open.value = false;
}

async function handleLogin() {
  submitting.value = true;
  try {
    const res = await loginWithEmail({
      email: loginForm.email.trim(),
      password: loginForm.password,
    });
    auth.setSession(res.token, res.user, { refreshToken: res.refreshToken });
    message.success(`Xin chào, ${res.user.displayName}`);
    open.value = false;
  } catch (err) {
    message.error(readApiError(err, "Đăng nhập thất bại"));
  } finally {
    submitting.value = false;
  }
}

async function handleRegister() {
  if (registerForm.password !== registerForm.confirmPassword) {
    message.warning("Mật khẩu xác nhận không khớp");
    return;
  }
  submitting.value = true;
  try {
    const res = await registerWithEmail({
      email: registerForm.email.trim(),
      password: registerForm.password,
    });
    auth.setSession(res.token, res.user, { refreshToken: res.refreshToken });
    message.success("Đăng ký thành công");
    open.value = false;
  } catch (err) {
    message.error(readApiError(err, "Đăng ký thất bại"));
  } finally {
    submitting.value = false;
  }
}

async function handleTikTokLogin() {
  try {
    tiktokLoading.value = true;
    await startLogin();
  } catch (e: unknown) {
    tiktokLoading.value = false;
    message.error(
      e instanceof Error ? e.message : "Không thể bắt đầu đăng nhập TikTok",
    );
  }
}
</script>

<template>
  <a-modal
    v-model:open="open"
    :title="tab === 'login' ? 'Đăng nhập' : 'Đăng ký'"
    :footer="null"
    destroy-on-close
    @cancel="handleCancel"
  >
    <a-tabs v-model:activeKey="tab" centered>
      <a-tab-pane key="login" tab="Đăng nhập">
        <a-form layout="vertical" :model="loginForm" @finish="handleLogin">
          <a-form-item
            label="Email"
            name="email"
            :rules="[
              { required: true, message: 'Nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]"
          >
            <a-input
              v-model:value="loginForm.email"
              type="email"
              placeholder="email@example.com"
            />
          </a-form-item>
          <a-form-item
            label="Mật khẩu"
            name="password"
            :rules="[{ required: true, message: 'Nhập mật khẩu' }]"
          >
            <a-input-password
              v-model:value="loginForm.password"
              placeholder="••••••••"
            />
          </a-form-item>
          <a-form-item class="!mb-2">
            <div class="flex justify-end gap-2">
              <a-button @click="handleCancel">Hủy</a-button>
              <a-button type="primary" html-type="submit" :loading="submitting">
                Đăng nhập
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="register" tab="Đăng ký">
        <a-form layout="vertical" :model="registerForm" @finish="handleRegister">
          <a-form-item
            label="Email"
            name="email"
            :rules="[
              { required: true, message: 'Nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]"
          >
            <a-input
              v-model:value="registerForm.email"
              type="email"
              placeholder="email@example.com"
            />
          </a-form-item>
          <a-form-item
            label="Mật khẩu"
            name="password"
            :rules="[
              { required: true, message: 'Nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]"
          >
            <a-input-password
              v-model:value="registerForm.password"
              placeholder="••••••••"
            />
          </a-form-item>
          <a-form-item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            :rules="[{ required: true, message: 'Nhập lại mật khẩu' }]"
          >
            <a-input-password
              v-model:value="registerForm.confirmPassword"
              placeholder="••••••••"
            />
          </a-form-item>
          <a-form-item class="!mb-2">
            <div class="flex justify-end gap-2">
              <a-button @click="handleCancel">Hủy</a-button>
              <a-button type="primary" html-type="submit" :loading="submitting">
                Đăng ký
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <a-divider plain>hoặc</a-divider>

    <a-button
      block
      size="large"
      :loading="tiktokLoading"
      class="tiktok-btn"
      @click="handleTikTokLogin"
    >
      Đăng nhập bằng TikTok
    </a-button>
  </a-modal>
</template>

<style scoped>
.tiktok-btn {
  background: #010101 !important;
  border-color: #010101 !important;
  color: #fff !important;
}
</style>
