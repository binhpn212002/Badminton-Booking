<script setup lang="ts">
definePageMeta({ layout: 'management' })

const form = reactive({
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  fromEmail: 'noreply@badminton.local',
  fromName: 'Badminton Booking',
  status: 'active',
})
</script>

<template>
  <a-card title="Cấu hình Email" class="max-w-2xl">
    <a-form layout="vertical" :model="form">
      <a-form-item label="SMTP Host">
        <a-input v-model:value="form.smtpHost" />
      </a-form-item>
      <a-form-item label="SMTP Port">
        <a-input-number v-model:value="form.smtpPort" class="!w-full" />
      </a-form-item>
      <a-form-item label="From Email">
        <a-input v-model:value="form.fromEmail" />
      </a-form-item>
      <a-form-item label="From Name">
        <a-input v-model:value="form.fromName" />
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
