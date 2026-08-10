export const DEVICE_CATEGORY_OPTIONS = [
  { value: 'racket', label: 'Vợt' },
  { value: 'shoes', label: 'Giày' },
  { value: 'shuttlecock', label: 'Cầu' },
  { value: 'accessory', label: 'Phụ kiện' },
]

export const FOOD_CATEGORY_OPTIONS = [
  { value: 'drink', label: 'Đồ uống' },
  { value: 'food', label: 'Đồ ăn' },
]

export const VOUCHER_TYPE_OPTIONS = [
  { value: 'percent', label: '%' },
  { value: 'fixed', label: 'Cố định' },
]

export const CATALOG_STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
]

export const VOUCHER_STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
  { value: 'draft', label: 'Nháp' },
]

export const ACTIVITY_STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
  { value: 'draft', label: 'Nháp' },
]

export function optionLabel(
  options: Array<{ value: string; label: string }>,
  value: string,
) {
  return options.find((item) => item.value === value)?.label ?? value
}
