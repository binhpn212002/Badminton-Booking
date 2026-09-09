<script setup lang="ts">
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  DEVICE_CATEGORY_OPTIONS,
  FOOD_CATEGORY_OPTIONS,
  optionLabel,
} from '~/constants/catalog-options'
import { formatCurrency } from '~/utils/format'

definePageMeta({ layout: 'booking' })

type ProductKind = 'fnb' | 'device'
type CheckoutStep = 'confirm' | 'payment' | 'done'
type PaymentMethod = 'transfer' | 'cash'

type CartItem = {
  key: string
  id: string
  kind: ProductKind
  name: string
  price: number
  stock: number
  qty: number
  image: string
}

type ShopVoucher = {
  id: string
  code: string
  title: string
  type: 'percent' | 'fixed'
  value: number
  minOrder: number
}

const QR_IMAGE =
  'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BADMINTON-SHOP-ORDER-DEMO'

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

const foodStore = useFoodStore()
const deviceStore = useDeviceStore()
const voucherStore = useVoucherStore()

await Promise.all([
  foodStore.loadFoods(true, { page: 1, limit: 100 }).catch(() => undefined),
  deviceStore.loadDevices(true, { page: 1, limit: 100 }).catch(() => undefined),
  voucherStore.loadVouchers(true, { page: 1, limit: 100 }).catch(() => undefined),
])

const shopVouchers = computed<ShopVoucher[]>(() =>
  voucherStore.vouchers
    .filter((v) => v.status === 'active')
    .filter((v) => {
      const now = dayjs()
      return (
        (!v.startAt || !now.isBefore(dayjs(v.startAt), 'day')) &&
        (!v.endAt || !now.isAfter(dayjs(v.endAt), 'day'))
      )
    })
    .map((v) => ({
      id: v.id,
      code: v.code,
      title:
        v.type === 'percent'
          ? `Giảm ${v.value}% đơn hàng`
          : `Giảm ${formatCurrency(v.value)}`,
      type: v.type,
      value: v.value,
      minOrder: v.minOrder,
    })),
)

const tab = ref<ProductKind>('fnb')
const keyword = ref('')
const cart = ref<CartItem[]>([])
const cartOpen = ref(false)

const checkoutOpen = ref(false)
const checkoutStep = ref<CheckoutStep>('confirm')
const customerName = ref('')
const customerPhone = ref('')
const note = ref('')
const selectedVoucherId = ref('')
const paymentMethod = ref<PaymentMethod>('transfer')
const qrOpen = ref(false)
const orderCode = ref('')
const submitting = ref(false)

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

function foodCover(name: string) {
  return fnbImages[name] ?? DEFAULT_FNB_IMAGE
}

function deviceCover(name: string) {
  return deviceImages[name] ?? DEFAULT_DEVICE_IMAGE
}

const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)

const applicableVouchers = computed(() =>
  shopVouchers.value.filter((v) => subtotal.value >= v.minOrder),
)

const selectedVoucher = computed(
  () => shopVouchers.value.find((v) => v.id === selectedVoucherId.value) ?? null,
)

const discount = computed(() => {
  const voucher = selectedVoucher.value
  if (!voucher || subtotal.value < voucher.minOrder) return 0
  if (voucher.type === 'percent') {
    return Math.round((subtotal.value * voucher.value) / 100)
  }
  return Math.min(voucher.value, subtotal.value)
})

const totalPrice = computed(() => Math.max(0, subtotal.value - discount.value))

const stepIndex = computed(() => {
  if (checkoutStep.value === 'confirm') return 0
  if (checkoutStep.value === 'payment') return 1
  return 2
})

watch(subtotal, () => {
  if (
    selectedVoucherId.value &&
    !applicableVouchers.value.some((v) => v.id === selectedVoucherId.value)
  ) {
    selectedVoucherId.value = ''
  }
})

function cartKey(kind: ProductKind, id: string) {
  return `${kind}:${id}`
}

function addToCart(payload: {
  id: string
  kind: ProductKind
  name: string
  price: number
  stock: number
  image: string
}) {
  if (payload.stock <= 0) {
    message.warning('Sản phẩm đã hết hàng')
    return
  }
  const key = cartKey(payload.kind, payload.id)
  const existing = cart.value.find((item) => item.key === key)
  if (existing) {
    if (existing.qty >= existing.stock) {
      message.warning('Đã đạt số lượng tồn kho')
      return
    }
    existing.qty += 1
  } else {
    cart.value.push({
      key,
      id: payload.id,
      kind: payload.kind,
      name: payload.name,
      price: payload.price,
      stock: payload.stock,
      qty: 1,
      image: payload.image,
    })
  }
  message.success(`Đã thêm ${payload.name}`)
}

function changeQty(key: string, delta: number) {
  const item = cart.value.find((row) => row.key === key)
  if (!item) return
  const next = item.qty + delta
  if (next <= 0) {
    cart.value = cart.value.filter((row) => row.key !== key)
    return
  }
  if (next > item.stock) {
    message.warning('Vượt quá tồn kho')
    return
  }
  item.qty = next
}

