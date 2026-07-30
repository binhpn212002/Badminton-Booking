<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { BankAccount } from '~/types/management'
import { mockBankAccounts } from '~/utils/mock-management'

definePageMeta({ layout: 'management' })

const data = ref<BankAccount[]>([...mockBankAccounts])
const keyword = ref('')
const defaultOnly = ref<'all' | 'default' | 'other'>('all')

const filteredData = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return data.value.filter((item) => {
    const matchKeyword =
      !q ||
      item.bankName.toLowerCase().includes(q) ||
      item.accountNumber.toLowerCase().includes(q) ||
      item.accountName.toLowerCase().includes(q)
    const matchDefault =
      defaultOnly.value === 'all' ||
      (defaultOnly.value === 'default' && item.isDefault) ||
      (defaultOnly.value === 'other' && !item.isDefault)
    return matchKeyword && matchDefault
  })
})

const { open, loading, target, askDelete, confirmDelete } = useDeleteRecord<BankAccount>()

const defaultOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'default', label: 'Mặc định' },
  { value: 'other', label: 'Không mặc định' },
]

const columns: TableColumnsType<BankAccount> = [
  { title: 'Ngân hàng', dataIndex: 'bankName', key: 'bankName', width: 160 },
  { title: 'Số tài khoản', dataIndex: 'accountNumber', key: 'accountNumber', width: 160 },
  { title: 'Chủ tài khoản', dataIndex: 'accountName', key: 'accountName' },
  { title: 'Mặc định', dataIndex: 'isDefault', key: 'isDefault', width: 110 },
  { title: 'Thao tác', key: 'actions', width: 100, align: 'center' },
]

function resetFilters() {
  keyword.value = ''
  defaultOnly.value = 'all'
}

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
        placeholder="Tìm theo ngân hàng, STK hoặc chủ TK"
        class="max-w-xs"
      />
      <a-select v-model:value="defaultOnly" :options="defaultOptions" class="!w-44" />
      <a-button @click="resetFilters">Đặt lại</a-button>
      <div class="ml-auto">
        <a-button type="primary">Thêm tài khoản</a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredData"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isDefault'">
          <a-tag v-if="record.isDefault" color="success">Mặc định</a-tag>
          <span v-else class="text-gray-400">—</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" danger size="small" @click="askDelete(record)">Xóa</a-button>
        </template>
      </template>
    </a-table>

    <CommonDeleteRecord
      v-model:open="open"
      :record-name="`${target?.bankName} - ${target?.accountNumber}`"
      :loading="loading"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
