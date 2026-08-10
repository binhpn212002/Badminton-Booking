<script setup lang="ts">
import {
  DEVICE_CATEGORY_OPTIONS,
  FOOD_CATEGORY_OPTIONS,
  optionLabel,
} from '~/constants/catalog-options'
import { formatCurrency } from '~/utils/format'

definePageMeta({ layout: 'booking' })

const foodStore = useFoodStore()
const deviceStore = useDeviceStore()

await Promise.all([
  foodStore.loadFoods(true, { page: 1, limit: 100 }).catch(() => undefined),
  deviceStore.loadDevices(true, { page: 1, limit: 100 }).catch(() => undefined),
])

const tab = ref('fnb')
const keyword = ref('')

const fnbItems = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return foodStore.foods
    .filter((item) => item.status === 'active')
    .filter(
      (item) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        optionLabel(FOOD_CATEGORY_OPTIONS, item.category).toLowerCase().includes(q),
    )
})

const deviceItems = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return deviceStore.devices
    .filter((item) => item.status === 'active')
    .filter(
      (item) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        optionLabel(DEVICE_CATEGORY_OPTIONS, item.category).toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q),
    )
})

const DEFAULT_FNB_IMAGE =
  'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80'
const DEFAULT_DEVICE_IMAGE =
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'

const fnbImages: Record<string, string> = {
  'Nước suối': DEFAULT_FNB_IMAGE,
  Sting:
    'https://images.unsplash.com/photo-1622543925917-763c34f1f321?auto=format&fit=crop&w=800&q=80',
  'Mì ly':
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f264?auto=format&fit=crop&w=800&q=80',
  'Bánh mì':
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'Trà đá':
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
}

const deviceImages: Record<string, string> = {
  'Vợt Yonex Astrox 99': DEFAULT_DEVICE_IMAGE,
  'Vợt Li-Ning Aeronaut 9000':
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
  'Giày Yonex Power Cushion':
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  'Quả cầu AS-50':
    'https://images.unsplash.com/photo-1613918431703-aa50481936b0?auto=format&fit=crop&w=800&q=80',
  'Quấn cán vợt':
    'https://images.unsplash.com/photo-1613918431703-aa50481936b0?auto=format&fit=crop&w=800&q=80',
}

function foodCover(name: string) {
  return fnbImages[name] ?? DEFAULT_FNB_IMAGE
}

function deviceCover(name: string) {
  return deviceImages[name] ?? DEFAULT_DEVICE_IMAGE
}
</script>

<template>
  <div class="shop-page">
    <header class="page-hero">
      <div class="page-hero-inner">
        <p class="eyebrow">Mua sắm</p>
        <h1>Đồ ăn & thiết bị tại sân</h1>
        <p>Gọi nước, đồ ăn nhẹ hoặc thuê/mua thiết bị khi đến chơi.</p>
      </div>
    </header>

    <div class="page-body">
      <div class="toolbar">
        <div class="tabs">
          <button type="button" :class="{ active: tab === 'fnb' }" @click="tab = 'fnb'">
            Đồ ăn & uống
          </button>
          <button
            type="button"
            :class="{ active: tab === 'device' }"
            @click="tab = 'device'" 
          >
            Thiết bị
          </button>
        </div>
        <a-input
          v-model:value="keyword"
          allow-clear
          class="search"
          placeholder="Tìm sản phẩm..."
        />
      </div>

      <a-alert
        v-if="foodStore.error || deviceStore.error"
        class="mb-4"
        type="error"
        show-icon
        :message="foodStore.error || deviceStore.error"
      />

      <a-spin :spinning="foodStore.loading || deviceStore.loading">
        <div v-if="tab === 'fnb'" class="product-grid">
          <article v-for="item in fnbItems" :key="item.id" class="product-card">
            <div
              class="product-cover"
              :style="{ backgroundImage: `url(${foodCover(item.name)})` }"
            />
            <div class="product-body">
              <span class="cat">{{ optionLabel(FOOD_CATEGORY_OPTIONS, item.category) }}</span>
              <h3>{{ item.name }}</h3>
              <div class="row">
                <strong>{{ formatCurrency(item.price) }}</strong>
                <span>Còn {{ item.stock }}</span>
              </div>
              <a-button type="primary" block>Thêm vào giỏ</a-button>
            </div>
          </article>
          <a-empty v-if="!fnbItems.length" class="col-span-full" />
        </div>

        <div v-else class="product-grid">
          <article v-for="item in deviceItems" :key="item.id" class="product-card">
            <div
              class="product-cover"
              :style="{ backgroundImage: `url(${deviceCover(item.name)})` }"
            />
            <div class="product-body">
              <span class="cat">{{ optionLabel(DEVICE_CATEGORY_OPTIONS, item.category) }} · {{ item.sku }}</span>
              <h3>{{ item.name }}</h3>
              <div class="row">
                <strong>{{ formatCurrency(item.price) }}</strong>
                <span>Còn {{ item.stock }}</span>
              </div>
              <a-button type="primary" block>Thêm vào giỏ</a-button>
            </div>
          </article>
          <a-empty v-if="!deviceItems.length" class="col-span-full" />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  color: #163523;
}

.page-hero {
  background:
    radial-gradient(circle at top left, rgba(38, 199, 62, 0.16), transparent 42%),
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
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.tabs {
  display: flex;
  gap: 0.4rem;
  padding: 0.25rem;
  background: #fff;
  border: 1px solid #dde8e1;
}

.tabs button {
  border: 0;
  background: transparent;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  color: #4d6557;
  font-weight: 600;
}

.tabs button.active {
  background: #26c73e;
  color: #fff;
}

.search {
  max-width: 280px;
  width: 100%;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.product-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dde8e1;
}

.product-cover {
  height: 170px;
  background-size: cover;
  background-position: center;
}

.product-body {
  padding: 0.95rem 1rem 1.1rem;
}

.cat {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1f9a36;
}

.product-body h3 {
  margin: 0;
  font-size: 1.05rem;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.7rem 0 0.85rem;
}

.row strong {
  color: #1f9a36;
}

.row span {
  font-size: 0.85rem;
  color: #6a7f72;
}

.col-span-full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .search {
    max-width: none;
  }
}
</style>
