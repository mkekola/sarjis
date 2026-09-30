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
        // iOS only treats the app as installed when this is set.
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Sarjis' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
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
      background_color: '#1e2422',
      theme_color: '#1e2422',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        // Android masks this one to its own shape, so the mark is drawn inside
        // the middle 80% that is guaranteed to survive.
        {
          src: '/icons/maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },

    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
});
