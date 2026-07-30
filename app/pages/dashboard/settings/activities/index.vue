<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Activity } from '~/types/management'
import { mockActivities } from '~/utils/mock-management'
import { formatDateTime } from '~/utils/format'

definePageMeta({ layout: 'management' })

const data = ref<Activity[]>([...mockActivities])
const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.title],
  getStatus: (item) => item.status,
})
const { open, loading, target, askDelete, confirmDelete } = useDeleteRecord<Activity>()

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
  { value: 'draft', label: 'Nháp' },
]

const columns: TableColumnsType<Activity> = [
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
  { title: 'Bắt đầu', dataIndex: 'startAt', key: 'startAt', width: 160 },
  { title: 'Kết thúc', dataIndex: 'endAt', key: 'endAt', width: 160 },
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
        placeholder="Tìm theo tiêu đề"
        class="max-w-xs"
      />
      <a-select v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <div class="ml-auto">
        <a-button type="primary">Thêm hoạt động</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'startAt'">
          {{ formatDateTime(record.startAt) }}
        </template>
        <template v-else-if="column.key === 'endAt'">
          {{ formatDateTime(record.endAt) }}
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
      :record-name="target?.title"
      :loading="loading"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
