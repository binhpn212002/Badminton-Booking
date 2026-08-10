<script setup lang="ts">
import { message } from 'ant-design-vue'
import {
  VOUCHER_STATUS_OPTIONS,
  VOUCHER_TYPE_OPTIONS,
} from '~/constants/catalog-options'
import { updateVoucher } from '~/services/voucher'
import { mapApiVoucherToVoucher } from '~/utils/map-voucher'

definePageMeta({ layout: 'management', ssr: false })

const route = useRoute()
const router = useRouter()
const voucherStore = useVoucherStore()

const id = computed(() => String(route.params.id))
await voucherStore.loadVouchers(true, { page: 1, limit: 100 }).catch(() => undefined)
const existing = voucherStore.vouchers.find((item) => item.id === id.value)

if (!existing) {
  await router.replace('/dashboard/vouchers')
}

const saving = ref(false)

const typeOptions = VOUCHER_TYPE_OPTIONS
const statusOptions = VOUCHER_STATUS_OPTIONS

function toDateInput(value?: string) {
  if (!value) return ''
  return value.slice(0, 10)
}

const form = reactive({
  code: existing?.code || '',
  type: (existing?.type || 'percent') as 'percent' | 'fixed',
  value: existing?.value ?? 0,
  minOrder: existing?.minOrder ?? 0,
  usageLimit: existing?.usageLimit ?? 100,
  usedCount: existing?.usedCount ?? 0,
  startAt: toDateInput(existing?.startAt),
  endAt: toDateInput(existing?.endAt),
  status: (existing?.status || 'active') as 'active' | 'inactive' | 'draft',
})

function buildPayload() {
  return {
    code: form.code.trim(),
    type: form.type,
    value: Number(form.value),
    minOrderAmount: Number(form.minOrder),
    usedCount: Number(form.usedCount),
    maxUsage: Number(form.usageLimit),
    startDate: form.startAt,
    endDate: form.endAt,
    status: form.status,
  }
}

function onCancel() {
  router.push('/dashboard/vouchers')
}

async function handleSubmit() {
  saving.value = true
  try {
    const updated = await updateVoucher(Number(id.value), buildPayload())
    voucherStore.upsert(mapApiVoucherToVoucher(updated))
    message.success('Đã cập nhật voucher')
    router.push('/dashboard/vouchers')
  } catch (err) {
    message.error(err instanceof Error ? err.message : 'Không cập nhật được voucher')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <NuxtLink to="/dashboard/vouchers" class="text-sm text-gray-500 hover:text-gray-800">
        ← Quay lại danh sách
      </NuxtLink>
      <h2 class="mt-2 text-xl font-semibold text-gray-900">Cập nhật voucher</h2>
    </div>

    <a-form layout="vertical" :model="form" @finish="handleSubmit">
      <a-card class="mb-4" title="Thông tin voucher">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item
            label="Mã"
            name="code"
            :rules="[{ required: true, message: 'Nhập mã voucher' }]"
          >
            <a-input v-model:value="form.code" placeholder="WELCOME10" />
          </a-form-item>
          <a-form-item
            label="Loại"
            name="type"
            :rules="[{ required: true, message: 'Chọn loại' }]"
          >
            <a-select v-model:value="form.type" :options="typeOptions" />
          </a-form-item>
          <a-form-item
            label="Giá trị"
            name="value"
            :rules="[{ required: true, message: 'Nhập giá trị' }]"
          >
            <a-input-number v-model:value="form.value" class="!w-full" :min="0" />
          </a-form-item>
          <a-form-item
            label="Đơn tối thiểu (VND)"
            name="minOrder"
            :rules="[{ required: true, message: 'Nhập đơn tối thiểu' }]"
          >
            <a-input-number v-model:value="form.minOrder" class="!w-full" :min="0" :step="1000" />
          </a-form-item>
          <a-form-item
            label="Giới hạn sử dụng"
            name="usageLimit"
            :rules="[{ required: true, message: 'Nhập giới hạn' }]"
          >
            <a-input-number v-model:value="form.usageLimit" class="!w-full" :min="1" />
          </a-form-item>
          <a-form-item label="Đã dùng" name="usedCount">
            <a-input-number v-model:value="form.usedCount" class="!w-full" :min="0" />
          </a-form-item>
          <a-form-item
            label="Trạng thái"
            name="status"
            :rules="[{ required: true, message: 'Chọn trạng thái' }]"
          >
            <a-select v-model:value="form.status" :options="statusOptions" />
          </a-form-item>
          <a-form-item
            label="Ngày bắt đầu"
            name="startAt"
            :rules="[{ required: true, message: 'Chọn ngày bắt đầu' }]"
          >
            <a-date-picker
              v-model:value="form.startAt"
              class="!w-full"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="Ngày kết thúc"
            name="endAt"
            :rules="[{ required: true, message: 'Chọn ngày kết thúc' }]"
          >
            <a-date-picker
              v-model:value="form.endAt"
              class="!w-full"
              value-format="YYYY-MM-DD"
            />
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