function removeItem(key: string) {
  cart.value = cart.value.filter((row) => row.key !== key)
}

function openCheckout() {
  if (!cart.value.length) {
    message.warning('Giỏ hàng đang trống')
    return
  }
  cartOpen.value = false
  checkoutStep.value = 'confirm'
  checkoutOpen.value = true
}

function closeCheckout() {
  checkoutOpen.value = false
  qrOpen.value = false
}

function goToPayment() {
  if (!customerName.value.trim() || !customerPhone.value.trim()) {
    message.warning('Nhập họ tên và số điện thoại')
    return
  }
  checkoutStep.value = 'payment'
}

function finishCashPayment() {
  submitting.value = true
  window.setTimeout(() => {
    orderCode.value = `OD${dayjs().format('YYMMDD')}${Math.floor(Math.random() * 900 + 100)}`
    checkoutStep.value = 'done'
    submitting.value = false
    message.success('Thanh toán tiền mặt thành công')
  }, 500)
}

function openTransferQr() {
  qrOpen.value = true
}

function confirmTransferPaid() {
  orderCode.value = `OD${dayjs().format('YYMMDD')}${Math.floor(Math.random() * 900 + 100)}`
  qrOpen.value = false
  checkoutStep.value = 'done'
  message.success('Đã ghi nhận chuyển khoản')
}

function onConfirmPayment() {
  if (paymentMethod.value === 'cash') {
    finishCashPayment()
    return
  }
  openTransferQr()
}

function resetAfterSuccess() {
  closeCheckout()
  cart.value = []
  customerName.value = ''
  customerPhone.value = ''
  note.value = ''
  selectedVoucherId.value = ''
  paymentMethod.value = 'transfer'
  checkoutStep.value = 'confirm'
  orderCode.value = ''
}

