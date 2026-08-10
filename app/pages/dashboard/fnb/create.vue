<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  CATALOG_STATUS_OPTIONS,
  FOOD_CATEGORY_OPTIONS,
} from '~/constants/catalog-options'
import { createFood } from '~/services/food'
import { mapApiFoodToFnbItem } from '~/utils/map-food'

definePageMeta({ layout: 'management', ssr: false })

const router = useRouter()
const foodStore = useFoodStore()
const saving = ref(false)

const categoryOptions = FOOD_CATEGORY_OPTIONS
const statusOptions = CATALOG_STATUS_OPTIONS

const form = reactive({
  name: '',
  category: FOOD_CATEGORY_OPTIONS[0]?.value || '',
  price: 0,
  stock: 0,
  status: 'active' as 'active' | 'inactive',
})

function buildPayload() {
  return {
    name: form.name.trim(),
    category: form.category,
    price: Number(form.price),
    stock: Number(form.stock),
    status: form.status,
  }
}

function onCancel() {
  router.push('/dashboard/fnb')
}

async function handleSubmit() {
  saving.value = true
  try {
    const created = await createFood(buildPayload())
    foodStore.upsert(mapApiFoodToFnbItem(created))
    message.success('Đã tạo món')
    router.push('/dashboard/fnb')
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không tạo được món')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink to="/dashboard/fnb" class="text-sm text-gray-500 hover:text-gray-800">
        ← Quay lại danh sách
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Thêm món</h2>
    </div>

    <a-form layout="vertical" :model="form" @finish="handleSubmit">
      <a-card class="mb-4" title="Thông tin món">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
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
            label="Giá (VND)"
            name="price"
            :rules="[{ required: true, message: 'Nhập giá' }]"
          >
            <a-input-number v-model:value="form.price" class="!w-full" :min="0" :step="1000" />
          </a-form-item>
          <a-form-item
            label="Tồn kho"
            name="stock"
            :rules="[{ required: true, message: 'Nhập tồn kho' }]"
          >
            <a-input-number v-model:value="form.stock" class="!w-full" :min="0" />
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
