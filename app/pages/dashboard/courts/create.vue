<script setup lang="ts">
import {
  API_COURT_SURFACE_OPTIONS,
  type ApiCourtStatus,
  type ApiCourtSurface,
} from '~/types/api'
import { createCourt } from '~/services/court'
import { mapApiCourtToCourt } from '~/utils/map-court'
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'management', ssr: false })

const router = useRouter()
const courtStore = useCourtStore()

const saving = ref(false)

const statusOptions: Array<{ value: ApiCourtStatus; label: string }> = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
  { value: 'under_maintenance', label: 'Bảo trì' },
]

type TimeSlotForm = { start: number; end: number; price: number }

const form = reactive({
  courtName: '',
  location: '',
  courtCode: '',
  status: 'active' as ApiCourtStatus,
  imageUrl: '',
  description: '',
  width: 6.1,
  height: 13.4,
  peopleCapacity: 4,
  surface: 'pvc' as ApiCourtSurface,
  roofHeight: 9,
  isIndoor: true,
  hasConditioning: true,
  hasFans: true,
  isActive: true,
  isMaintenance: false,
  openingHours: '05:00',
  endingHours: '23:00',
  reasonForMaintenance: '',
  timeSlots: [{ start: 5, end: 23, price: 120000 }] as TimeSlotForm[],
})

function addTimeSlot() {
  form.timeSlots.push({ start: 0, end: 0, price: 0 })
}

function removeTimeSlot(index: number) {
  form.timeSlots.splice(index, 1)
}

function onCancel() {
  router.push('/dashboard/courts')
}

function buildPayload() {
  return {
    name: form.courtName,
    location: form.location,
    courtCode: form.courtCode,
    status: form.status,
    imageUrl: form.imageUrl,
    description: form.description,
    width: Number(form.width),
    height: Number(form.height),
    peopleCapacity: Number(form.peopleCapacity),
    surface: form.surface,
    roofHeight: Number(form.roofHeight),
    isIndoor: form.isIndoor,
    hasConditioning: form.hasConditioning,
    hasFans: form.hasFans,
    isActive: form.isActive,
    isMaintenance: form.isMaintenance,
    openingHours: form.openingHours,
    endingHours: form.endingHours,
    reasonForMaintenance: form.reasonForMaintenance,
    timeSlots: form.timeSlots.map((s) => ({
      start: Number(s.start),
      end: Number(s.end),
      price: Number(s.price),
    })),
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    const created = await createCourt(buildPayload())
    courtStore.upsert(mapApiCourtToCourt(created))
    message.success('Đã tạo sân')
    router.push('/dashboard/courts')
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không tạo được sân')
  } finally {
    saving.value = false
  }
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

    <a-form layout="vertical" :model="form" @finish="handleSubmit">
      <a-card class="mb-4" title="Thông tin cơ bản">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item
            label="Mã sân"
            name="courtCode"
            :rules="[{ required: true, message: 'Nhập mã sân' }]"
          >
            <a-input v-model:value="form.courtCode" placeholder="S1, S2..." />
          </a-form-item>
          <a-form-item
            label="Tên sân"
            name="courtName"
            :rules="[{ required: true, message: 'Nhập tên sân' }]"
          >
            <a-input v-model:value="form.courtName" />
          </a-form-item>
          <a-form-item
            label="Địa điểm"
            name="location"
            :rules="[{ required: true, message: 'Nhập địa điểm' }]"
          >
            <a-input v-model:value="form.location" />
          </a-form-item>
          <a-form-item
            label="Trạng thái"
            name="status"
            :rules="[{ required: true, message: 'Chọn trạng thái' }]"
          >
            <a-select v-model:value="form.status" :options="statusOptions" />
          </a-form-item>
          <a-form-item label="Ảnh (imageUrl)" class="md:col-span-2">
            <a-input v-model:value="form.imageUrl" placeholder="URL ảnh" />
          </a-form-item>
          <a-form-item label="Mô tả" class="md:col-span-2">
            <a-textarea v-model:value="form.description" :rows="3" />
          </a-form-item>
        </div>
      </a-card>

      <a-card class="mb-4" title="Thông tin vật lý">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-3">
          <a-form-item label="Chiều rộng (m)">
            <a-input-number v-model:value="form.width" class="!w-full" :min="0" :step="0.1" />
          </a-form-item>
          <a-form-item label="Chiều dài (m)">
            <a-input-number v-model:value="form.height" class="!w-full" :min="0" :step="0.1" />
          </a-form-item>
          <a-form-item label="Số người">
            <a-input-number v-model:value="form.peopleCapacity" class="!w-full" :min="1" />
          </a-form-item>
          <a-form-item
            label="Mặt sân"
            name="surface"
            :rules="[{ required: true, message: 'Chọn mặt sân' }]"
          >
            <a-select v-model:value="form.surface" :options="API_COURT_SURFACE_OPTIONS" />
          </a-form-item>
          <a-form-item label="Chiều cao trần (m)">
            <a-input-number v-model:value="form.roofHeight" class="!w-full" :min="0" :step="0.1" />
          </a-form-item>
          <a-form-item label="Trong nhà">
            <a-switch v-model:checked="form.isIndoor" />
          </a-form-item>
          <a-form-item label="Máy lạnh">
            <a-switch v-model:checked="form.hasConditioning" />
          </a-form-item>
          <a-form-item label="Quạt">
            <a-switch v-model:checked="form.hasFans" />
          </a-form-item>
        </div>
      </a-card>

      <a-card class="mb-4" title="Khung giờ giá">
        <div class="mb-3 space-y-2">
          <div
            v-for="(slot, index) in form.timeSlots"
            :key="index"
            class="grid grid-cols-1 items-end gap-2 md:grid-cols-4"
          >
            <a-form-item label="Bắt đầu (giờ)" class="!mb-2">
              <a-input-number v-model:value="slot.start" class="!w-full" :min="0" :max="24" />
            </a-form-item>
            <a-form-item label="Kết thúc (giờ)" class="!mb-2">
              <a-input-number v-model:value="slot.end" class="!w-full" :min="0" :max="24" />
            </a-form-item>
            <a-form-item label="Giá (VND)" class="!mb-2">
              <a-input-number v-model:value="slot.price" class="!w-full" :min="0" :step="10000" />
            </a-form-item>
            <a-form-item class="!mb-2">
              <a-button danger :disabled="form.timeSlots.length <= 1" @click="removeTimeSlot(index)">
                Xóa
              </a-button>
            </a-form-item>
          </div>
          <a-button type="dashed" block @click="addTimeSlot">Thêm khung giờ</a-button>
        </div>
      </a-card>

      <a-card class="mb-4" title="Tình trạng & giờ mở">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item label="Đang hoạt động">
            <a-switch v-model:checked="form.isActive" />
          </a-form-item>
          <a-form-item label="Đang bảo trì">
            <a-switch v-model:checked="form.isMaintenance" />
          </a-form-item>
          <a-form-item label="Lý do bảo trì" class="md:col-span-2">
            <a-input
              v-model:value="form.reasonForMaintenance"
              :disabled="!form.isMaintenance"
              placeholder="Thay lưới..."
            />
          </a-form-item>
          <a-form-item label="Giờ mở">
            <a-input v-model:value="form.openingHours" placeholder="05:00" />
          </a-form-item>
          <a-form-item label="Giờ đóng">
            <a-input v-model:value="form.endingHours" placeholder="23:00" />
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
