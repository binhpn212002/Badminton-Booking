<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/format'
import { API_COURT_SURFACE_OPTIONS } from '~/types/api'

definePageMeta({ layout: 'management' })

const route = useRoute()
const router = useRouter()
const courtStore = useCourtStore()

const id = computed(() => String(route.params.id))

const court = await courtStore.fetchById(id.value).catch(() => null)

if (!court) {
  await router.replace('/dashboard/courts')
}

const boolLabel = (value: boolean) => (value ? 'Có' : 'Không')

const surfaceLabel = computed(() => {
  const opt = API_COURT_SURFACE_OPTIONS.find((o) => o.value === court?.surface)
  return opt?.label || court?.surface || '—'
})
</script>
<template>
  <div v-if="court" class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <NuxtLink to="/dashboard/courts" class="text-sm text-gray-500 hover:text-gray-800">
          ← Quay lại danh sách
        </NuxtLink>
        <div class="mt-2 flex flex-wrap items-center gap-3">
          <h2 class="m-0 text-xl font-semibold text-gray-900">
            {{ court.code }} — {{ court.name }}
          </h2>
          <CommonStatusTag :status="court?.status ?? 'inactive'" />
        </div>
        <p class="mb-0 mt-1 text-gray-500">{{ court.location || '—' }}</p>
      </div>
      <a-button type="primary" @click="router.push(`/dashboard/courts/${court.id}/edit`)">
        Sửa sân
      </a-button>
    </div>

    <a-tabs>
      <a-tab-pane key="info" tab="Thông tin sân">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <a-card title="Thông tin cơ bản" size="small">
            <a-descriptions :column="1" size="small" bordered>
              <a-descriptions-item label="Mã sân">{{ court.code }}</a-descriptions-item>
              <a-descriptions-item label="Tên sân">{{ court.name }}</a-descriptions-item>
              <a-descriptions-item label="Địa điểm">{{ court.location || '—' }}</a-descriptions-item>
              <a-descriptions-item label="Mô tả">
                {{ court.description || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="Ảnh">
                {{ court.image || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="Ngày tạo">
                {{ formatDate(court.createdAt) }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="Thông tin vật lý" size="small">
            <a-descriptions :column="1" size="small" bordered>
              <a-descriptions-item label="Kích thước">
                {{ court.width }} × {{ court.length }} m
              </a-descriptions-item>
              <a-descriptions-item label="Số người">{{ court.capacity }}</a-descriptions-item>
              <a-descriptions-item label="Mặt sân">{{ surfaceLabel }}</a-descriptions-item>
              <a-descriptions-item label="Chiều cao trần">
                {{ court.ceilingHeight }} m
              </a-descriptions-item>
              <a-descriptions-item label="Trong nhà">
                {{ boolLabel(court.indoor) }}
              </a-descriptions-item>
              <a-descriptions-item label="Máy lạnh">
                {{ boolLabel(court.airCondition) }}
              </a-descriptions-item>
              <a-descriptions-item label="Quạt">{{ boolLabel(court.fan) }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="Khung giờ giá" size="small">
            <a-table
              :pagination="false"
              size="small"
              row-key="from"
              :data-source="court.priceSlots"
              :columns="[
                { title: 'Bắt đầu', dataIndex: 'from', key: 'from' },
                { title: 'Kết thúc', dataIndex: 'to', key: 'to' },
                { title: 'Giá', dataIndex: 'price', key: 'price' },
              ]"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'price'">
                  {{ formatCurrency(record.price) }}
                </template>
              </template>
            </a-table>
          </a-card>

          <a-card title="Tình trạng & giờ mở" size="small">
            <a-descriptions :column="1" size="small" bordered>
              <a-descriptions-item label="Đang hoạt động">
                {{ boolLabel(court.isAvailable) }}
              </a-descriptions-item>
              <a-descriptions-item label="Đang bảo trì">
                {{ boolLabel(court.isMaintenance) }}
              </a-descriptions-item>
              <a-descriptions-item label="Lý do bảo trì">
                {{ court.maintenanceReason || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="Giờ mở">
                {{ court.availableFrom }} - {{ court.availableTo }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>
      </a-tab-pane>

      <a-tab-pane key="calendar" tab="Lịch đặt sân">
        <CourtCalendar :court="court" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
