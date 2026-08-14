<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import type { Court, Voucher } from '~/types/management'
import { formatCurrency } from '~/utils/format'
import { readApiError } from '~/services/auth'

definePageMeta({ layout: 'booking' })

type SlotStatus = 'available' | 'booked' | 'selected'
type CheckoutStep = 'confirm' | 'payment' | 'done'
type PaymentMethod = 'transfer' | 'cash'

const QR_IMAGE =
  'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BADMINTON-BOOKING-DEMO'

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80'

const route = useRoute()
const router = useRouter()
const courtStore = useCourtStore()
const bookingStore = useBookingStore()
const voucherStore = useVoucherStore()
const authStore = useAuthStore()

const courtId = computed(() => String(route.params.id))
const court = ref<Court | null>(null)
const loadingCourt = ref(true)
const loadError = ref<string | null>(null)

const selectedDate = ref<Dayjs>(dayjs().startOf('day'))
const selectedHours = ref<number[]>([])

const checkoutOpen = ref(false)
const checkoutStep = ref<CheckoutStep>('confirm')
const customerName = ref('')
const customerPhone = ref('')
const note = ref('')
const selectedVoucherId = ref<string>('')
const paymentMethod = ref<PaymentMethod>('transfer')
const qrOpen = ref(false)
const bookingCode = ref('')
const submitting = computed(() => bookingStore.submitting)

function parseHour(value: string) {
  const hour = Number(String(value).split(':')[0])
  return Number.isFinite(hour) ? hour : 6
}

