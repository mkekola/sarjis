// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Sarjis on local-first: data elää laitteella ja sovelluksen on avauduttava
  // ilman verkkoa. Palvelinrenderöinti vaatisi verkon joka sivunlatauksella,
  // eli se rikkoisi sovelluksen juuri salin kellarissa.
  ssr: false,

  modules: ['@nuxt/eslint', '@vite-pwa/nuxt'],

  css: ['~/assets/css/fonts.css', '~/assets/css/tokens.css', '~/assets/css/base.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'fi' },
      title: 'Sarjis',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1e2422' },
      ],
    },
  },

  pwa: {
    // injectManifest: Workbox injektoi vain buildin tiedostolistan,
    // service workerin logiikka on meidän omaa koodia service-worker/sw.ts:ssä.
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',

    // Uusi versio ei ota valtaa kesken treenin, vaan käyttäjä päättää.
    registerType: 'prompt',

    injectManifest: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
    },

    manifest: {
      name: 'Sarjis',
      short_name: 'Sarjis',
      description: 'Saliohjelmat ja edistyminen.',
      lang: 'fi',
      dir: 'ltr',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      background_color: '#F6EFDD',
      theme_color: '#E0342A',
      // Ikonit puuttuvat tarkoituksella: ne tehdään SARJIS-wordmarkista
      // kun typografia ja paletti on lyöty lukkoon.
    },

    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
});
