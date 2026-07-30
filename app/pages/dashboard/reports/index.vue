<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { ReportRow } from '~/types/management'
import { mockReports } from '~/utils/mock-management'
import { formatCurrency, formatDate } from '~/utils/format'

definePageMeta({ layout: 'management' })

const data = ref<ReportRow[]>([...mockReports])
const keyword = ref('')

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
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="Tìm theo chỉ số"
        class="max-w-xs"
      />
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
