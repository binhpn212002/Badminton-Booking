<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Order } from '~/types/management'
import { mockOrders } from '~/utils/mock-management'
import { formatCurrency, formatDateTime } from '~/utils/format'

definePageMeta({ layout: 'management' })

const data = ref<Order[]>([...mockOrders])
const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.code, item.customerName],
  getStatus: (item) => item.orderStatus,
})

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const columns: TableColumnsType<Order> = [
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
  { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
  { title: 'Số món', dataIndex: 'itemsCount', key: 'itemsCount', width: 90 },
  { title: 'Tổng tiền', dataIndex: 'total', key: 'total', width: 130 },
  { title: 'Thanh toán', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 130 },
  { title: 'Trạng thái', dataIndex: 'orderStatus', key: 'orderStatus', width: 130 },
  { title: 'Tạo lúc', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
]
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo mã hoặc khách hàng"
        class="max-w-xs"
      />
      <CommonClientSelect v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'total'">
          {{ formatCurrency(record.total) }}
        </template>
        <template v-else-if="column.key === 'paymentStatus'">
          <CommonStatusTag :status="record.paymentStatus" />
        </template>
        <template v-else-if="column.key === 'orderStatus'">
          <CommonStatusTag :status="record.orderStatus" />
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDateTime(record.createdAt) }}
        </template>
      </template>
    </a-table>
  </div>
</template>
