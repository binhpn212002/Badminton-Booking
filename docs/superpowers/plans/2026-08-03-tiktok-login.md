# TikTok Login Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Đăng nhập TikTok Login Kit chỉ trong repo FE + Netlify Function.

**Architecture:** FE OAuth redirect → callback → `POST /api/auth/tiktok` (Nuxt server local / Netlify Function prod) → JWT + user → `localStorage`.

**Tech Stack:** Nuxt 4, Pinia, Ant Design Vue, Netlify Functions, TikTok OAuth v2.

## Global Constraints

- Secret chỉ env server/Netlify — không public runtimeConfig
- Redirect URI: `https://badmintion-booking.netlify.app/auth/tiktok/callback`
- Scope: `user.info.basic`
- Không NestJS BE

---

### Task 1: Shared TikTok exchange + Netlify/Nuxt API
- [x] `server/utils/tiktokAuth.ts` + `server/api/auth/tiktok.post.ts` (local `nuxt dev`)
- [x] `netlify/functions/auth-tiktok.mjs` (production)
- [x] `netlify.toml` redirect + `.env.example`

### Task 2: FE auth layer
- [x] types, service, store, composable
- [x] callback page
- [x] LoginModal + AppNavbar
- [x] settings/tiktok + sidebar

### Task 3: Config
- [x] `nuxt.config.ts` public TikTok keys
- [x] `.env` local (gitignored)
