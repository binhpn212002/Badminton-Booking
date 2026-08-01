<script setup lang="ts">
import type { Court } from '~/types/management'

definePageMeta({ layout: 'management' })

const route = useRoute()
const router = useRouter()
const courtStore = useCourtStore()

const id = computed(() => String(route.params.id))

await courtStore.loadCourts().catch(() => undefined)

const court = computed(() => courtStore.getById(id.value))

watch(
  [court, () => courtStore.loaded],
  ([value, loaded]) => {
    if (loaded && !value) router.replace('/dashboard/courts')
  },
  { immediate: true },
)

function onSave(payload: Court) {
  courtStore.upsert(payload)
  router.push('/dashboard/courts')
}

function onCancel() {
  router.push('/dashboard/courts')
}
</script>

<template>
  <div v-if="court">
    <div class="mb-4">
      <NuxtLink to="/dashboard/courts" class="text-sm text-gray-500 hover:text-gray-800">
        ← Quay lại danh sách
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Cập nhật sân</h2>
      <p class="text-gray-500">{{ court.code }} — {{ court.name }}</p>
    </div>
    <CourtForm :court="court" @save="onSave" @cancel="onCancel" />
  </div>
</template>
