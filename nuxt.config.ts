// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  components: [
    {
      path: '~/components',
      prefix: ''
    }
  ],
  modules: [
    ['@nuxtjs/tailwindcss', {
      configPath: '~/tailwind.config.js',
      exposeConfig: true,
      injectPosition: 0,
      viewer: false
    }]
  ],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-04-08'
})