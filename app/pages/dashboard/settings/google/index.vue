<script setup lang="ts">
definePageMeta({ layout: 'management' })

const form = reactive({
  clientId: 'google-client-demo',
  clientSecret: '••••••••',
  redirectUri: 'https://badminton.local/auth/google/callback',
  status: 'active',
})
</script>

<template>
  <a-card title="Cấu hình Google" class="max-w-2xl">
    <a-form layout="vertical" :model="form">
      <a-form-item label="Client ID">
        <a-input v-model:value="form.clientId" />
      </a-form-item>
      <a-form-item label="Client Secret">
        <a-input-password v-model:value="form.clientSecret" />
      </a-form-item>
      <a-form-item label="Redirect URI">
        <a-input v-model:value="form.redirectUri" />
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
      <a-button type="primary">Lưu cấu hình</a-button>
    </a-form>
  </a-card>
</template>
