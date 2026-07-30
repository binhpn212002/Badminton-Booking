<script setup lang="ts">
definePageMeta({ layout: 'management' })

const deleteOpen = ref(false)
const deleting = ref(false)

async function onDelete() {
  deleting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    deleteOpen.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="mb-2 text-xl font-semibold text-gray-900">Component</h2>
      <p class="text-gray-600">Thư viện / demo các component dùng chung.</p>
    </div>

    <a-card title="DeleteRecord" size="small">
      <p class="mb-4 text-gray-600">Popup xác nhận xóa bản ghi.</p>
      <a-button type="primary" @click="deleteOpen = true">Mở modal xóa</a-button>

      <CommonDeleteRecord
        v-model:open="deleteOpen"
        record-name="Sân số 1"
        :loading="deleting"
        @confirm="onDelete"
      />
    </a-card>
  </div>
</template>
