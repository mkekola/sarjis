/// <reference lib="webworker" />

// Workbox injektoi tiedostolistan sisältöhasheineen etsimällä käännetystä
// tiedostosta kirjaimellisen self.__WB_MANIFEST -viittauksen, joten se on
// kirjoitettava juuri noin. Se on ainoa asia jonka riippuvuus tekee.
// Logiikka alla on omaa.
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const CACHE = 'sarjis-v1';

/**
 * Sovelluskuori lisätään listaan käsin.
 *
 * Workbox kokoaa listansa skannaamalla build-hakemiston, ja Nitro kirjoittaa
 * esirenderöidyn HTML:n sinne omassa tahdissaan. Skannaus ehtii joskus ensin,
 * jolloin koko sovelluskuori jää pois ja offline-lataukselle ei ole mitään
 * mistä renderöidä. Se tapahtui tuotannossa mutta ei paikallisesti, eli vika
 * näkyi vasta oikealla palvelimella. Tämä rivi tekee listasta riippumattoman
 * siitä kumpi ehtii.
 */
const SHELL = '/';
const PRECACHE = [...new Set([SHELL, ...self.__WB_MANIFEST.map((entry) => entry.url)])];

// Esilataa sovelluskuori heti asennuksessa, jotta ensimmäinen offline-avaus
// toimii ilman että sovellusta on ehditty käyttää verkossa.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));

      // Tiedostonimissä on sisältöhash, joten edellisen buildin tiedostot
      // jäisivät muuten cacheen ikuisiksi ajoiksi. Siivotaan kaikki mitä tämä
      // build ei enää käytä.
      const cache = await caches.open(CACHE);
      const wanted = new Set(PRECACHE.map((url) => new URL(url, self.registration.scope).href));
      const stored = await cache.keys();
      await Promise.all(
        stored
          .filter((request) => !wanted.has(request.url))
          .map((request) => cache.delete(request)),
      );

      await self.clients.claim();
    })(),
  );
});

// registerType: 'prompt', eli uusi versio odottaa kunnes käyttäjä hyväksyy sen.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Cache-first. Salilla ei ole verkkoa, ja sovelluksen tiedostot vaihtuvat
// vain uuden buildin myötä, joten verkosta ei ole mitään voitettavaa.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(caches.match(request).then((hit) => hit ?? fromNetwork(request)));
});

async function fromNetwork(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch {
    // SPA: jokainen navigointi tarjoillaan samasta sovelluskuoresta.
    if (request.mode === 'navigate') {
      const shell = await caches.match(SHELL);
      if (shell) return shell;
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}
