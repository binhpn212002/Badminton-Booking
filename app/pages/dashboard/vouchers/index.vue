<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Voucher } from '~/types/management'
import { mockVouchers } from '~/utils/mock-management'
import { formatCurrency, formatDate } from '~/utils/format'

definePageMeta({ layout: 'management' })

const data = ref<Voucher[]>([...mockVouchers])
const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.code],
  getStatus: (item) => item.status,
})
const { open, loading, target, askDelete, confirmDelete } = useDeleteRecord<Voucher>()

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
  { value: 'draft', label: 'Nháp' },
]

const columns: TableColumnsType<Voucher> = [
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 130 },
  { title: 'Loại', dataIndex: 'type', key: 'type', width: 100 },
  { title: 'Giá trị', dataIndex: 'value', key: 'value', width: 120 },
  { title: 'Đơn tối thiểu', dataIndex: 'minOrder', key: 'minOrder', width: 130 },
  { title: 'Đã dùng', key: 'usage', width: 110 },
  { title: 'Bắt đầu', dataIndex: 'startAt', key: 'startAt', width: 120 },
  { title: 'Kết thúc', dataIndex: 'endAt', key: 'endAt', width: 120 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Thao tác', key: 'actions', width: 100, align: 'center' },
]

async function onConfirmDelete() {
  await confirmDelete(async (record) => {
    await new Promise((r) => setTimeout(r, 400))
    data.value = data.value.filter((item) => item.id !== record.id)
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo mã voucher"
        class="max-w-xs"
      />
      <a-select v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <div class="ml-auto">
        <a-button type="primary">Thêm voucher</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ record.type === 'percent' ? '%' : 'Cố định' }}
        </template>
        <template v-else-if="column.key === 'value'">
          {{ record.type === 'percent' ? `${record.value}%` : formatCurrency(record.value) }}
        </template>
        <template v-else-if="column.key === 'minOrder'">
          {{ formatCurrency(record.minOrder) }}
        </template>
        <template v-else-if="column.key === 'usage'">
          {{ record.usedCount }}/{{ record.usageLimit }}
        </template>
        <template v-else-if="column.key === 'startAt'">
          {{ formatDate(record.startAt) }}
        </template>
        <template v-else-if="column.key === 'endAt'">
          {{ formatDate(record.endAt) }}
        </template>
        <template v-else-if="column.key === 'status'">
          <CommonStatusTag :status="record.status" />
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" danger size="small" @click="askDelete(record)">Xóa</a-button>
        </template>
      </template>
    </a-table>

    <CommonDeleteRecord
      v-model:open="open"
      :record-name="target?.code"
      :loading="loading"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
