<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Court } from '~/types/management'
import { formatCurrency, formatDate } from '~/utils/format'

definePageMeta({ layout: 'management' })

const router = useRouter()
const courtStore = useCourtStore()
const data = computed(() => courtStore.courts)

await courtStore.loadCourts().catch(() => undefined)

const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.code, item.name, item.location],
  getStatus: (item) => item.status,
})
const {
  open,
  loading: deleting,
  target,
  askDelete,
  confirmDelete,
} = useDeleteRecord<Court>()

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'CLOSED', label: 'Đóng cửa' },
]

const displayPrice = (court: Court) => {
  if (!court.priceSlots.length) return 0
  return Math.min(...court.priceSlots.map((s) => s.price))
}

const columns: TableColumnsType<Court> = [
  { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
  { title: 'Tên sân', dataIndex: 'name', key: 'name', width: 160 },
  { title: 'Địa chỉ', dataIndex: 'location', key: 'location', width: 220 },
  { title: 'Kích thước', key: 'size', width: 120 },
  { title: 'Loại', dataIndex: 'surface', key: 'surface', width: 110 },
  { title: 'Số người', dataIndex: 'capacity', key: 'capacity', width: 90 },
  { title: 'Giá từ', key: 'priceFrom', width: 120 },
  { title: 'Giờ mở', key: 'hours', width: 120 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
  { title: 'Thao tác', key: 'actions', width: 180, align: 'center' },
]

function goDetail(id: string) {
  router.push(`/dashboard/courts/${id}`)
}

async function onConfirmDelete() {
  await confirmDelete(async (record) => {
    await new Promise((r) => setTimeout(r, 400))
    courtStore.remove(record.id)
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo mã, tên hoặc địa chỉ"
        class="max-w-xs"
      />
      <CommonClientSelect v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <a-button :loading="courtStore.loading" @click="courtStore.loadCourts(true)">
        Tải lại
      </a-button>
      <div class="ml-auto">
        <a-button type="primary" @click="router.push('/dashboard/courts/create')">
          Thêm sân
        </a-button>
      </div>
    </div>

    <a-alert
      v-if="courtStore.error"
      class="mb-4"
      type="error"
      show-icon
      :message="courtStore.error"
    />

    <a-table
      :columns="columns"
      :data-source="filteredData"
      :loading="courtStore.loading"
      row-key="id"
      :scroll="{ x: 1300 }"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'code'">
          <a class="cursor-pointer text-[#26C73E]" @click="goDetail(record.id)">{{ record.code }}</a>
        </template>
        <template v-else-if="column.key === 'name'">
          <a class="cursor-pointer text-[#26C73E]" @click="goDetail(record.id)">{{ record.name }}</a>
        </template>
        <template v-else-if="column.key === 'location'">
          {{ record.location || '—' }}
        </template>
        <template v-else-if="column.key === 'size'">
          {{ record.length }} × {{ record.width }} m
        </template>
        <template v-else-if="column.key === 'priceFrom'">
          {{ formatCurrency(displayPrice(record)) }}
        </template>
        <template v-else-if="column.key === 'hours'">
          {{ record.availableFrom }} - {{ record.availableTo }}
        </template>
        <template v-else-if="column.key === 'status'">
          <CommonStatusTag :status="record.status" />
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" size="small" @click="goDetail(record.id)">Xem</a-button>
          <a-button
            type="link"
            size="small"
            @click="router.push(`/dashboard/courts/${record.id}/edit`)"
          >
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
