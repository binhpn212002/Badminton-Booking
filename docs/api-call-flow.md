# Luồng call API trên FE (ví dụ: Court)

Tài liệu mô tả quy trình khi FE gọi 1 API: từ định nghĩa type → service → map → store → page.

Ví dụ dùng: `GET /court` (lấy danh sách sân).

---

## 1. Tổng quan luồng

```text
Page / Component
    │  gọi store.loadCourts()
    ▼
Pinia Store (app/stores/court.ts)
    │  gọi service.fetchCourts()
    ▼
Service (app/services/court.ts)
    │  $fetch<ApiListResponse<ApiCourt>>('/court')
    ▼
Backend API  GET /court
    │  trả { data, total, page, limit }
    ▼
Mapper (app/utils/map-court.ts)
    │  res.data.map(ApiCourt → Court)
    ▼
Store lưu Court[] + total/page/limit → Page render UI
```

**Nguyên tắc:**

| Lớp | Nhiệm vụ | Không làm |
|-----|----------|-----------|
| `types/api.ts` | Type đúng shape BE (`ApiListResponse<T>`, `ApiCourt`…) | Không dùng trực tiếp trong UI phức tạp |
| `services/*` | Gọi HTTP (`$fetch`) | Không map UI, không lưu state |
| `utils/map-*.ts` | Đổi tên field / format cho FE | Không gọi API |
| `stores/*` | State, loading, error, gọi service + map | Không viết HTML |
| `pages/*` | Gọi store, hiển thị | Không `$fetch` trực tiếp (trừ case đơn giản) |

---

## 2. Bước 1 — Đọc Swagger / response thật

Trước khi code, mở Swagger (vd. `/api`) hoặc `curl` endpoint:

```bash
curl -s https://<be-host>/court | jq '.[0]'
```

Ghi nhận:

- Method + path: `GET /court`
- Field BE: `courtCode`, `imageUrl`, `peopleCapacity`, `timeSlots[].start` (number giờ)…
- Enum status BE: `active | inactive | under_maintenance`

---

## 3. Bước 2 — Định nghĩa type BE (`app/types/api.ts`)

### Generic list response (mọi API danh sách)

```ts
export type ApiListResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}
```

Ví dụ: `ApiListResponse<ApiCourt>`, `ApiListResponse<ApiEquipment>`.

### Entity type — bám đúng JSON backend

```ts
export type ApiCourt = {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  name: string
  courtCode: string
  // ...
  timeSlots: ApiCourtTimeSlot[]
}
```

Service gọi list:

```ts
const res = await $fetch<ApiListResponse<ApiCourt>>(`${base}/court`, {
  query: { page: 1, limit: 10 },
})
// res.data, res.total, res.page, res.limit
```

---

## 4. Bước 3 — (Tuỳ chọn) Type FE (`app/types/management.ts`)

Model dùng trong UI có thể khác BE:

| BE | FE |
|----|----|
| `courtCode` | `code` |
| `imageUrl` | `image` |
| `peopleCapacity` | `capacity` |
| `status: active` | `status: ACTIVE` |
| `timeSlots.start: 6` | `priceSlots.from: "06:00"` |

Tách 2 type giúp UI ổn định khi BE đổi tên field.

---

## 5. Bước 4 — Service gọi API (`app/services/court.ts`)

Chỉ lo HTTP:

```ts
import type { ApiCourt } from '~/types/api'

export function useApiBase() {
  const config = useRuntimeConfig()
  return config.public.apiBase as string  // vd: '/api/be'
}

export async function fetchCourts() {
  const base = useApiBase()
  return await $fetch<ApiCourt[]>(`${base}/court`)
}

export async function fetchCourtById(id: string | number) {
  const base = useApiBase()
  return await $fetch<ApiCourt>(`${base}/court/${id}`)
}
```

### Config base URL (`nuxt.config.ts`)

