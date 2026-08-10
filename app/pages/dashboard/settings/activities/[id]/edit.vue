<script setup lang="ts">
import { message } from 'ant-design-vue'
import { ACTIVITY_STATUS_OPTIONS } from '~/constants/catalog-options'
import { updateActivity } from '~/services/activity'
import { mapApiActivityToActivity } from '~/utils/map-activity'

definePageMeta({ layout: 'management', ssr: false })

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()

const id = computed(() => String(route.params.id))
await activityStore.loadActivities(true, { page: 1, limit: 100 }).catch(() => undefined)
const existing = activityStore.activities.find((item) => item.id === id.value)

if (!existing) {
  await router.replace('/dashboard/settings/activities')
}

const saving = ref(false)
const statusOptions = ACTIVITY_STATUS_OPTIONS

function toDateInput(value?: string) {
  if (!value) return ''
  return value
}

const form = reactive({
  title: existing?.title || '',
  startAt: toDateInput(existing?.startAt),
  endAt: toDateInput(existing?.endAt),
  status: (existing?.status || 'active') as 'active' | 'inactive' | 'draft',
})

function buildPayload() {
  return {
    title: form.title.trim(),
    startDate: form.startAt,
    endDate: form.endAt,
    status: form.status,
  }
}

function onCancel() {
  router.push('/dashboard/settings/activities')
}

async function handleSubmit() {
  saving.value = true
  try {
    const updated = await updateActivity(Number(id.value), buildPayload())
    activityStore.upsert(mapApiActivityToActivity(updated))
    message.success('Đã cập nhật hoạt động')
    router.push('/dashboard/settings/activities')
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không cập nhật được hoạt động')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink
        to="/dashboard/settings/activities"
        class="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Quay lại danh sách
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Cập nhật hoạt động</h2>
    </div>

    <a-form layout="vertical" :model="form" @finish="handleSubmit">
      <a-card class="mb-4" title="Thông tin hoạt động">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item
            label="Tiêu đề"
            name="title"
            class="md:col-span-2"
            :rules="[{ required: true, message: 'Nhập tiêu đề' }]"
          >
            <a-input v-model:value="form.title" placeholder="Giải giao hữu nội bộ" />
          </a-form-item>
          <a-form-item
            label="Bắt đầu"
            name="startAt"
            :rules="[{ required: true, message: 'Chọn thời gian bắt đầu' }]"
          >
            <a-date-picker
              v-model:value="form.startAt"
              show-time
              class="!w-full"
              value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            />
          </a-form-item>
          <a-form-item
            label="Kết thúc"
            name="endAt"
            :rules="[{ required: true, message: 'Chọn thời gian kết thúc' }]"
          >
            <a-date-picker
              v-model:value="form.endAt"
              show-time
              class="!w-full"
              value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
            />
          </a-form-item>
          <a-form-item
            label="Trạng thái"
            name="status"
            :rules="[{ required: true, message: 'Chọn trạng thái' }]"
          >
            <a-select v-model:value="form.status" :options="statusOptions" />
          </a-form-item>
        </div>
      </a-card>

      <div class="flex justify-end gap-2">
        <a-button @click="onCancel">Hủy</a-button>
        <a-button type="primary" html-type="submit" :loading="saving">Lưu</a-button>
      </div>
    </a-form>
  </div>
</template>
