// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  ssr: true,
  routeRules: {
  '/': { prerender: true },
  },
  devtools: { enabled: true },

  modules: ["@nuxt/icon"],
});