```ts
runtimeConfig: {
  public: {
    apiBase: '/api/be',
    apiOrigin: 'https://<be-host>', // origin thật, dùng ở proxy
  },
}
```

Client gọi `/api/be/court` → proxy/server forward sang `https://<be-host>/court` (tránh CORS).

Ghi đè khi cần:

```bash
NUXT_PUBLIC_API_BASE=/api/be
NUXT_PUBLIC_API_ORIGIN=https://1f383m5q-3000.asse.devtunnels.ms
```

---

## 6. Bước 5 — Mapper (`app/utils/map-court.ts`)

```ts
export function mapApiCourtToCourt(api: ApiCourt): Court {
  return {
    id: String(api.id),
    code: api.courtCode,
    name: api.name,
    location: api.location,
    image: api.imageUrl || '',
    capacity: api.peopleCapacity,
    // ...
    priceSlots: (api.timeSlots || []).map((slot) => ({
      from: `${String(slot.start).padStart(2, '0')}:00`,
      to: `${String(slot.end).padStart(2, '0')}:00`,
      price: slot.price,
    })),
  }
}
```

---

## 7. Bước 6 — Store (`app/stores/court.ts`)

```ts
async function loadCourts(force = false) {
  if (loaded.value && !force) return courts.value
  loading.value = true
  error.value = null
  try {
    const data = await fetchCourts()
    courts.value = data.map(mapApiCourtToCourt)
    loaded.value = true
    return courts.value
  } catch (err) {
    error.value = 'Không tải được danh sách sân'
    throw err
  } finally {
    loading.value = false
  }
}
```

Store quản lý: `courts`, `loading`, `error`, `loaded`.

---

## 8. Bước 7 — Page dùng data

```vue
<script setup lang="ts">
const courtStore = useCourtStore()

// Load khi vào trang
await courtStore.loadCourts().catch(() => undefined)

const list = computed(() => courtStore.courts)
</script>

<template>
  <a-spin :spinning="courtStore.loading">
    <a-alert v-if="courtStore.error" type="error" :message="courtStore.error" />
    <div v-for="court in list" :key="court.id">
      {{ court.code }} — {{ court.name }}
    </div>
  </a-spin>
</template>
```

---

## 9. Checklist thêm API mới (copy nhanh)

Ví dụ thêm `GET /equipment`:

1. [ ] Xem response Swagger / curl
2. [ ] Thêm `ApiEquipment` vào `app/types/api.ts`
3. [ ] (Nếu cần) thêm type FE + `mapApiEquipmentToEquipment`
4. [ ] Thêm `fetchEquipments()` trong `app/services/equipment.ts`
5. [ ] Thêm store `useEquipmentStore` → `loadEquipments()`
6. [ ] Page: `await store.loadEquipments()` rồi bind UI
7. [ ] Kiểm tra proxy `/api/be/equipment` chạy được

---

## 10. File liên quan (Court)

| File | Vai trò |
|------|---------|
| `app/types/api.ts` | Type response BE |
| `app/types/management.ts` | Type model FE |
| `app/services/court.ts` | `$fetch` Court APIs |
| `app/utils/map-court.ts` | Map BE → FE |
| `app/stores/court.ts` | State + `loadCourts` |
| `nuxt.config.ts` | `runtimeConfig.public.apiBase` / `apiOrigin` |
| `netlify.toml` | Proxy `/api/be/*` khi deploy static |

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân gợi ý |
|------------|-------------------|
| CORS trên browser | Gọi thẳng BE origin; hãy dùng `/api/be` + proxy |
| Type mismatch | Type `Api*` chưa khớp JSON thật |
| UI sai field | Quên map trong `map-*.ts` |
| Data cũ | Store `loaded=true`; gọi `loadCourts(true)` để force |
| 404 `/api/court` | Path BE là `/court`, không phải `/api/court` (Swagger UI ≠ API prefix) |
