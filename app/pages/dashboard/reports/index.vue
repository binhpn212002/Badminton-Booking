<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { ReportRow } from '~/types/management'
import { fetchBookingReportSummary } from '~/services/booking'
import { formatCurrency, formatDate } from '~/utils/format'

definePageMeta({ layout: 'management' })

const loading = ref(false)
const data = ref<ReportRow[]>([])
const keyword = ref('')
const totalRevenue = ref(0)
const totalBookings = ref(0)

async function loadReports() {
  loading.value = true
  try {
    const summary = await fetchBookingReportSummary()
    totalRevenue.value = summary.totalRevenue
    totalBookings.value = summary.totalBookings
    data.value = summary.rows.flatMap((row, index) => [
      {
        id: `${row.date}-revenue-${index}`,
        date: row.date,
        metric: 'Doanh thu đặt sân',
        value: row.revenue,
      },
      {
        id: `${row.date}-bookings-${index}`,
        date: row.date,
        metric: 'Số lượt đặt',
        value: row.bookings,
      },
      {
        id: `${row.date}-courts-${index}`,
        date: row.date,
        metric: 'Số sân được dùng',
        value: row.courtsUsed,
      },
    ])
  } catch {
    data.value = []
    totalRevenue.value = 0
    totalBookings.value = 0
  } finally {
    loading.value = false
  }
}

await loadReports()

const filteredData = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return data.value
  return data.value.filter((item) => item.metric.toLowerCase().includes(q))
})

const columns: TableColumnsType<ReportRow> = [
  { title: 'Ngày', dataIndex: 'date', key: 'date', width: 130 },
  { title: 'Chỉ số', dataIndex: 'metric', key: 'metric' },
  { title: 'Giá trị', dataIndex: 'value', key: 'value', width: 160 },
]

function resetFilters() {
  keyword.value = ''
}
</script>

<template>
  <div>
    <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div class="text-sm text-gray-500">Tổng doanh thu (không gồm đã hủy)</div>
        <div class="mt-1 text-xl font-semibold">{{ formatCurrency(totalRevenue) }}</div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div class="text-sm text-gray-500">Tổng lượt đặt</div>
        <div class="mt-1 text-xl font-semibold">{{ totalBookings }}</div>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo chỉ số"
        class="max-w-xs"
      />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <a-button :loading="loading" @click="loadReports">Tải lại</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'date'">
          {{ formatDate(record.date) }}
        </template>
        <template v-else-if="column.key === 'value'">
          {{
            record.metric.includes('Doanh thu')
              ? formatCurrency(record.value)
              : record.value
          }}
        </template>
      </template>
    </a-table>
  </div>
</template>
