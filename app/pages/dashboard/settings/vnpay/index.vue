<script setup lang="ts">
definePageMeta({ layout: 'management' })

const form = reactive({
  tmnCode: 'DEMOTMN',
  hashSecret: '••••••••',
  returnUrl: 'https://badminton.local/payment/vnpay/return',
  status: 'active',
})
</script>

<template>
  <a-card title="Cấu hình VNPay" class="max-w-2xl">
    <a-form layout="vertical" :model="form">
      <a-form-item label="TMN Code">
        <a-input v-model:value="form.tmnCode" />
      </a-form-item>
      <a-form-item label="Hash Secret">
        <a-input-password v-model:value="form.hashSecret" />
      </a-form-item>
      <a-form-item label="Return URL">
        <a-input v-model:value="form.returnUrl" />
      </a-form-item>
      <a-form-item label="Trạng thái">
        <a-select
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