function pad(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function priceForHour(c: Court, hour: number) {
  for (const slot of c.priceSlots) {
    const from = parseHour(slot.from)
    const to = parseHour(slot.to)
    if (hour >= from && hour < to) return slot.price
  }
  return c.priceSlots[0]?.price ?? 0
}

function coverOf(c: Court) {
  if (c.image && /^https?:\/\//i.test(c.image)) return c.image
  return FALLBACK_COVER
}

function bookedHoursFromApi() {
  const booked = new Set<number>()
  for (const item of bookingStore.bookings) {
    for (let hour = item.startHour; hour < item.endHour; hour += 1) {
      booked.add(hour)
    }
  }
  return booked
}

const hourOptions = computed(() => {
  if (!court.value) return [] as Array<{ hour: number; price: number; status: SlotStatus }>
  const from = parseHour(court.value.availableFrom)
  const to = parseHour(court.value.availableTo)
  const booked = bookedHoursFromApi()
  const options: Array<{ hour: number; price: number; status: SlotStatus }> = []
  for (let hour = from; hour < to; hour += 1) {
    const hasPrice = court.value.priceSlots.some((slot) => {
      const slotFrom = parseHour(slot.from)
      const slotTo = parseHour(slot.to)
      return hour >= slotFrom && hour < slotTo
    })
    if (court.value.priceSlots.length && !hasPrice) continue
    const isSelected = selectedHours.value.includes(hour)
    options.push({
      hour,
      price: priceForHour(court.value, hour),
      status: booked.has(hour) ? 'booked' : isSelected ? 'selected' : 'available',
    })
  }
  return options
})

const selectedRange = computed(() => {
  if (!selectedHours.value.length) return null
  const sorted = [...selectedHours.value].sort((a, b) => a - b)
  return { start: sorted[0]!, end: sorted[sorted.length - 1]! + 1 }
})

const subtotal = computed(() => {
  if (!court.value || !selectedHours.value.length) return 0
  return selectedHours.value.reduce(
    (sum, hour) => sum + priceForHour(court.value!, hour),
    0,
  )
})

function voucherTitle(v: Voucher) {
  if (v.type === 'percent') return `Giảm ${v.value}%`
  return `Giảm ${formatCurrency(v.value)}`
}

const catalogVouchers = computed(() =>
  voucherStore.vouchers.filter((v) => {
    if (v.status !== 'active') return false
    if (v.usedCount >= v.usageLimit) return false
    const now = dayjs()
    if (v.startAt && now.isBefore(dayjs(v.startAt))) return false
    if (v.endAt && now.isAfter(dayjs(v.endAt))) return false
    return true
  }),
)

const applicableVouchers = computed(() =>
  catalogVouchers.value.filter((v) => subtotal.value >= v.minOrder),
)

const selectedVoucher = computed(
  () => catalogVouchers.value.find((v) => v.id === selectedVoucherId.value) ?? null,
)

const discount = computed(() => {
  const voucher = selectedVoucher.value
  if (!voucher) return 0
  if (subtotal.value < voucher.minOrder) return 0
  if (voucher.type === 'percent') {
    return Math.round((subtotal.value * voucher.value) / 100)
  }
  return Math.min(voucher.value, subtotal.value)
})

const totalPrice = computed(() => Math.max(0, subtotal.value - discount.value))

const dateLabel = computed(() => selectedDate.value.format('dddd, DD/MM/YYYY'))

const stepIndex = computed(() => {
  if (checkoutStep.value === 'confirm') return 0
  if (checkoutStep.value === 'payment') return 1
  return 2
})

function toggleHour(hour: number, status: SlotStatus) {
  if (status === 'booked') return
  const set = new Set(selectedHours.value)
  if (set.has(hour)) set.delete(hour)
  else set.add(hour)
  const sorted = [...set].sort((a, b) => a - b)
  const contiguous = sorted.every((h, i) => i === 0 || h === sorted[i - 1]! + 1)
  if (!contiguous) {
    message.warning('Vui lòng chọn các khung giờ liên tiếp')
    return
  }
  selectedHours.value = sorted
}

function disablePastDate(current: Dayjs) {
  return current && current < dayjs().startOf('day')
}

watch(selectedDate, () => {
  selectedHours.value = []
})

watch(subtotal, () => {
  if (
    selectedVoucherId.value &&
    !applicableVouchers.value.some((v) => v.id === selectedVoucherId.value)
  ) {
    selectedVoucherId.value = ''
  }
})

async function loadSchedule() {
  if (!court.value) return
  try {
    await bookingStore.loadByCourtDate(
      Number(court.value.id),
      selectedDate.value.format('YYYY-MM-DD'),
    )
    const booked = bookedHoursFromApi()
    selectedHours.value = selectedHours.value.filter((hour) => !booked.has(hour))
  } catch {
    message.error(bookingStore.error || 'Không tải được lịch đặt sân')
  }
}

async function loadCourt() {
  loadingCourt.value = true
  loadError.value = null
  try {
    const found =
      courtStore.courts.find((c) => c.id === courtId.value) ||
      (await courtStore.fetchById(courtId.value).catch(() => null))
    if (!found || found.status !== 'ACTIVE' || !found.isAvailable) {
      loadError.value = 'Sân không khả dụng để đặt'
      court.value = null
      return
    }
    court.value = found
    await Promise.all([
      loadSchedule(),
      voucherStore.loadVouchers(true, { page: 1, limit: 50 }).catch(() => undefined),
    ])
  } catch {
    loadError.value = 'Không tải được thông tin sân'
    court.value = null
  } finally {
    loadingCourt.value = false
  }
}

onMounted(() => {
  authStore.hydrate()
  if (authStore.user?.displayName) {
    customerName.value = authStore.user.displayName
  }
  loadCourt()
})

watch(selectedDate, () => {
  if (court.value) loadSchedule()
})

function openCheckout() {
  if (!selectedHours.value.length) {
    message.warning('Hãy chọn ít nhất một khung giờ')
    return
  }
  checkoutStep.value = 'confirm'
  checkoutOpen.value = true
}

function closeCheckout() {
  checkoutOpen.value = false
  qrOpen.value = false
}

function resetAfterSuccess() {
  closeCheckout()
  selectedHours.value = []
  customerName.value = ''
  customerPhone.value = ''
  note.value = ''
  selectedVoucherId.value = ''
  paymentMethod.value = 'transfer'
  checkoutStep.value = 'confirm'
  bookingCode.value = ''
}

async function submitBooking() {
  if (!court.value || !selectedRange.value) {
    message.warning('Hãy chọn ít nhất một khung giờ')
    return null
  }
  try {
    const created = await bookingStore.submit({
      courtId: Number(court.value.id),
      orderDate: selectedDate.value.format('YYYY-MM-DD'),
      start: selectedRange.value.start,
      end: selectedRange.value.end,
      totalPrice: totalPrice.value,
      name: customerName.value.trim(),
      phoneNumber: customerPhone.value.trim(),
      note: note.value.trim() || undefined,
      voucherCode: selectedVoucher.value?.code,
    })
    bookingCode.value = created.code
    checkoutStep.value = 'done'
    qrOpen.value = false
    await loadSchedule()
    return created
  } catch (err) {
    message.error(readApiError(err, bookingStore.error || 'Không tạo được đặt sân'))
    return null
  }
}

function goToPayment() {
  if (!customerName.value.trim() || !customerPhone.value.trim()) {
    message.warning('Nhập họ tên và số điện thoại')
    return
  }
  checkoutStep.value = 'payment'
}

async function finishCashPayment() {
  const created = await submitBooking()
  if (created) message.success('Đặt sân thành công. Thanh toán tiền mặt khi đến sân.')
}

function openTransferQr() {
  qrOpen.value = true
}

async function confirmTransferPaid() {
  const created = await submitBooking()
  if (created) message.success('Đã ghi nhận đặt sân')
}

function onConfirmPayment() {
  if (paymentMethod.value === 'cash') {
    finishCashPayment()
    return
  }
  openTransferQr()
}

function voucherLabel(v: Voucher) {
  if (v.type === 'percent') return `−${v.value}%`
  return `−${formatCurrency(v.value)}`
}
</script>

<template>
  <div class="booking-detail">
    <div class="page-hero">
      <div class="page-hero-inner">
        <NuxtLink to="/booking" class="back-link">← Danh sách sân</NuxtLink>
        <p class="eyebrow">Chi tiết sân</p>
        <h1>{{ court?.name || 'Đặt sân' }}</h1>
        <p v-if="court">
          {{ court.location || '—' }} · {{ court.availableFrom }}–{{ court.availableTo }}
        </p>
      </div>
    </div>

    <div class="page-body">
      <a-spin :spinning="loadingCourt">
        <a-alert
          v-if="loadError"
          type="error"
          show-icon
          :message="loadError"
          style="margin-bottom: 1rem"
        />

        <template v-else-if="court">
          <!-- Chi tiết sân -->
          <section class="court-detail">
            <div
              class="court-banner"
              :style="{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.55)), url(${coverOf(court)})`,
              }"
            >
              <span>{{ court.code }}</span>
              <div class="banner-tags">
                <strong>{{ court.capacity }} người</strong>
                <strong>{{ court.indoor ? 'Trong nhà' : 'Ngoài trời' }}</strong>
                <strong>{{ court.surface }}</strong>
              </div>
            </div>

            <div class="court-meta">
              <div>
                <h2>{{ court.name }}</h2>
                <p class="addr">{{ court.location || '—' }}</p>
                <p class="desc">{{ court.description || 'Sân cầu lông sẵn sàng phục vụ.' }}</p>
              </div>
              <dl class="meta-grid">
                <div>
                  <dt>Kích thước</dt>
                  <dd>{{ court.length }} × {{ court.width }} m</dd>
                </div>
                <div>
                  <dt>Sàn</dt>
                  <dd>{{ court.floorType || court.surface }}</dd>
                </div>
                <div>
                  <dt>Ánh sáng</dt>
                  <dd>{{ court.lighting || '—' }}</dd>
                </div>
                <div>
                  <dt>Tiện ích</dt>
                  <dd>
                    {{
                      [court.airCondition ? 'Máy lạnh' : null, court.fan ? 'Quạt' : null]
                        .filter(Boolean)
                        .join(', ') || '—'
                    }}
                  </dd>
                </div>
                <div>
                  <dt>Giờ mở</dt>
                  <dd>{{ court.availableFrom }} – {{ court.availableTo }}</dd>
                </div>
                <div>
                  <dt>Giá từ</dt>
                  <dd class="price">
                    {{
                      formatCurrency(
                        court.priceSlots.length
                          ? Math.min(...court.priceSlots.map((s) => s.price))
                          : 0,
                      )
                    }}/giờ
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <!-- Lịch booking (mock / socket sau) -->
          <section class="schedule-block">
            <div class="block-head">
              <div>
                <h2>Lịch đặt sân</h2>
                <p class="hint">
                  Chọn ngày và khung giờ trống. Slot đã đặt được lấy từ hệ thống.
                </p>
              </div>
              <a-tag color="processing">Lịch theo ngày</a-tag>
            </div>

            <div class="date-row">
              <a-date-picker
                v-model:value="selectedDate"
                :disabled-date="disablePastDate"
                format="DD/MM/YYYY"
                size="large"
                style="width: 100%; max-width: 280px"
                :allow-clear="false"
              />
              <p class="hint">{{ dateLabel }}</p>
            </div>

            <div class="legend">
              <span><i class="dot available" /> Trống</span>
              <span><i class="dot selected" /> Đang chọn</span>
              <span><i class="dot booked" /> Đã đặt</span>
            </div>

            <div class="slot-grid">
              <button
                v-for="slot in hourOptions"
                :key="slot.hour"
                type="button"
                class="slot"
                :class="slot.status"
                :disabled="slot.status === 'booked'"
                @click="toggleHour(slot.hour, slot.status)"
              >
                <span class="slot-time">{{ pad(slot.hour) }}–{{ pad(slot.hour + 1) }}</span>
                <span class="slot-price">
                  {{ slot.status === 'booked' ? 'Đã đặt' : formatCurrency(slot.price) }}
                </span>
              </button>
            </div>
            <p v-if="!hourOptions.length" class="hint">Sân chưa cấu hình giờ mở cửa</p>
          </section>

          <!-- Thanh hành động -->
          <aside class="booking-bar">
            <div class="bar-info">
              <div>
                <span class="bar-label">Khung giờ</span>
                <strong v-if="selectedRange">
                  {{ pad(selectedRange.start) }}–{{ pad(selectedRange.end) }}
                  ({{ selectedHours.length }} giờ)
                </strong>
                <strong v-else>—</strong>
              </div>
              <div>
                <span class="bar-label">Tạm tính</span>
                <strong class="bar-total">{{ formatCurrency(subtotal) }}</strong>
              </div>
            </div>
            <a-button
              type="primary"
              size="large"
              :disabled="!selectedHours.length"
              @click="openCheckout"
            >
              Đặt sân
            </a-button>
          </aside>
        </template>
      </a-spin>
    </div>

    <!-- Wizard: xác nhận → thanh toán → xong -->
    <a-modal
      v-model:open="checkoutOpen"
      :title="checkoutStep === 'done' ? 'Đặt sân thành công' : 'Đặt sân'"
      :footer="null"
      :width="560"
      :body-style="{ paddingTop: '12px', maxHeight: '70vh', overflowY: 'auto' }"
      destroy-on-close
      @cancel="closeCheckout"
    >
      <a-steps
        v-if="checkoutStep !== 'done'"
        :current="stepIndex"
        size="small"
        class="checkout-steps"
        :items="[
          { title: 'Xác nhận' },
          { title: 'Thanh toán' },
        ]"
      />

      <!-- Bước 1: xác nhận + voucher -->
      <div v-if="checkoutStep === 'confirm'" class="checkout-pane">
        <h3>Thông tin đặt sân</h3>
        <dl class="summary-dl">
          <div>
            <dt>Sân</dt>
            <dd>{{ court?.name }}</dd>
          </div>
          <div>
            <dt>Ngày</dt>
            <dd>{{ selectedDate.format('DD/MM/YYYY') }}</dd>
          </div>
          <div>
            <dt>Giờ</dt>
            <dd v-if="selectedRange">
              {{ pad(selectedRange.start) }}–{{ pad(selectedRange.end) }}
            </dd>
          </div>
          <div>
            <dt>Tạm tính</dt>
            <dd>{{ formatCurrency(subtotal) }}</dd>
          </div>
        </dl>

        <a-form layout="vertical">
          <a-form-item label="Họ và tên" required>
            <a-input v-model:value="customerName" size="large" placeholder="Nguyễn Văn A" />
          </a-form-item>
          <a-form-item label="Số điện thoại" required>
            <a-input v-model:value="customerPhone" size="large" placeholder="09xx xxx xxx" />
          </a-form-item>
          <a-form-item label="Ghi chú">
            <a-textarea
              v-model:value="note"
              :rows="2"
              placeholder="Ví dụ: mang vợt thuê, đến sớm 10 phút..."
            />
          </a-form-item>
        </a-form>

        <div class="voucher-block">
          <h3>Chọn voucher</h3>
          <a-radio-group v-model:value="selectedVoucherId" class="voucher-group">
            <label class="voucher-item" :class="{ active: selectedVoucherId === '' }">
              <a-radio value="" />
              <div>
                <strong>Không dùng voucher</strong>
                <p>Thanh toán đủ tạm tính</p>
              </div>
            </label>
            <label
              v-for="v in catalogVouchers"
              :key="v.id"
              class="voucher-item"
              :class="{ disabled: subtotal < v.minOrder, active: selectedVoucherId === v.id }"
            >
              <a-radio :value="v.id" :disabled="subtotal < v.minOrder" />
              <div class="voucher-body">
                <div class="voucher-top">
                  <strong>{{ v.code }}</strong>
                  <span class="voucher-badge">{{ voucherLabel(v) }}</span>
                </div>
                <p>{{ voucherTitle(v) }}</p>
                <p class="voucher-min">Đơn tối thiểu {{ formatCurrency(v.minOrder) }}</p>
              </div>
            </label>
          </a-radio-group>
        </div>

        <div class="total-row">
          <span>Giảm giá</span>
          <strong>−{{ formatCurrency(discount) }}</strong>
        </div>
        <div class="total-row final">
          <span>Thành tiền</span>
          <strong>{{ formatCurrency(totalPrice) }}</strong>
        </div>

        <div class="checkout-actions">
          <a-button @click="closeCheckout">Hủy</a-button>
          <a-button type="primary" @click="goToPayment">Tiếp tục thanh toán</a-button>
        </div>
      </div>

      <!-- Bước 2: phương thức thanh toán -->
      <div v-else-if="checkoutStep === 'payment'" class="checkout-pane">
        <h3>Chọn phương thức thanh toán</h3>
        <p class="hint">Số tiền cần thanh toán: <strong>{{ formatCurrency(totalPrice) }}</strong></p>

        <a-radio-group v-model:value="paymentMethod" class="pay-options">
          <label class="pay-card" :class="{ active: paymentMethod === 'transfer' }">
            <a-radio value="transfer" />
            <div>
              <strong>Chuyển khoản</strong>
              <p>Quét QR để thanh toán</p>
            </div>
          </label>
          <label class="pay-card" :class="{ active: paymentMethod === 'cash' }">
            <a-radio value="cash" />
            <div>
              <strong>Tiền mặt</strong>
              <p>Thanh toán tại quầy khi đến sân</p>
            </div>
          </label>
        </a-radio-group>

        <div class="checkout-actions">
          <a-button @click="checkoutStep = 'confirm'">Quay lại</a-button>
          <a-button type="primary" :loading="submitting" @click="onConfirmPayment">
            {{ paymentMethod === 'transfer' ? 'Hiện mã QR' : 'Xác nhận thanh toán' }}
          </a-button>
        </div>
      </div>

      <!-- Thành công -->
      <div v-else class="checkout-pane success-pane">
        <div class="success-icon">✓</div>
        <h3>Thanh toán thành công</h3>
        <p>
          Mã đặt sân <strong>{{ bookingCode }}</strong>
        </p>
        <p class="hint">
          {{
            paymentMethod === 'cash'
              ? 'Vui lòng thanh toán tiền mặt khi đến sân.'
              : 'Chúng tôi đã ghi nhận chuyển khoản của bạn.'
          }}
        </p>
        <dl class="summary-dl">
          <div>
            <dt>Sân</dt>
            <dd>{{ court?.name }}</dd>
          </div>
          <div>
            <dt>Ngày</dt>
            <dd>{{ selectedDate.format('DD/MM/YYYY') }}</dd>
          </div>
          <div>
            <dt>Giờ</dt>
            <dd v-if="selectedRange">
              {{ pad(selectedRange.start) }}–{{ pad(selectedRange.end) }}
            </dd>
          </div>
          <div>
            <dt>Tổng tiền</dt>
            <dd class="price">{{ formatCurrency(totalPrice) }}</dd>
          </div>
        </dl>
        <div class="checkout-actions">
          <a-button @click="router.push('/booking')">Về danh sách</a-button>
          <a-button type="primary" @click="resetAfterSuccess">Đặt thêm</a-button>
        </div>
      </div>
    </a-modal>

    <!-- Popup QR chuyển khoản -->
    <a-modal
      v-model:open="qrOpen"
      title="Quét QR chuyển khoản"
      :footer="null"
      :width="400"
      centered
    >
      <div class="qr-pane">
        <img :src="QR_IMAGE" alt="QR thanh toán" width="220" height="220" />
        <p class="hint">Số tiền: <strong>{{ formatCurrency(totalPrice) }}</strong></p>
        <p class="qr-bank">
          Ngân hàng Demo · STK 0123456789<br />
          Chủ TK: CLB CẦU LÔNG DEMO
        </p>
        <div class="checkout-actions">
          <a-button @click="qrOpen = false">Đóng</a-button>
          <a-button type="primary" :loading="submitting" @click="confirmTransferPaid">Tôi đã chuyển khoản</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.booking-detail {
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  color: #163523;
  padding-bottom: 6rem;
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
  padding: 2rem 1.5rem 1.75rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: #1f9a36;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
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
  font-size: clamp(1.6rem, 3.5vw, 2.3rem);
  letter-spacing: -0.03em;
}

