<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { Court, CourtPriceSlot, CourtStatus } from '~/types/management'
import { mockBranches } from '~/utils/mock-management'

const props = defineProps<{
  court?: Court | null
}>()

const emit = defineEmits<{
  save: [court: Court]
  cancel: []
}>()

const saving = ref(false)

const branchOptions = mockBranches.map((b) => ({ value: b.id, label: b.name }))
const statusOptions: Array<{ value: CourtStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'CLOSED', label: 'Đóng cửa' },
]

function emptyForm(): Omit<Court, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
  galleryText: string
} {
  return {
    branchId: mockBranches[0]?.id ?? '',
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE',
    image: '',
    gallery: [],
    galleryText: '',
    length: 13.4,
    width: 6.1,
    surface: 'PVC',
    indoor: true,
    floorType: 'Thảm PVC',
    lighting: 'LED',
    ceilingHeight: 9,
    airCondition: true,
    fan: true,
    capacity: 4,
    priceSlots: [{ from: '05:00', to: '23:00', price: 120000 }],
    isAvailable: true,
    isMaintenance: false,
    maintenanceReason: '',
    availableFrom: '05:00',
    availableTo: '23:00',
  }
}

const form = reactive(emptyForm())

watch(
  () => props.court,
  (court) => {
    Object.assign(form, emptyForm())
    if (court) {
      Object.assign(form, {
        ...court,
        galleryText: court.gallery.join('\n'),
        priceSlots: court.priceSlots.map((s) => ({ ...s })),
      })
    }
  },
  { immediate: true },
)

function addPriceSlot() {
  form.priceSlots.push({ from: '00:00', to: '00:00', price: 0 })
}

function removePriceSlot(index: number) {
  form.priceSlots.splice(index, 1)
}

async function handleSubmit() {
  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 400))
    const gallery = form.galleryText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload: Court = {
      id: props.court?.id ?? uuidv4(),
      branchId: form.branchId,
      code: form.code,
      name: form.name,
      description: form.description,
      status: form.status,
      image: form.image,
      gallery,
      length: Number(form.length),
      width: Number(form.width),
      surface: form.surface,
      indoor: form.indoor,
      floorType: form.floorType,
      lighting: form.lighting,
      ceilingHeight: Number(form.ceilingHeight),
      airCondition: form.airCondition,
      fan: form.fan,
      capacity: Number(form.capacity),
      priceSlots: form.priceSlots.map((s: CourtPriceSlot) => ({
        from: s.from,
        to: s.to,
        price: Number(s.price),
      })),
      isAvailable: form.isAvailable,
      isMaintenance: form.isMaintenance,
      maintenanceReason: form.maintenanceReason,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      createdAt: props.court?.createdAt ?? new Date().toISOString(),
    }

    emit('save', payload)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <a-form layout="vertical" @finish="handleSubmit">
    <a-card class="mb-4" title="Thông tin cơ bản">
      <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <a-form-item label="Mã sân" name="code" :rules="[{ required: true, message: 'Nhập mã sân' }]">
          <a-input v-model:value="form.code" placeholder="S1, S2..." />
        </a-form-item>
        <a-form-item label="Tên sân" name="name" :rules="[{ required: true, message: 'Nhập tên sân' }]">
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="Trạng thái" name="status" :rules="[{ required: true }]">
          <CommonClientSelect v-model:value="form.status" :options="statusOptions" />
        </a-form-item>
        <a-form-item label="Ảnh đại diện" class="md:col-span-2">
          <a-input v-model:value="form.image" placeholder="URL ảnh" />
        </a-form-item>
        <a-form-item label="Mô tả" class="md:col-span-2">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
      </div>
    </a-card>

    <a-card class="mb-4" title="Thông tin vật lý">
      <div class="grid grid-cols-1 gap-x-4 md:grid-cols-3">
        <a-form-item label="Chiều dài (m)">
          <a-input-number v-model:value="form.length" class="!w-full" :min="0" :step="0.1" />
        </a-form-item>
        <a-form-item label="Chiều rộng (m)">
          <a-input-number v-model:value="form.width" class="!w-full" :min="0" :step="0.1" />
        </a-form-item>
        <a-form-item label="Số người">
          <a-input-number v-model:value="form.capacity" class="!w-full" :min="1" />
        </a-form-item>
        <a-form-item label="Mặt sân">
          <a-input v-model:value="form.surface" />
        </a-form-item>
        <a-form-item label="Chiều cao trần (m)">
          <a-input-number v-model:value="form.ceilingHeight" class="!w-full" :min="0" :step="0.1" />
        </a-form-item>
        <a-form-item label="Trong nhà">
          <a-switch v-model:checked="form.indoor" />
        </a-form-item>
        <a-form-item label="Máy lạnh">
          <a-switch v-model:checked="form.airCondition" />
        </a-form-item>
        <a-form-item label="Quạt">
          <a-switch v-model:checked="form.fan" />
        </a-form-item>
      </div>
    </a-card>

    <a-card class="mb-4" title="Bảng giá theo khung giờ">
      <div class="mb-3 space-y-2">
        <div
          v-for="(slot, index) in form.priceSlots"
          :key="index"
          class="grid grid-cols-1 items-end gap-2 md:grid-cols-4"
        >
          <a-form-item label="Từ" class="!mb-2">
            <a-input v-model:value="slot.from" placeholder="05:00" />
          </a-form-item>
          <a-form-item label="Đến" class="!mb-2">
            <a-input v-model:value="slot.to" placeholder="17:00" />
          </a-form-item>
          <a-form-item label="Giá (VND)" class="!mb-2">
            <a-input-number v-model:value="slot.price" class="!w-full" :min="0" :step="10000" />
          </a-form-item>
          <a-form-item class="!mb-2">
            <a-button danger :disabled="form.priceSlots.length <= 1" @click="removePriceSlot(index)">
              Xóa
            </a-button>
          </a-form-item>
        </div>
        <a-button type="dashed" block @click="addPriceSlot">Thêm khung giờ</a-button>
      </div>
    </a-card>

    <a-card class="mb-4" title="Tình trạng & giờ mở">
      <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <a-form-item label="Đang khả dụng">
          <a-switch v-model:checked="form.isAvailable" />
        </a-form-item>
        <a-form-item label="Đang bảo trì">
          <a-switch v-model:checked="form.isMaintenance" />
        </a-form-item>
        <a-form-item label="Lý do bảo trì" class="md:col-span-2">
          <a-input
            v-model:value="form.maintenanceReason"
            :disabled="!form.isMaintenance"
            placeholder="Thay lưới..."
          />
        </a-form-item>
        <a-form-item label="Mở từ">
          <a-input v-model:value="form.availableFrom" placeholder="05:00" />
        </a-form-item>
        <a-form-item label="Mở đến">
          <a-input v-model:value="form.availableTo" placeholder="23:00" />
        </a-form-item>
      </div>
    </a-card>

    <div class="flex justify-end gap-2">
      <a-button @click="emit('cancel')">Hủy</a-button>
      <a-button type="primary" html-type="submit" :loading="saving">Lưu</a-button>
    </div>
  </a-form>
</template>
