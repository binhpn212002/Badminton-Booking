# Design: Layouts Booking / Quản lý + Login Modal

**Date:** 2026-07-30  
**Status:** Approved (pending user review of written spec)  
**Stack:** Nuxt 4, Pinia, Tailwind CSS, Ant Design Vue

## Goal

Build two application shells and a UI-only login modal, with project primary color `#26C73E` applied to buttons.

## Decisions

| Topic | Choice |
|-------|--------|
| Audience split | **Booking** = guest login & booking; **Management** = courts, equipment, invoices |
| Shell structure | Booking = top navbar; Management = left sidebar |
| Login modal | UI only: email + password + submit closes modal (no API) |
| Menu content | Shell + brand + Login only; detailed menus later |
| UI approach | Ant Design Vue layouts (`a-layout`, `a-modal`, `a-button`) |

## Architecture

```
app/
├── app.vue                          # NuxtLayout + NuxtPage
├── layouts/
│   ├── booking.vue                  # Top navbar shell
│   └── management.vue               # Left sidebar shell
├── components/
│   ├── layout/
│   │   ├── AppNavbar.vue            # Brand + Login button
│   │   └── AppSidebar.vue           # Brand + empty menu area
│   └── common/
│       └── LoginModal.vue           # Email/password modal (mock)
├── pages/
│   ├── index.vue                    # layout: booking
│   └── dashboard/index.vue          # layout: management
└── plugins/
    └── antd.ts                      # Register Antd + primary token
```

### Layout assignment

- Pages opt in via `definePageMeta({ layout: 'booking' | 'management' })`.
- Demo pages: `/` → booking; `/dashboard` → management.

## UI specification

### Booking layout

- Full-height `a-layout`.
- Header/navbar: brand left (“Badminton Booking”), **Login** button right (`type="primary"`).
- Content area: light background, renders page via `<slot />`.
- No navigation links in this iteration.

### Management layout

- Full-height `a-layout` with left sider (~240px).
- Sider: brand at top; empty/placeholder menu region (no real items yet).
- Content: optional thin header + `<slot />`.
- No Dashboard / Court / Equipment / Invoice links yet.

### Login modal

- Opened by Login in booking navbar.
- Fields: Email, Password (uncontrolled or simple `v-model`; no zod/vee-validate).
- Primary **Đăng nhập** button → close modal (mock success).
- Cancel / close (X) → close modal.
- No auth store, cookies, redirects, or middleware.

### Theme / primary color

- Primary: `#26C73E`.
- Apply via Ant Design Vue theme token (`colorPrimary`) in the Antd plugin (or a thin ConfigProvider wrapper) so primary buttons use this color.
- Scope for this work: buttons (and AntD controls that inherit primary).

## Data flow

1. User on booking layout clicks Login.
2. Local boolean `open` becomes `true` → `LoginModal` visible.
3. Submit or cancel sets `open` to `false`.
4. No shared Pinia auth state in this iteration.

Management layout does not include Login in this iteration (shell only).

## Out of scope

- Real auth API, register, forgot password
- Real sidebar/navbar menu items
- Route guards / role-based access
- Mobile drawer / advanced responsive patterns (desktop-first is enough)
- Nuxt UI module

## Success criteria

- `/` shows booking navbar with brand + green Login button.
- Clicking Login opens modal; submit/cancel closes it without API calls.
- `/dashboard` shows management layout with left sidebar shell.
- Primary buttons render with `#26C73E`.

## Testing (manual)

1. Open `/` — navbar + Login visible; button is primary green.
2. Open modal, fill fields, submit — modal closes.
3. Open `/dashboard` — sidebar left, content right.
4. Confirm no console errors from layout/plugin setup.
