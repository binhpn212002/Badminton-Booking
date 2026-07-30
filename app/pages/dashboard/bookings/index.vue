<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Booking } from '~/types/management'
import { mockBookings } from '~/utils/mock-management'
import { formatCurrency, formatDate, formatDateTime } from '~/utils/format'

definePageMeta({ layout: 'management' })

const data = ref<Booking[]>([...mockBookings])
const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.code, item.customerName, item.court],
  getStatus: (item) => item.status,
})

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const columns: TableColumnsType<Booking> = [
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
  { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
  { title: 'Sân', dataIndex: 'court', key: 'court', width: 110 },
  { title: 'Ngày', dataIndex: 'date', key: 'date', width: 120 },
  { title: 'Khung giờ', dataIndex: 'timeSlot', key: 'timeSlot', width: 130 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130 },
  { title: 'Tổng tiền', dataIndex: 'total', key: 'total', width: 130 },
  { title: 'Tạo lúc', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
]
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo mã, khách hàng hoặc sân"
        class="max-w-xs"
      />
      <a-select v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'date'">
          {{ formatDate(record.date) }}
        </template>
        <template v-else-if="column.key === 'status'">
          <CommonStatusTag :status="record.status" />
        </template>
        <template v-else-if="column.key === 'total'">
          {{ formatCurrency(record.total) }}
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDateTime(record.createdAt) }}
        </template>
      </template>
    </a-table>
  </div>
</template>
