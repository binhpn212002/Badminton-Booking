<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { User } from '~/types/management'
import { mockUsers } from '~/utils/mock-management'
import { formatDate } from '~/utils/format'

definePageMeta({ layout: 'management' })

const data = ref<User[]>([...mockUsers])
const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.name, item.email, item.phone],
  getStatus: (item) => item.status,
})
const { open, loading, target, askDelete, confirmDelete } = useDeleteRecord<User>()

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
]

const roleLabel: Record<User['role'], string> = {
  admin: 'Admin',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
}

const columns: TableColumnsType<User> = [
  { title: 'Họ tên', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'SĐT', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: 'Vai trò', dataIndex: 'role', key: 'role', width: 120 },
  { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
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
        placeholder="Tìm theo tên, email hoặc SĐT"
        class="max-w-xs"
      />
      <CommonClientSelect v-model:value="status" :options="statusOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <div class="ml-auto">
        <a-button type="primary">Thêm người dùng</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'role'">
          {{ roleLabel[record.role] }}
        </template>
        <template v-else-if="column.key === 'status'">
          <CommonStatusTag :status="record.status" />
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" danger size="small" @click="askDelete(record)">Xóa</a-button>
        </template>
      </template>
    </a-table>

    <CommonDeleteRecord
      v-model:open="open"
      :record-name="target?.name"
      :loading="loading"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
