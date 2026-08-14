<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { User } from '~/types/management'
import { formatDate } from '~/utils/format'

definePageMeta({ layout: 'management' })

const userStore = useUserStore()
const data = computed(() => userStore.users)

await userStore.loadUsers(true, { page: 1, limit: 100 }).catch(() => undefined)

const { keyword, status, filteredData, resetFilters } = useListFilter(data, {
  getKeywordFields: (item) => [item.name, item.email, item.phone],
  getStatus: (item) => item.status,
})

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
]

function phoneLabel(value: string) {
  return value?.trim() ? value : '—'
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
      <a-button
        :loading="userStore.loading"
        @click="userStore.loadUsers(true, { page: 1, limit: 100 })"
      >
        Tải lại
      </a-button>
    </div>

    <a-alert
      v-if="userStore.error"
      class="mb-4"
      type="error"
      show-icon
      :message="userStore.error"
    />

    <a-table
      :columns="columns"
      :data-source="filteredData"
      :loading="userStore.loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'phone'">
          {{ phoneLabel(record.phone) }}
        </template>
        <template v-else-if="column.key === 'role'">
          {{ roleLabel[record.role] }}
        </template>
        <template v-else-if="column.key === 'status'">
          <CommonStatusTag :status="record.status" />
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
      </template>
    </a-table>
  </div>
</template>