.page-hero p {
  margin: 0.5rem 0 0;
  color: #4d6557;
}

.page-body {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.court-detail {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 1.25rem;
  background: #fff;
  border: 1px solid #dde8e1;
  overflow: hidden;
}

.court-banner {
  min-height: 240px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  color: #fff;
}

.court-banner > span {
  align-self: flex-start;
  padding: 0.2rem 0.55rem;
  background: rgba(0, 0, 0, 0.45);
  font-size: 0.8rem;
  font-weight: 700;
}

.banner-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.banner-tags strong {
  padding: 0.25rem 0.55rem;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.8rem;
  font-weight: 600;
}

.court-meta {
  padding: 1.25rem 1.25rem 1.25rem 0;
}

.court-meta h2 {
  margin: 0;
  font-size: 1.35rem;
}

.addr {
  margin: 0.35rem 0 0.75rem;
  color: #5b7164;
}

.desc {
  margin: 0 0 1rem;
  color: #4d6557;
  font-size: 0.95rem;
  line-height: 1.5;
}

.meta-grid {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
}

.meta-grid dt {
  font-size: 0.78rem;
  color: #6a7f72;
  margin-bottom: 0.15rem;
}

.meta-grid dd {
  margin: 0;
  font-weight: 600;
  font-size: 0.92rem;
}

.meta-grid .price,
.summary-dl .price,
.bar-total {
  color: #1f9a36;
}

.schedule-block {
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #dde8e1;
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.block-head h2 {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
}

.hint {
  margin: 0;
  color: #6a7f72;
  font-size: 0.9rem;
}

.date-row {
  margin-bottom: 1rem;
}

.date-row .hint {
  margin-top: 0.5rem;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.85rem;
  font-size: 0.85rem;
  color: #4d6557;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border: 1px solid #cfe0d5;
  background: #f7fbf8;
}

.dot.selected {
  background: #e8f7eb;
  border-color: #1f9a36;
}

.dot.booked {
  background: #e8eaeb;
  border-color: #b8c2bc;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 0.65rem;
}

.slot {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem 0.55rem;
  border: 1px solid #cfe0d5;
  background: #f7fbf8;
  color: #163523;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.slot:hover:not(:disabled) {
  border-color: #26c73e;
  transform: translateY(-1px);
}

.slot.selected {
  border-color: #1f9a36;
  background: #e8f7eb;
  box-shadow: inset 0 0 0 1px #1f9a36;
}

.slot.booked,
.slot:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #eef1ef;
}

.slot-time {
  font-weight: 700;
  font-size: 0.9rem;
}

.slot-price {
  font-size: 0.8rem;
  color: #4d6557;
}

.booking-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 52px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  background: #fff;
  border: 1px solid #dde8e1;
  box-shadow: 0 -8px 24px rgba(22, 53, 35, 0.08);
}

