// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";

export default defineNuxtConfig({
  devServer: {
    host: "0.0.0.0", // listen on all interfaces so ngrok can reach it
    port: 3000, // your local port
  },
  vite: {
    server: {
      host: true, // same as '0.0.0.0'
      port: 3000,
      strictPort: false,
      // allow ngrok wildcard hosts (works for both .ngrok-free.app and .ngrok-free.dev)
      allowedHosts: [".ngrok-free.app", ".ngrok-free.dev"],
      // Optional: set HMR host to the ngrok domain (use the exact hostname if you want stable HMR)
      hmr: {
        host: undefined, // set to your ngrok host string if needed, e.g. 'random123.ngrok-free.app'
        protocol: "wss",
        port: 443,
      },
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    ssl: {
      storeId: process.env.NUXT_STORE_ID,
      storePasswd: process.env.NUXT_STORE_PASSWD,
      isLive: process.env.NUXT_IS_LIVE,
    },
    db: {
      systemDbUrl: process.env.NUXT_SYSTEM_DB_URL,
      tenantDbUrl: process.env.NUXT_TENANT_DB_URL,
    },
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL,
    },
  },
  build: {
    transpile: ["trpc-nuxt"],
  },
  modules: ["@vueuse/nuxt", "@primevue/nuxt-module"],
  // css: ["~/assets/css/main.css"],

  primevue: {
    autoImport: true,
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
});
