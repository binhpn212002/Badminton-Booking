# TikTok Login (Login Kit) — Design Spec

**Date:** 2026-08-03  
**Status:** Pending user review (rev. FE-only)  
**Repos:** chỉ `badminton-booking` (Nuxt FE + Netlify Functions)  
**Không dùng:** `badminton-booking-be`

## Goal

Cho phép người dùng đăng nhập Badminton Booking bằng TikTok Login Kit. Toàn bộ luồng nằm trong repo FE; Client Secret được giữ ở **Netlify Function** (không lộ browser).

## Non-goals (v1)

- Không tích hợp NestJS BE / Postgres user table
- Đăng bài / Content Posting API
- Merge nhiều OAuth provider
- Sync user TikTok với API Court backend

## Constraints

- Deploy: Netlify static + Functions  
  Site: `https://badmintion-booking.netlify.app/`
- Redirect URI (Portal + code khớp exact):  
  `https://badmintion-booking.netlify.app/auth/tiktok/callback`
- Client Secret chỉ trong Netlify env / Function
- FE hiện `nitro.preset: "static"` → thêm Functions qua thư mục `netlify/functions` (hoặc Nuxt server routes nếu đổi preset; **ưu tiên `netlify/functions`** để giữ generate static hiện tại)
- Session v1: JWT (hoặc signed payload) do Function phát hành → FE lưu `localStorage.token` (tương thích `court.ts`)

## Architecture

```text
[LoginModal] → TikTok authorize URL
       ↓
[TikTok] → /auth/tiktok/callback?code&state
       ↓
[callback.vue] → POST /.netlify/functions/auth-tiktok
       ↓
[Netlify Function]
  1. validate state (optional mirror FE)
  2. exchange code + client_secret → TikTok token
  3. fetch user.info.basic
  4. sign app JWT { sub: open_id, name, avatar }
  5. return { accessToken, user }
       ↓
[FE] localStorage.token + user → redirect home
```

## TikTok Portal

- Login Kit (Web)
- Redirect: `https://badmintion-booking.netlify.app/auth/tiktok/callback`
- Scope: `user.info.basic`
- Terms `/terms`, Privacy `/privacy`, Web URL production

## Netlify Function

### Path

`netlify/functions/auth-tiktok.ts` (hoặc `.mjs`)  
Public URL: `https://badmintion-booking.netlify.app/.netlify/functions/auth-tiktok`

Có thể thêm redirect trong `netlify.toml`:

```toml
[[redirects]]
  from = "/api/auth/tiktok"
  to = "/.netlify/functions/auth-tiktok"
  status = 200
```

FE gọi `/api/auth/tiktok` cho gọn.

### Env (Netlify UI / CLI — không commit)

```env
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://badmintion-booking.netlify.app/auth/tiktok/callback
JWT_SECRET=
```

### `POST /api/auth/tiktok`

Request:

```json
{ "code": "...", "state": "..." }
```

Response `200`:

```json
{
  "accessToken": "<app_jwt>",
  "user": {
    "openId": "...",
    "displayName": "...",
    "avatarUrl": "..."
  }
}
```

Errors: `400` (thiếu code / state), `502` (TikTok fail).

### TikTok calls (trong Function)

1. `POST https://open.tiktokapis.com/v2/oauth/token/`  
   `client_key`, `client_secret`, `code`, `grant_type=authorization_code`, `redirect_uri`
2. `GET https://open.tiktokapis.com/v2/user/info/`  
   fields: `open_id,avatar_url,display_name`  
   `Authorization: Bearer <tiktok_access_token>`

### Persistence v1

Không DB. User identity = TikTok `open_id` trong JWT. Mỗi lần login lấy profile mới từ TikTok.

## Frontend

### Public env (build-time Netlify)

```env
NUXT_PUBLIC_TIKTOK_CLIENT_KEY=
NUXT_PUBLIC_TIKTOK_REDIRECT_URI=https://badmintion-booking.netlify.app/auth/tiktok/callback
```

`nuxt.config.ts` → `runtimeConfig.public.tiktokClientKey`, `tiktokRedirectUri`.

### Files

| File | Role |
|------|------|
| `composables/useTikTokAuth.ts` | authorize URL + `state` (sessionStorage) |
| `pages/auth/tiktok/callback.vue` | đổi code qua Function, lưu session |
| `services/auth.ts` | `POST /api/auth/tiktok` |
| `stores/auth.ts` | token/user set·clear·hydrate |
| `components/common/LoginModal.vue` | nút Đăng nhập TikTok |
| `components/layout/AppNavbar.vue` | hiện user + Logout |
| `pages/dashboard/settings/tiktok/index.vue` | UI cấu hình (hiển thị redirect/client key; secret không hiện) |
| `AppSidebar` + `management` titles | menu settings TikTok |
| `netlify/functions/auth-tiktok.*` | exchange + JWT |
| `netlify.toml` | redirect `/api/auth/tiktok` → function |

### Authorize URL

```
https://www.tiktok.com/v2/auth/authorize/
  ?client_key=...
  &scope=user.info.basic
  &response_type=code
  &redirect_uri=...
  &state=<random>
```

## Error handling

| Case | UX |
|------|-----|
| User hủy (`error` query) | Toast + về `/` |
| `state` mismatch | Toast phiên không hợp lệ |
| Function / TikTok fail | Toast lỗi đăng nhập |
| App chưa approve Login Kit | Fail từ TikTok — ghi README |

## Security

- Secret chỉ Netlify env
- HTTPS redirect production
- CSRF `state`
- Không log code/token đầy đủ
- Rotate Client Secret (đã lộ chat) sau khi ổn định

## Testing

1. `netlify dev` (FE + functions local) hoặc deploy preview
2. Portal thêm redirect local nếu test local: `http://localhost:8888/auth/tiktok/callback` (port `netlify dev`)
3. Manual: Login → TikTok → callback → navbar có user → Logout

## Open decisions (resolved)

- Approach: **FE-only + Netlify Function** (không NestJS)
- Domain: `https://badmintion-booking.netlify.app`
- Scope v1: `user.info.basic`
- User store: JWT only, không Postgres