function voucherLabel(v: ShopVoucher) {
  if (v.type === 'percent') return `−${v.value}%`
  return `−${formatCurrency(v.value)}`
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
        <div class="toolbar-right">
          <a-input
            v-model:value="keyword"
            allow-clear
            class="search"
            placeholder="Tìm sản phẩm..."
          />
          <a-badge :count="cartCount" :overflow-count="99">
            <a-button @click="cartOpen = true">Giỏ hàng</a-button>
          </a-badge>
        </div>
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
              <a-button
                type="primary"
                block
                :disabled="item.stock <= 0"
                @click="
                  addToCart({
                    id: item.id,
                    kind: 'fnb',
                    name: item.name,
                    price: item.price,
                    stock: item.stock,
                    image: foodCover(item.name),
                  })
                "
              >
                Thêm vào giỏ
              </a-button>
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
              <span class="cat">
                {{ optionLabel(DEVICE_CATEGORY_OPTIONS, item.category) }} · {{ item.sku }}
              </span>
              <h3>{{ item.name }}</h3>
              <div class="row">
                <strong>{{ formatCurrency(item.price) }}</strong>
                <span>Còn {{ item.stock }}</span>
              </div>
              <a-button
                type="primary"
                block
                :disabled="item.stock <= 0"
                @click="
                  addToCart({
                    id: item.id,
                    kind: 'device',
                    name: item.name,
                    price: item.price,
                    stock: item.stock,
                    image: deviceCover(item.name),
                  })
                "
              >
                Thêm vào giỏ
              </a-button>
            </div>
          </article>
          <a-empty v-if="!deviceItems.length" class="col-span-full" />
        </div>
      </a-spin>
    </div>

    <!-- Thanh giỏ hàng -->
    <aside v-if="cartCount" class="cart-bar">
      <div class="bar-info">
        <div>
          <span class="bar-label">Giỏ hàng</span>
          <strong>{{ cartCount }} món</strong>
        </div>
        <div>
          <span class="bar-label">Tạm tính</span>
          <strong class="bar-total">{{ formatCurrency(subtotal) }}</strong>
        </div>
      </div>
      <div class="bar-actions">
        <a-button @click="cartOpen = true">Xem giỏ</a-button>
        <a-button type="primary" @click="openCheckout">Đặt hàng</a-button>
      </div>
    </aside>

    <!-- Drawer giỏ hàng -->
    <a-drawer
      v-model:open="cartOpen"
      title="Giỏ hàng"
      placement="right"
      :width="420"
    >
      <div v-if="cart.length" class="cart-list">
        <article v-for="item in cart" :key="item.key" class="cart-item">
          <div
            class="cart-thumb"
            :style="{ backgroundImage: `url(${item.image})` }"
          />
          <div class="cart-meta">
            <strong>{{ item.name }}</strong>
            <p>{{ formatCurrency(item.price) }}</p>
            <div class="qty-row">
              <a-button size="small" @click="changeQty(item.key, -1)">−</a-button>
              <span>{{ item.qty }}</span>
              <a-button size="small" @click="changeQty(item.key, 1)">+</a-button>
              <button type="button" class="remove-btn" @click="removeItem(item.key)">
                Xóa
              </button>
            </div>
          </div>
        </article>
      </div>
      <a-empty v-else description="Chưa có sản phẩm" />

      <template #footer>
        <div class="drawer-footer">
          <div class="total-row final">
            <span>Tạm tính</span>
            <strong>{{ formatCurrency(subtotal) }}</strong>
          </div>
          <a-button type="primary" block size="large" :disabled="!cart.length" @click="openCheckout">
            Đặt hàng
          </a-button>
        </div>
      </template>
    </a-drawer>

    <!-- Wizard order -->
    <a-modal
      v-model:open="checkoutOpen"
      :title="checkoutStep === 'done' ? 'Đặt hàng thành công' : 'Đặt hàng'"
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
        :items="[{ title: 'Xác nhận' }, { title: 'Thanh toán' }]"
      />

      <div v-if="checkoutStep === 'confirm'" class="checkout-pane">
        <h3>Thông tin đơn hàng</h3>
        <ul class="order-lines">
          <li v-for="item in cart" :key="item.key">
            <span>{{ item.name }} × {{ item.qty }}</span>
            <strong>{{ formatCurrency(item.price * item.qty) }}</strong>
          </li>
        </ul>
        <dl class="summary-dl">
          <div>
            <dt>Số món</dt>
            <dd>{{ cartCount }}</dd>
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
              placeholder="Ví dụ: lấy tại quầy sân 2, không đá..."
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
              v-for="v in shopVouchers"
              :key="v.id"
              class="voucher-item"
              :class="{ disabled: subtotal < v.minOrder, active: selectedVoucherId === v.id }"
            >
              <a-radio :value="v.id" :disabled="subtotal < v.minOrder" />
              <div>
                <div class="voucher-top">
                  <strong>{{ v.code }}</strong>
                  <span class="voucher-badge">{{ voucherLabel(v) }}</span>
                </div>
                <p>{{ v.title }}</p>
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

      <div v-else-if="checkoutStep === 'payment'" class="checkout-pane">
        <h3>Chọn phương thức thanh toán</h3>
        <p class="hint">
          Số tiền cần thanh toán: <strong>{{ formatCurrency(totalPrice) }}</strong>
        </p>

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
              <p>Thanh toán tại quầy khi nhận hàng</p>
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

      <div v-else class="checkout-pane success-pane">
        <div class="success-icon">✓</div>
        <h3>Đặt hàng thành công</h3>
        <p>
          Mã đơn <strong>{{ orderCode }}</strong>
        </p>
        <p class="hint">
          {{
            paymentMethod === 'cash'
              ? 'Vui lòng thanh toán tiền mặt khi nhận hàng tại quầy.'
              : 'Chúng tôi đã ghi nhận chuyển khoản của bạn.'
          }}
        </p>
        <dl class="summary-dl">
          <div>
            <dt>Số món</dt>
            <dd>{{ cartCount }}</dd>
          </div>
          <div>
            <dt>Tổng tiền</dt>
            <dd class="price">{{ formatCurrency(totalPrice) }}</dd>
          </div>
        </dl>
        <div class="checkout-actions">
          <a-button type="primary" @click="resetAfterSuccess">Tiếp tục mua</a-button>
        </div>
      </div>
    </a-modal>

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
          <a-button type="primary" @click="confirmTransferPaid">Tôi đã chuyển khoản</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.shop-page {
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  color: #163523;
  padding-bottom: 6rem;
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

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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

.cart-bar {
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

.bar-actions {
  display: flex;
  gap: 0.5rem;
}

.bar-label {
  display: block;
  font-size: 0.75rem;
  color: #6a7f72;
  margin-bottom: 0.15rem;
}

.bar-total,
.price {
  color: #1f9a36;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 0.75rem;
}

.cart-thumb {
  width: 72px;
  height: 72px;
  background-size: cover;
  background-position: center;
  border: 1px solid #e3ece6;
}

.cart-meta strong {
  display: block;
  margin-bottom: 0.2rem;
}

.cart-meta p {
  margin: 0 0 0.5rem;
  color: #1f9a36;
  font-weight: 600;
  font-size: 0.9rem;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-btn {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #a33;
  cursor: pointer;
  font-size: 0.85rem;
}

.drawer-footer .total-row {
  margin-bottom: 0.75rem;
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

.order-lines {
  max-height: 140px;
  overflow-y: auto;
}

.order-lines {
  margin: 0 0 0.85rem;
  padding: 0;
  list-style: none;
}

.order-lines li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
  border-bottom: 1px dashed #e3ece6;
  font-size: 0.92rem;
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

.hint {
  margin: 0;
  color: #6a7f72;
  font-size: 0.9rem;
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
  .product-grid {
    grid-template-columns: 1fr;
  }

  .search {
    max-width: none;
  }

  .cart-bar {
    bottom: 0;
    max-width: none;
  }
}
</style>
