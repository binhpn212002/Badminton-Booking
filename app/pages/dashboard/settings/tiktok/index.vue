<script setup lang="ts">
import {
  TIKTOK_CLIENT_KEY,
  TIKTOK_REDIRECT_URI,
} from "~/utils/tiktok-credentials";

definePageMeta({ layout: "management" });

const form = reactive({
  clientKey: TIKTOK_CLIENT_KEY,
  redirectUri: TIKTOK_REDIRECT_URI,
  status: "active",
});
</script>

<template>
  <a-card title="Cấu hình TikTok Login" class="max-w-2xl">
    <a-alert
      type="info"
      show-icon
      class="!mb-4"
      message="Credentials đang hardcode trong app/utils/tiktok-credentials.ts"
    />
    <a-form layout="vertical" :model="form">
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
