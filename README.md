# Sarjis

Gym app for following your own training programs and tracking progress.

Offline-first: the app runs from the device, so it works in a basement gym with
no signal. Data lives in the browser, and the app must be installed to the home
screen for that data to persist.

## Stack

- Nuxt 4 (client-rendered, no SSR) + TypeScript
- Service worker written by hand, precache manifest injected by `@vite-pwa/nuxt`
- Static build deployed to Netlify

## Development

```bash
npm install
npm run dev        # dev server
npm run generate   # static build into .output/public
```
