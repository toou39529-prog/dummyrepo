// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api'
    }
  },

  app: {
    head: {
      script: [
        // Paytaca wallet injection script (if needed)
        {
          src: 'https://wallet.paytaca.com/inject.js',
          defer: true
        }
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: ['buffer']
    }
  }
})
