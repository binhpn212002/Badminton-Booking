<script setup lang="ts">
definePageMeta({ layout: 'management' })

const form = reactive({
  appId: 'zalo-oa-demo',
  secret: '••••••••',
  oaId: '123456789',
  status: 'active',
})
</script>

<template>
  <a-card title="Cấu hình ZaloOA" class="max-w-2xl">
    <a-form layout="vertical" :model="form">
      <a-form-item label="App ID">
        <a-input v-model:value="form.appId" />
      </a-form-item>
      <a-form-item label="App Secret">
        <a-input-password v-model:value="form.secret" />
      </a-form-item>
      <a-form-item label="OA ID">
        <a-input v-model:value="form.oaId" />
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
