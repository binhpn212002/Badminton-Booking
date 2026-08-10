<script setup lang="ts">
import { message } from 'ant-design-vue'
import { ACTIVITY_STATUS_OPTIONS } from '~/constants/catalog-options'
import { createActivity } from '~/services/activity'
import { mapApiActivityToActivity } from '~/utils/map-activity'

definePageMeta({ layout: 'management', ssr: false })

const router = useRouter()
const activityStore = useActivityStore()
const saving = ref(false)

const statusOptions = ACTIVITY_STATUS_OPTIONS

const form = reactive({
  title: '',
  startAt: '',
  endAt: '',
  status: 'active' as 'active' | 'inactive' | 'draft',
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
    const created = await createActivity(buildPayload())
    activityStore.upsert(mapApiActivityToActivity(created))
    message.success('Đã tạo hoạt động')
    router.push('/dashboard/settings/activities')
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không tạo được hoạt động')
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
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Thêm hoạt động</h2>
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
