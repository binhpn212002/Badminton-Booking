<script setup lang="ts">
import type { Court } from '~/types/management'
import { formatCurrency } from '~/utils/format'

definePageMeta({ layout: 'booking' })

const courtStore = useCourtStore()
await courtStore.loadCourts().catch(() => undefined)

const keyword = ref('')
const address = ref<string | 'all'>('all')
const capacity = ref<number | 'all'>('all')
const priceRange = ref<[number, number]>([0, 200000])
const indoorOnly = ref(false)

const courts = computed(() => courtStore.courts.filter((c) => c.status === 'ACTIVE'))

const addressOptions = computed(() => {
  const locations = [...new Set(courts.value.map((c) => c.location).filter(Boolean))] as string[]
  return [
    { value: 'all', label: 'Tất cả địa chỉ' },
    ...locations.map((loc) => ({ value: loc, label: loc })),
  ]
})

const capacityOptions = [
  { value: 'all', label: 'Số người' },
  { value: 2, label: '2 người' },
  { value: 4, label: '4 người' },
]

const priceFrom = (court: Court) =>
  court.priceSlots.length ? Math.min(...court.priceSlots.map((s) => s.price)) : 0

const coverOf = (court: Court) =>
  court.image ||
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80'

const filteredCourts = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return courts.value.filter((court) => {
    const price = priceFrom(court)
    const matchKeyword =
      !q ||
      court.name.toLowerCase().includes(q) ||
      court.code.toLowerCase().includes(q) ||
      (court.location || '').toLowerCase().includes(q)
    const matchAddress = address.value === 'all' || court.location === address.value
    const matchCapacity = capacity.value === 'all' || court.capacity >= Number(capacity.value)
    const matchPrice = price >= priceRange.value[0] && price <= priceRange.value[1]
    const matchIndoor = !indoorOnly.value || court.indoor
    return matchKeyword && matchAddress && matchCapacity && matchPrice && matchIndoor
  })
})

function resetFilters() {
  keyword.value = ''
  address.value = 'all'
  capacity.value = 'all'
  priceRange.value = [0, 200000]
  indoorOnly.value = false
}
</script>

<template>
  <div class="booking-page">
    <header class="page-hero">
      <div class="page-hero-inner">
        <p class="eyebrow">Đặt sân</p>
        <h1>Tìm sân phù hợp với bạn</h1>
        <p>Lọc theo giá, số người, địa chỉ và tiện ích để chọn khung giờ nhanh hơn.</p>
      </div>
    </header>

    <div class="page-body">
      <aside class="filters">
        <h2>Bộ lọc</h2>
        <a-input
          v-model:value="keyword"
          allow-clear
          placeholder="Tìm theo tên sân, mã, địa chỉ"
        />
        <CommonClientSelect v-model:value="address" class="!w-full" :options="addressOptions" />
        <CommonClientSelect v-model:value="capacity" class="!w-full" :options="capacityOptions" />
        <div>
          <div class="filter-label">
            Giá từ {{ formatCurrency(priceRange[0]) }} – {{ formatCurrency(priceRange[1]) }}
          </div>
          <a-slider v-model:value="priceRange" range :min="0" :max="200000" :step="10000" />
        </div>
        <label class="indoor-row">
          <a-switch v-model:checked="indoorOnly" size="small" />
          <span>Chỉ sân trong nhà</span>
        </label>
        <a-button block @click="resetFilters">Đặt lại</a-button>
        <a-button block :loading="courtStore.loading" @click="courtStore.loadCourts(true)">
          Tải lại từ API
        </a-button>
      </aside>

      <section class="results">
        <div class="results-head">
          <h2>{{ filteredCourts.length }} sân phù hợp</h2>
        </div>

        <a-alert
          v-if="courtStore.error"
          class="mb-4"
          type="error"
          show-icon
          :message="courtStore.error"
        />

        <a-spin :spinning="courtStore.loading">
          <div v-if="filteredCourts.length" class="court-list">
            <article v-for="court in filteredCourts" :key="court.id" class="court-card">
              <div
                class="court-cover"
                :style="{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${coverOf(court)})`,
                }"
              >
                <span class="court-code">{{ court.code }}</span>
              </div>
              <div class="court-body">
                <div class="court-top">
                  <h3>{{ court.name }}</h3>
                  <strong>{{ formatCurrency(priceFrom(court)) }}/giờ</strong>
                </div>
                <p class="addr">{{ court.location || '—' }}</p>
                <div class="tags">
                  <span>{{ court.capacity }} người</span>
                  <span>{{ court.surface }}</span>
                  <span>{{ court.indoor ? 'Trong nhà' : 'Ngoài trời' }}</span>
                  <span>{{ court.availableFrom }}–{{ court.availableTo }}</span>
                </div>
                <p class="desc">{{ court.description }}</p>
                <div class="actions">
                  <a-button type="primary">Chọn khung giờ</a-button>
                </div>
              </div>
            </article>
          </div>

          <a-empty v-else description="Không tìm thấy sân phù hợp" />
        </a-spin>
      </section>
    </div>
  </div>
</template>

<style scoped>
.booking-page {
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  color: #163523;
}

.page-hero {
  background:
    radial-gradient(circle at top right, rgba(38, 199, 62, 0.18), transparent 40%),
    linear-gradient(180deg, #e8f7eb 0%, #f3f7f4 100%);
  border-bottom: 1px solid #d9e8de;
}

.page-hero-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2rem;
}

.eyebrow {
  margin: 0 0 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1f9a36;
}

.page-hero h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  letter-spacing: -0.03em;
}

.page-hero p {
  margin: 0.55rem 0 0;
  max-width: 48ch;
  color: #4d6557;
}

.page-body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 1.5rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  align-self: start;
  padding: 1.1rem;
  background: #fff;
  border: 1px solid #dde8e1;
  position: sticky;
  top: 1rem;
}

.filters h2 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.filter-label {
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  color: #4d6557;
}

.indoor-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #345041;
  font-size: 0.92rem;
}

.results-head h2 {
  margin: 0 0 1rem;
  font-size: 1.15rem;
}

.court-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.court-card {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  overflow: hidden;
  background: #fff;
  border: 1px solid #dde8e1;
}

.court-cover {
  min-height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.court-code {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  background: rgba(15, 40, 24, 0.75);
}

.court-body {
  padding: 1rem 1.15rem 1.15rem;
}

.court-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.court-top h3 {
  margin: 0;
  font-size: 1.2rem;
}

.court-top strong {
  color: #1f9a36;
  white-space: nowrap;
}

.addr {
  margin: 0.35rem 0 0.7rem;
  color: #5b7164;
  font-size: 0.92rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tags span {
  padding: 0.15rem 0.5rem;
  font-size: 0.78rem;
  color: #2f5a40;
  background: #eaf7ee;
}

.desc {
  margin: 0.75rem 0 1rem;
  color: #5b7164;
  font-size: 0.93rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .page-body {
    grid-template-columns: 1fr;
  }

  .filters {
    position: static;
  }

  .court-card {
    grid-template-columns: 1fr;
  }
}
</style>
