<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  API_COURT_SURFACE_OPTIONS,
  type ApiCourtStatus,
  type ApiCourtSurface,
} from '~/types/api'
import { fetchCourtById, updateCourt } from '~/services/court'
import { mapApiCourtToCourt } from '~/utils/map-court'

definePageMeta({ layout: 'management', ssr: false })

const route = useRoute()
const router = useRouter()
const courtStore = useCourtStore()

const id = computed(() => Number(route.params.id))
const apiCourt = await fetchCourtById(id.value).catch(() => null)

if (!apiCourt) {
  await router.replace('/dashboard/courts')
}

const saving = ref(false)

const statusOptions: Array<{ value: ApiCourtStatus; label: string }> = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
  { value: 'under_maintenance', label: 'Bảo trì' },
]

type TimeSlotForm = { start: number; end: number; price: number }

const form = reactive({
  courtName: apiCourt?.name || '',
  location: apiCourt?.location || '',
  courtCode: apiCourt?.courtCode || '',
  status: (apiCourt?.status || 'active') as ApiCourtStatus,
  imageUrl: apiCourt?.imageUrl || '',
  description: apiCourt?.description || '',
  width: apiCourt?.width ?? 6.1,
  height: apiCourt?.height ?? 13.4,
  peopleCapacity: apiCourt?.peopleCapacity ?? 4,
  surface: (apiCourt?.surface || 'pvc') as ApiCourtSurface,
  roofHeight: apiCourt?.roofHeight ?? 9,
  isIndoor: apiCourt?.isIndoor ?? true,
  hasConditioning: apiCourt?.hasConditioning ?? true,
  hasFans: apiCourt?.hasFans ?? true,
  isActive: apiCourt?.isActive ?? true,
  isMaintenance: apiCourt?.isMaintenance ?? false,
  openingHours: apiCourt?.openingHours || '05:00',
  endingHours: apiCourt?.endingHours || '23:00',
  reasonForMaintenance: apiCourt?.reasonForMaintenance || '',
  timeSlots: (apiCourt?.timeSlots?.map((s) => ({
    start: s.start,
    end: s.end,
    price: s.price,
  })) || [{ start: 5, end: 23, price: 120000 }]) as TimeSlotForm[],
})

function addTimeSlot() {
  form.timeSlots.push({ start: 0, end: 0, price: 0 })
}

function removeTimeSlot(index: number) {
  form.timeSlots.splice(index, 1)
}

function onCancel() {
  router.push(`/dashboard/courts/${id.value}`)
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
  if (!apiCourt) return
  saving.value = true
  try {
    console.log(buildPayload())
    const updated = await updateCourt(apiCourt.id, buildPayload())
    console.log(updated)
    message.success('Đã cập nhật sân')
    // router.push(`/dashboard/courts/${apiCourt.id}`)
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không cập nhật được sân')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="apiCourt">
    <div class="mb-4">
      <NuxtLink
        :to="`/dashboard/courts/${apiCourt.id}`"
        class="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Quay lại chi tiết
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Cập nhật sân</h2>
      <p class="text-gray-500">{{ apiCourt.courtCode }} — {{ apiCourt.name }}</p>
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
