<script setup lang="ts">
import { message } from "ant-design-vue";

const open = defineModel<boolean>("open", { default: false });

const email = ref("");
const password = ref("");
const tiktokLoading = ref(false);
const { startLogin } = useTikTokAuth();

function handleSubmit() {
  open.value = false;
  email.value = "";
  password.value = "";
}

function handleCancel() {
  open.value = false;
}

function handleTikTokLogin() {
  try {
    tiktokLoading.value = true;
    startLogin();
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
    title="Đăng nhập"
    :footer="null"
    destroy-on-close
    @cancel="handleCancel"
  >
    <a-form layout="vertical" @finish="handleSubmit">
      <a-form-item
        label="Email"
        name="email"
        :rules="[{ required: true, message: 'Nhập email' }]"
      >
        <a-input
          v-model:value="email"
          type="email"
          placeholder="email@example.com"
        />
      </a-form-item>
      <a-form-item
        label="Mật khẩu"
        name="password"
        :rules="[{ required: true, message: 'Nhập mật khẩu' }]"
      >
        <a-input-password v-model:value="password" placeholder="••••••••" />
      </a-form-item>
      <a-form-item class="!mb-2">
        <div class="flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" html-type="submit">Đăng nhập</a-button>
        </div>
      </a-form-item>
    </a-form>

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
