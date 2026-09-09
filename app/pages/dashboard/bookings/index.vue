<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { Booking } from '~/types/management'
import { formatCurrency, formatDate, formatDateTime } from '~/utils/format'

definePageMeta({ layout: 'management' })

const bookingStore = useBookingStore()
const data = computed(() => bookingStore.bookings)

await bookingStore.loadAll({ page: 1, limit: 100 }).catch(() => undefined)

const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.code, item.customerName, item.court, item.customerPhone],
  getStatus: (item) => item.status,
})

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const actionLoadingId = ref<string | null>(null)

const columns: TableColumnsType<Booking> = [
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
  { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
  { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone', width: 130 },
  { title: 'Sân', dataIndex: 'court', key: 'court', width: 110 },
  { title: 'Ngày', dataIndex: 'date', key: 'date', width: 120 },
  { title: 'Khung giờ', dataIndex: 'timeSlot', key: 'timeSlot', width: 130 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 130 },
  { title: 'Tổng tiền', dataIndex: 'total', key: 'total', width: 130 },
  { title: 'Tạo lúc', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
  { title: 'Thao tác', key: 'actions', width: 220, align: 'center' },
]

async function reload() {
  await bookingStore.loadAll({ page: 1, limit: 100 })
}

async function confirmBooking(record: Booking) {
  actionLoadingId.value = record.id
  try {
    await bookingStore.setStatus(record.id, 'confirmed')
    message.success('Đã xác nhận đặt sân')
  } catch {
    message.error(bookingStore.error || 'Không xác nhận được')
  } finally {
    actionLoadingId.value = null
  }
}

async function completeBooking(record: Booking) {
  actionLoadingId.value = record.id
  try {
    await bookingStore.setStatus(record.id, 'done')
    message.success('Đã đánh dấu hoàn thành')
  } catch {
    message.error(bookingStore.error || 'Không cập nhật được')
  } finally {
    actionLoadingId.value = null
  }
}

async function cancelBooking(record: Booking) {
  actionLoadingId.value = record.id
  try {
    await bookingStore.cancel(record.id)
    message.success('Đã hủy đặt sân')
  } catch {
    message.error(bookingStore.error || 'Không hủy được')
  } finally {
    actionLoadingId.value = null
  }
}
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
      <CommonClientSelect v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <a-button :loading="bookingStore.loading" @click="reload">Tải lại</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :loading="bookingStore.loading"
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
        <template v-else-if="column.key === 'actions'">
          <div class="flex flex-wrap justify-center gap-1">
            <a-button
              v-if="record.status === 'pending'"
              size="small"
              type="primary"
              :loading="actionLoadingId === record.id"
              @click="confirmBooking(record)"
            >
              Xác nhận
            </a-button>
            <a-button
              v-if="record.status === 'pending' || record.status === 'confirmed'"
              size="small"
              :loading="actionLoadingId === record.id"
              @click="completeBooking(record)"
            >
              Hoàn thành
            </a-button>
            <a-button
              v-if="record.status === 'pending' || record.status === 'confirmed'"
              size="small"
              danger
              :loading="actionLoadingId === record.id"
              @click="cancelBooking(record)"
            >
              Hủy
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
