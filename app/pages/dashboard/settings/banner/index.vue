<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Banner } from '~/types/management'
import { mockBanners } from '~/utils/mock-management'

definePageMeta({ layout: 'management' })

const data = ref<Banner[]>([...mockBanners])
const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.title, item.link],
  getStatus: (item) => item.status,
})
const { open, loading, target, askDelete, confirmDelete } = useDeleteRecord<Banner>()

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
]

const columns: TableColumnsType<Banner> = [
  { title: 'Thứ tự', dataIndex: 'sort', key: 'sort', width: 90 },
  { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
  { title: 'Ảnh', dataIndex: 'image', key: 'image' },
  { title: 'Link', dataIndex: 'link', key: 'link', width: 140 },
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
        placeholder="Tìm theo tiêu đề hoặc link"
        class="max-w-xs"
      />
      <CommonClientSelect v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <div class="ml-auto">
        <a-button type="primary">Thêm banner</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
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
