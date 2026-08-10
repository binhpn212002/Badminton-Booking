<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Device } from '~/types/management'
import {
  DEVICE_CATEGORY_OPTIONS,
  optionLabel,
} from '~/constants/catalog-options'
import { formatCurrency, formatDateTime } from '~/utils/format'

definePageMeta({ layout: 'management' })

const router = useRouter()
const deviceStore = useDeviceStore()
const data = computed(() => deviceStore.devices)

await deviceStore.loadDevices(true, { page: 1, limit: 100 }).catch(() => undefined)

const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.sku, item.name],
  getStatus: (item) => item.status,
})
const {
  open,
  loading: deleting,
  target,
  askDelete,
  confirmDelete,
} = useDeleteRecord<Device>()

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
]

const columns: TableColumnsType<Device> = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 110 },
  { title: 'Tên', dataIndex: 'name', key: 'name' },
  { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 120 },
  { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', width: 100 },
  { title: 'Giá', dataIndex: 'price', key: 'price', width: 140 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', width: 150 },
  { title: 'Thao tác', key: 'actions', width: 160, align: 'center' },
]

async function onConfirmDelete() {
  await confirmDelete(async (record) => {
    await deviceStore.remove(record.id)
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo SKU hoặc tên"
        class="max-w-xs"
      />
      <CommonClientSelect v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <a-button :loading="deviceStore.loading" @click="deviceStore.loadDevices(true, { page: 1, limit: 100 })">
        Tải lại
      </a-button>
      <div class="ml-auto">
        <a-button type="primary" @click="router.push('/dashboard/devices/create')">
          Thêm thiết bị
        </a-button>
      </div>
    </div>

    <a-alert
      v-if="deviceStore.error"
      class="mb-4"
      type="error"
      show-icon
      :message="deviceStore.error"
    />

    <a-table
      :columns="columns"
      :data-source="filteredData"
      :loading="deviceStore.loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'price'">
          {{ formatCurrency(record.price) }}
        </template>
        <template v-else-if="column.key === 'category'">
          {{ optionLabel(DEVICE_CATEGORY_OPTIONS, record.category) }}
        </template>
        <template v-else-if="column.key === 'status'">
          <CommonStatusTag :status="record.status" />
        </template>
        <template v-else-if="column.key === 'updatedAt'">
          {{ formatDateTime(record.updatedAt) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="router.push(`/dashboard/devices/${record.id}/edit`)">
            Sửa
          </a-button>
          <a-button type="link" danger size="small" @click="askDelete(record)">Xóa</a-button>
        </template>
      </template>
    </a-table>

    <CommonDeleteRecord
      v-model:open="open"
      :record-name="target?.name"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