.bar-info {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.bar-label {
  display: block;
  font-size: 0.75rem;
  color: #6a7f72;
  margin-bottom: 0.15rem;
}

.checkout-steps {
  position: sticky;
  top: 0;
  z-index: 1;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  background: #fff;
}

.checkout-pane h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.summary-dl {
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem;
  background: #f7fbf8;
  border: 1px solid #e3ece6;
}

.summary-dl > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.summary-dl dt {
  color: #6a7f72;
}

.summary-dl dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}

.voucher-block {
  margin: 0.5rem 0 1rem;
}

.voucher-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.voucher-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #dde8e1;
  cursor: pointer;
}

.voucher-item.active {
  border-color: #1f9a36;
  background: #f3faf5;
}

.voucher-item.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.voucher-item p {
  margin: 0.15rem 0 0;
  color: #5b7164;
  font-size: 0.85rem;
}

.voucher-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.voucher-badge {
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1f9a36;
  background: #e8f7eb;
}

.voucher-min {
  font-size: 0.78rem !important;
  color: #8a9b90 !important;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  color: #4d6557;
}

.total-row.final {
  margin-top: 0.35rem;
  margin-bottom: 1rem;
  padding-top: 0.55rem;
  border-top: 1px dashed #d5e2d9;
  font-size: 1.05rem;
}

