/// <reference lib="webworker" />

// Workbox injektoi tiedostolistan sisältöhasheineen etsimällä käännetystä
// tiedostosta kirjaimellisen self.__WB_MANIFEST -viittauksen, joten se on
// kirjoitettava juuri noin. Se on ainoa asia jonka riippuvuus tekee.
// Logiikka alla on omaa.
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const CACHE = 'sarjis-v1';
const PRECACHE = self.__WB_MANIFEST.map((entry) => entry.url);

// Esilataa sovelluskuori heti asennuksessa, jotta ensimmäinen offline-avaus
// toimii ilman että sovellusta on ehditty käyttää verkossa.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

// Siivoa edellisten buildien cachet, muuten levytila kasvaa rajatta.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
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
    // SPA: jokainen navigointi tarjoillaan samasta sovelluskuoresta, joka
    // on esiladattu juureen eikä nimellä index.html.
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) return shell;
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}
