<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/format'
import type { Voucher } from '~/types/management'

definePageMeta({ layout: 'booking' })

const bannerStore = useBannerStore()
const activityStore = useActivityStore()
const voucherStore = useVoucherStore()

await Promise.all([
  bannerStore.loadBanners(true, { page: 1, limit: 20 }).catch(() => undefined),
  activityStore.loadActivities(true, { page: 1, limit: 20 }).catch(() => undefined),
  voucherStore.loadVouchers(true, { page: 1, limit: 20 }).catch(() => undefined),
])

const FALLBACK_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1800&q=80'
const FALLBACK_ACTIVITY_IMAGE =
  'https://images.unsplash.com/photo-1554068865-24cecd4e343f?auto=format&fit=crop&w=900&q=80'

const activeBanner = ref(0)

const banners = computed(() =>
  bannerStore.banners
    .filter((item) => item.status === 'active')
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: 'Đặt sân, ưu đãi và sự kiện cập nhật mỗi ngày.',
      image: item.image || FALLBACK_BANNER_IMAGE,
      cta: item.link.includes('booking') ? 'Đặt sân ngay' : 'Xem ngay',
      to: item.link || '/booking',
    })),
)

const activities = computed(() =>
  activityStore.activities
    .filter((item) => item.status === 'active')
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: formatDate(item.startAt),
      place: `${formatDate(item.startAt)} – ${formatDate(item.endAt)}`,
      image: FALLBACK_ACTIVITY_IMAGE,
      summary: 'Sự kiện đang diễn ra tại hệ thống sân.',
    })),
)

function offerTitle(voucher: Voucher) {
  if (voucher.type === 'percent') return `Giảm ${voucher.value}%`
  return `Giảm ${formatCurrency(voucher.value)}`
}

function offerDescription(voucher: Voucher) {
  if (voucher.minOrder > 0) {
    return `Áp dụng cho đơn từ ${formatCurrency(voucher.minOrder)}.`
  }
  return 'Áp dụng cho mọi đơn đặt sân.'
}

function offerTag(voucher: Voucher) {
  if (voucher.type === 'percent') return 'Ưu đãi'
  return 'Hot'
}

const offers = computed(() =>
  voucherStore.vouchers
    .filter((item) => item.status === 'active')
    .map((item) => ({
      id: item.id,
      code: item.code,
      title: offerTitle(item),
      description: offerDescription(item),
      tag: offerTag(item),
    })),
)

const loading = computed(
  () => bannerStore.loading || activityStore.loading || voucherStore.loading,
)

let timer: ReturnType<typeof setInterval> | null = null

watch(
  () => banners.value.length,
  (length) => {
    if (activeBanner.value >= length) activeBanner.value = 0
  },
)