.total-row.final strong {
  color: #1f9a36;
}

.checkout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.pay-options {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin: 1rem 0 1.25rem;
  width: 100%;
}

.pay-card {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.9rem;
  border: 1px solid #dde8e1;
  cursor: pointer;
}

.pay-card.active {
  border-color: #1f9a36;
  background: #f3faf5;
}

.pay-card p {
  margin: 0.2rem 0 0;
  color: #5b7164;
  font-size: 0.85rem;
}

.success-pane {
  text-align: center;
}

.success-icon {
  width: 56px;
  height: 56px;
  margin: 0.25rem auto 0.85rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e8f7eb;
  color: #1f9a36;
  font-size: 1.6rem;
  font-weight: 700;
}

.success-pane .summary-dl {
  text-align: left;
  margin-top: 1rem;
}

.success-pane .checkout-actions {
  justify-content: center;
}

.qr-pane {
  text-align: center;
}

.qr-pane img {
  margin: 0.5rem auto 1rem;
  border: 1px solid #e3ece6;
  padding: 0.5rem;
  background: #fff;
}

.qr-bank {
  margin: 0.75rem 0 1rem;
  color: #4d6557;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .court-detail {
    grid-template-columns: 1fr;
  }

  .court-meta {
    padding: 1.15rem;
  }

  .booking-bar {
    bottom: 0;
    left: 0;
    right: 0;
    max-width: none;
    border-radius: 0;
  }
}
</style>
