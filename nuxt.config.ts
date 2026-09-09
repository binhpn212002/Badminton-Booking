// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      // Local BE. Override: NUXT_PUBLIC_API_BASE=http://localhost:3001
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001",
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN || "http://localhost:3001",
    },
  },
  // Chỉ dùng static khi generate/build deploy; để trống khi `nuxt dev`
  nitro: process.env.NODE_ENV === "production" ? { preset: "static" } : {},
  vite: {
    server: {
      watch: {
        usePolling: false,
        ignored: ["**/node_modules/**", "**/.git/**"],
      },
    },
  },
  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },
});
