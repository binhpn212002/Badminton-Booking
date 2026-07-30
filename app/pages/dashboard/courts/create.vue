<script setup lang="ts">
import type { Court } from '~/types/management'

definePageMeta({ layout: 'management' })

const router = useRouter()
const courtStore = useCourtStore()

function onSave(court: Court) {
  courtStore.upsert(court)
  router.push('/dashboard/courts')
}

function onCancel() {
  router.push('/dashboard/courts')
}
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink to="/dashboard/courts" class="text-sm text-gray-500 hover:text-gray-800">
        ← Quay lại danh sách
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Thêm sân</h2>
    </div>
    <CourtForm @save="onSave" @cancel="onCancel" />
  </div>
</template>
