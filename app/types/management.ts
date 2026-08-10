export type CourtStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'

export type CourtPriceSlot = {
  from: string
  to: string
  price: number
}

export type Court = {
  id: string
  branchId: string
  location?: string
  code: string
  name: string
  description: string
  status: CourtStatus
  image: string
  gallery: string[]
  length: number
  width: number
  surface: string
  indoor: boolean
  floorType: string
  lighting: string
  ceilingHeight: number
  airCondition: boolean
  fan: boolean
  capacity: number
  priceSlots: CourtPriceSlot[]
  isAvailable: boolean
  isMaintenance: boolean
  maintenanceReason: string
  availableFrom: string
  availableTo: string
  createdAt: string
}

export type Device = {
  id: string
  name: string
  sku: string
  category: string
  stock: number
  price: number
  status: 'active' | 'inactive'
  updatedAt: string
}

export type FnbItem = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  updatedAt: string
}

export type Booking = {
  id: string
  code: string
  customerName: string
  court: string
  date: string
  timeSlot: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'done'
  total: number
  createdAt: string
}

export type Order = {
  id: string
  code: string
  customerName: string
  itemsCount: number
  total: number
  paymentStatus: 'paid' | 'unpaid'
  orderStatus: 'pending' | 'processing' | 'done' | 'cancelled'
  createdAt: string
}

export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'staff' | 'customer'
  status: 'active' | 'inactive'
  createdAt: string
}

export type Voucher = {
  id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  minOrder: number
  usageLimit: number
  usedCount: number
  startAt: string
  endAt: string
  status: 'active' | 'inactive' | 'draft'
}

export type Banner = {
  id: string
  title: string
  image: string
  link: string
  sort: number
  status: 'active' | 'inactive'
}

export type Activity = {
  id: string
  title: string
  startAt: string
  endAt: string
  status: 'active' | 'inactive' | 'draft'
}

export type BankAccount = {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  isDefault: boolean
}

export type ReportRow = {
  id: string
  date: string
  metric: string
  value: number
}
