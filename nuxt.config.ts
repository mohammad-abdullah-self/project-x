// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    db: {
      systemDbUrl: process.env.NUXT_SYSTEM_DB_URL,
      tenantDbUrl: process.env.NUXT_TENANT_DB_URL,
      tenantPgbDbUrl: process.env.NUXT_TENANT_PGBOUNCER_DB_URL,
    },
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL,
    },
  },
  build: {
    transpile: ["trpc-nuxt"],
  },
});
