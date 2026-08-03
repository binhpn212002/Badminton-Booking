<script setup lang="ts">
import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_ENV,
  TIKTOK_REDIRECT_URI,
} from "~/utils/tiktok-credentials";

definePageMeta({ layout: "management" });

const form = reactive({
  env: TIKTOK_ENV,
  clientKey: TIKTOK_CLIENT_KEY,
  redirectUri: TIKTOK_REDIRECT_URI,
  status: "active",
});
</script>

<template>
  <a-card title="Cấu hình TikTok Login" class="max-w-2xl">
    <a-alert
      type="warning"
      show-icon
      class="!mb-4"
      message="Đang dùng môi trường Sandbox. Chỉ account được thêm làm Target user mới login được."
    />
    <a-form layout="vertical" :model="form">
      <a-form-item label="Environment">
        <a-input v-model:value="form.env" readonly />
      </a-form-item>
      <a-form-item label="Client Key">
        <a-input v-model:value="form.clientKey" readonly />
      </a-form-item>
      <a-form-item label="Redirect URI">
        <a-input v-model:value="form.redirectUri" readonly />
      </a-form-item>
      <a-form-item label="Trạng thái">
        <CommonClientSelect
          v-model:value="form.status"
          :options="[
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Ngưng' },
          ]"
        />
      </a-form-item>
    </a-form>
  </a-card>
</template>