onMounted(() => {
  timer = setInterval(() => {
    if (!banners.value.length) return
    activeBanner.value = (activeBanner.value + 1) % banners.value.length
  }, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function goBanner(index: number) {
  activeBanner.value = index
}
</script>

<template>
  <div class="home-page">
    <a-spin :spinning="loading">
      <section class="hero">
        <template v-if="banners.length">
          <div
            v-for="(banner, index) in banners"
            :key="banner.id"
            class="hero-slide"
            :class="{ active: index === activeBanner }"
            :style="{ backgroundImage: `url(${banner.image})` }"
          >
            <div class="hero-overlay" />
            <div class="hero-inner">
              <p class="brand-mark">Badminton Booking</p>
              <h1>{{ banner.title }}</h1>
              <p class="hero-sub">{{ banner.subtitle }}</p>
              <div class="hero-actions">
                <NuxtLink :to="banner.to">
                  <a-button type="primary" size="large">{{ banner.cta }}</a-button>
                </NuxtLink>
                <NuxtLink to="/shop">
                  <a-button size="large" ghost class="!border-white !text-white">Mua sắm</a-button>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="hero-dots">
            <button
              v-for="(banner, index) in banners"
              :key="banner.id"
              type="button"
              :class="{ active: index === activeBanner }"
              :aria-label="`Banner ${index + 1}`"
              @click="goBanner(index)"
            />
          </div>
        </template>

        <div v-else class="hero-slide active" :style="{ backgroundImage: `url(${FALLBACK_BANNER_IMAGE})` }">
          <div class="hero-overlay" />
          <div class="hero-inner">
            <p class="brand-mark">Badminton Booking</p>
            <h1>Đặt sân cầu lông dễ dàng</h1>
            <p class="hero-sub">Chọn khung giờ phù hợp và giữ chỗ ngay.</p>
            <div class="hero-actions">
              <NuxtLink to="/booking">
                <a-button type="primary" size="large">Đặt sân ngay</a-button>
              </NuxtLink>
              <NuxtLink to="/shop">
                <a-button size="large" ghost class="!border-white !text-white">Mua sắm</a-button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Hoạt động</h2>
          <p>Sự kiện và chương trình đang diễn ra tại các chi nhánh.</p>
        </div>
        <div v-if="activities.length" class="activity-grid">
          <article v-for="item in activities" :key="item.id" class="activity-item">
            <div class="activity-image" :style="{ backgroundImage: `url(${item.image})` }" />
            <div class="activity-body">
              <span class="meta">{{ item.date }} · {{ item.place }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
            </div>
          </article>
        </div>
        <a-empty v-else description="Chưa có hoạt động đang diễn ra" />
      </section>

      <section id="offers" class="section offers">
        <div class="section-head">
          <h2>Ưu đãi</h2>
          <p>Mã giảm giá và combo dành cho người chơi thường xuyên.</p>
        </div>
        <div v-if="offers.length" class="offer-grid">
          <article v-for="offer in offers" :key="offer.id" class="offer-item">
            <span class="offer-tag">{{ offer.tag }}</span>
            <h3>{{ offer.title }}</h3>
            <p>{{ offer.description }}</p>
            <code>{{ offer.code }}</code>
          </article>
        </div>
        <a-empty v-else description="Chưa có ưu đãi đang áp dụng" />
      </section>
    </a-spin>
  </div>
</template>

<style scoped>
.home-page {
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  color: #163523;
}

.hero {
  position: relative;
  min-height: min(88vh, 760px);
  overflow: hidden;
  background: #0d2818;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 0.8s ease, transform 4s ease;
}

.hero-slide.active {
  opacity: 1;
  transform: scale(1);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(8, 28, 16, 0.88) 12%, rgba(8, 28, 16, 0.45) 55%, rgba(8, 28, 16, 0.2) 100%),
    linear-gradient(to top, rgba(8, 28, 16, 0.7), transparent 45%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: min(88vh, 760px);
  max-width: 1120px;
  margin: 0 auto;
  padding: 4rem 1.5rem 5rem;
  color: #fff;
}

.brand-mark {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9fe3ae;
}

.hero-inner h1 {
  margin: 0;
  max-width: 14ch;
  font-size: clamp(2.4rem, 6vw, 4.4rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.hero-sub {
  margin: 1rem 0 0;
  max-width: 36ch;
  font-size: 1.05rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.86);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.hero-dots {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
  transform: translateX(-50%);
}

.hero-dots button {
  width: 0.55rem;
  height: 0.55rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}

.hero-dots button.active {
  width: 1.5rem;
  background: #26c73e;
}

.section {
  max-width: 1120px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.section-head {
  margin-bottom: 1.75rem;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #143221;
  letter-spacing: -0.02em;
}

.section-head p {
  margin: 0.5rem 0 0;
  color: #4d6557;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.activity-item {
  overflow: hidden;
  background: #fff;
}

.activity-image {
  height: 180px;
  background-size: cover;
  background-position: center;
}

.activity-body {
  padding: 1.1rem 1.15rem 1.35rem;
}

.activity-body .meta {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
  color: #26c73e;
  font-weight: 600;
}

.activity-body h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #163523;
}

.activity-body p {
  margin: 0.45rem 0 0;
  color: #5b7164;
  font-size: 0.95rem;
  line-height: 1.5;
}

.offers {
  padding-top: 0;
}

.offer-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.offer-item {
  position: relative;
  padding: 1.25rem 1.2rem 1.4rem;
  background: linear-gradient(160deg, #eefaf0 0%, #ffffff 55%);
  border: 1px solid #d7eadc;
}

.offer-tag {
  display: inline-block;
  margin-bottom: 0.7rem;
  padding: 0.15rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f7a28;
  background: #d8f5df;
}

.offer-item h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #163523;
}

.offer-item p {
  margin: 0.45rem 0 0.9rem;
  color: #5b7164;
  font-size: 0.95rem;
}

.offer-item code {
  display: inline-block;
  padding: 0.25rem 0.55rem;
  font-size: 0.85rem;
  color: #0f7a28;
  background: #fff;
  border: 1px dashed #26c73e;
}

@media (max-width: 900px) {
  .activity-grid,
  .offer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
