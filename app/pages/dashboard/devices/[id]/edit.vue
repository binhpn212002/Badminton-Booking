<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  CATALOG_STATUS_OPTIONS,
  DEVICE_CATEGORY_OPTIONS,
} from '~/constants/catalog-options'
import { updateDevice } from '~/services/device'
import { mapApiDeviceToDevice } from '~/utils/map-device'

definePageMeta({ layout: 'management', ssr: false })

const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()

const id = computed(() => String(route.params.id))
await deviceStore.loadDevices(true, { page: 1, limit: 100 }).catch(() => undefined)
const existing = deviceStore.devices.find((item) => item.id === id.value)

if (!existing) {
  await router.replace('/dashboard/devices')
}

const saving = ref(false)

const categoryOptions = computed(() => {
  const options = [...DEVICE_CATEGORY_OPTIONS]
  const current = existing?.category
  if (current && !options.some((item) => item.value === current)) {
    options.unshift({ value: current, label: current })
  }
  return options
})
const statusOptions = CATALOG_STATUS_OPTIONS

const form = reactive({
  sku: existing?.sku || '',
  name: existing?.name || '',
  category: existing?.category || DEVICE_CATEGORY_OPTIONS[0]?.value || '',
  stock: existing?.stock ?? 0,
  price: existing?.price ?? 0,
  status: (existing?.status || 'active') as 'active' | 'inactive',
})

function buildPayload() {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    category: form.category,
    stock: Number(form.stock),
    price: Number(form.price),
    status: form.status,
  }
}

function onCancel() {
  router.push('/dashboard/devices')
}

async function handleSubmit() {
  saving.value = true
  try {
    const updated = await updateDevice(Number(id.value), buildPayload())
    deviceStore.upsert(mapApiDeviceToDevice(updated))
    message.success('Đã cập nhật thiết bị')
    router.push('/dashboard/devices')
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không cập nhật được thiết bị')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink to="/dashboard/devices" class="text-sm text-gray-500 hover:text-gray-800">
        ← Quay lại danh sách
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Cập nhật thiết bị</h2>
    </div>

    <a-form layout="vertical" :model="form" @finish="handleSubmit">
      <a-card class="mb-4" title="Thông tin thiết bị">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item
            label="SKU"
            name="sku"
            :rules="[{ required: true, message: 'Nhập SKU' }]"
          >
            <a-input v-model:value="form.sku" placeholder="RKT-YONEX-001" />
          </a-form-item>
          <a-form-item
            label="Tên"
            name="name"
            :rules="[{ required: true, message: 'Nhập tên' }]"
          >
            <a-input v-model:value="form.name" />
          </a-form-item>
          <a-form-item
            label="Danh mục"
            name="category"
            :rules="[{ required: true, message: 'Chọn danh mục' }]"
          >
            <a-select v-model:value="form.category" :options="categoryOptions" placeholder="Chọn danh mục" />
          </a-form-item>
          <a-form-item
            label="Trạng thái"
            name="status"
            :rules="[{ required: true, message: 'Chọn trạng thái' }]"
          >
            <a-select v-model:value="form.status" :options="statusOptions" />
          </a-form-item>
          <a-form-item
            label="Tồn kho"
            name="stock"
            :rules="[{ required: true, message: 'Nhập tồn kho' }]"
          >
            <a-input-number v-model:value="form.stock" class="!w-full" :min="0" />
          </a-form-item>
          <a-form-item
            label="Giá (VND)"
            name="price"
            :rules="[{ required: true, message: 'Nhập giá' }]"
          >
            <a-input-number v-model:value="form.price" class="!w-full" :min="0" :step="1000" />
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
