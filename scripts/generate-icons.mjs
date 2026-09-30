/**
 * Builds the app mark and rasterises it.
 *
 * The mark is generated rather than drawn by hand, so the shipped icon is
 * exactly the approved geometry and can be re-cut to any size. Run with:
 *   node scripts/generate-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const TILE = '#bf4723'; // the light theme's action colour, the most saturated we have
const BURST = '#eae5d6';
const BAR = '#1e2422';

const SPIKES = 11;
const SEED = 7;
const ANGLE = -30;

/** Deterministic noise: the irregularity is designed, not rolled fresh. */
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A comic burst rather than a star: the edge between two spikes is an arc, not
 * a straight line, which is what makes the silhouette read as an explosion.
 * Each gap is one quadratic whose midpoint is solved for a chosen valley depth.
 * Valleys bottom out at 30, clear of the dumbbell's 28.7 circumradius.
 */
function burstPath() {
  const rand = rng(SEED);
  const tips = [];
  for (let i = 0; i < SPIKES; i++) {
    const base = (Math.PI * 2 * i) / SPIKES - Math.PI / 2;
    tips.push({
      a: base + (rand() - 0.5) * ((Math.PI / SPIKES) * 0.6),
      r: 44 + rand() * 9,
    });
  }

  let d = '';
  for (let j = 0; j < SPIKES; j++) {
    const A = tips[j];
    const B = tips[(j + 1) % SPIKES];
    let span = B.a - A.a;
    if (span <= 0) span += Math.PI * 2;

    const ax = 50 + A.r * Math.cos(A.a);
    const ay = 50 + A.r * Math.sin(A.a);
    const bx = 50 + B.r * Math.cos(B.a);
    const by = 50 + B.r * Math.sin(B.a);

    const am = A.a + span / 2;
    const rm = 30 + rand() * 6;
    const mx = 50 + rm * Math.cos(am);
    const my = 50 + rm * Math.sin(am);

    // A quadratic's midpoint is (A + 2C + B) / 4, so solve C for the M we want.
    const cx = 2 * mx - (ax + bx) / 2;
    const cy = 2 * my - (ay + by) / 2;

    if (j === 0) d += `M${ax.toFixed(2)},${ay.toFixed(2)}`;
    d += `Q${cx.toFixed(2)},${cy.toFixed(2)} ${bx.toFixed(2)},${by.toFixed(2)}`;
  }
  return `${d}Z`;
}

/** 50 × 28, so its corners sit 28.7 from the centre whatever the rotation. */
const dumbbell = `<g fill="${BAR}" transform="rotate(${ANGLE} 50 50)">
    <rect x="25" y="36" width="11" height="28" rx="3"/>
    <rect x="64" y="36" width="11" height="28" rx="3"/>
    <rect x="36" y="46" width="28" height="8" rx="2"/>
  </g>`;

/**
 * `scale` shrinks the mark inside the tile. Android masks a maskable icon to an
 * arbitrary shape and only guarantees the middle 80%, so that version is drawn
 * smaller; iOS masks to a rounded square and can take the full bleed.
 */
function svg(scale = 1) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="${TILE}"/>
  <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
    <path d="${burstPath()}" fill="${BURST}"/>
    ${dumbbell}
  </g>
</svg>
`;
}

const OUT = new URL('../public/icons/', import.meta.url);
await mkdir(OUT, { recursive: true });

// Burst tips reach 53 of 100; the maskable safe circle has radius 40.
const full = svg(1);
const maskable = svg(40 / 53);

await writeFile(new URL('../public/icon.svg', import.meta.url), full);

const targets = [
  { file: 'favicon-32.png', size: 32, markup: full },
  { file: 'apple-touch-icon.png', size: 180, markup: full },
  { file: 'icon-192.png', size: 192, markup: full },
  { file: 'icon-512.png', size: 512, markup: full },
  { file: 'maskable-512.png', size: 512, markup: maskable },
];

const browser = await chromium.launch();
for (const { file, size, markup } of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`,
  );
  await page.locator('svg').screenshot({ path: new URL(file, OUT).pathname });
  await page.close();
  console.log(`${file.padEnd(22)} ${size}×${size}`);
}
await browser.close();

console.log('public/icon.svg          vektorilähde');
