<script setup lang="ts">
defineProps<{ isIos: boolean }>();
defineEmits<{ dismiss: [] }>();
</script>

<template>
  <!-- Installing is not a convenience here. Safari clears a site's storage
       after seven days of disuse and exempts installed web apps, so the home
       screen is where a training history survives a holiday. The screen has to
       say that, not just ask. -->
  <section class="guide">
    <header class="top">
      <WordMark />
      <img class="mark" src="/icon.svg" alt="" width="72" height="72" />
    </header>

    <CaptionBox text="Asenna ensin" />

    <div class="bubble">
      <p>
        Treenihistoriasi elää puhelimessa, ei palvelimella. Selain tyhjentää sen viikon
        käyttämättömyyden jälkeen.
        <strong>Kotivalikkoon asennettua sovellusta se ei koske.</strong>
      </p>
      <p>Samalla ruutu pysyy hereillä treenin ajan, eikä appi kysy verkkoa.</p>
    </div>

    <ol v-if="isIos" class="steps">
      <li>
        Paina
        <span class="glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" stroke-linecap="round" />
          </svg>
        </span>
        <b>Jaa</b> selaimen alapalkista
      </li>
      <li>Vieritä alas ja valitse <b>Lisää kotivalikkoon</b></li>
      <li>Avaa Sarjis kotivalikosta, älä selaimesta</li>
    </ol>

    <ol v-else class="steps">
      <li>Avaa selaimen valikko</li>
      <li>Valitse <b>Asenna sovellus</b> tai <b>Lisää kotinäyttöön</b></li>
      <li>Avaa Sarjis kotivalikosta, älä selaimesta</li>
    </ol>

    <div class="bottom">
      <button type="button" class="stamp" @click="$emit('dismiss')">Selvä</button>
      <p class="fineprint">Voit jatkaa selaimessa, mutta treenit voivat kadota tauon jälkeen.</p>
    </div>
  </section>
</template>

<style scoped>
.guide {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
  max-width: 26rem;
  min-height: 100%;
  margin-inline: auto;
  padding-inline: var(--s3);
  padding-top: calc(var(--s5) + env(safe-area-inset-top, 0px));
  padding-bottom: calc(var(--s4) + env(safe-area-inset-bottom, 0px));
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
}

.mark {
  flex: none;
  border-radius: 16px;
  border: var(--line-w) solid var(--line);
}

/* The app speaking, so it is a bubble, the same shape as the rest timer. */
.bubble {
  position: relative;
  padding: var(--s3) var(--s4);
  border: var(--line-w) solid var(--line);
  border-radius: 1.375rem;
  background: var(--bubble);
  color: var(--bubble-fg);
  box-shadow: var(--offset) var(--offset) 0 var(--shadow);
  margin-bottom: var(--s2);
}

.bubble p {
  margin: 0 0 var(--s2);
  font-size: var(--text-base);
  line-height: 1.55;
}

.bubble p:last-child {
  margin: 0;
}

.bubble::before,
.bubble::after {
  content: '';
  position: absolute;
  border: 0.75rem solid transparent;
  border-right-width: 1.125rem;
}

.bubble::before {
  bottom: -1.5rem;
  left: 1.75rem;
  border-top-color: var(--line);
}

.bubble::after {
  bottom: -1.0625rem;
  left: 2rem;
  border-width: 0.5625rem;
  border-right-width: 0.8125rem;
  border-top-color: var(--bubble);
}

/* Numbered because these really are steps in order, not decoration. */
.steps {
  display: grid;
  gap: var(--s2);
  margin: 0;
  padding-left: 1.4em;
}

.steps li {
  font-size: var(--text-base);
  line-height: 1.5;
}

.steps b {
  font-weight: 700;
}

.glyph {
  display: inline-grid;
  place-items: center;
  width: 1.5em;
  height: 1.5em;
  vertical-align: -0.4em;
  color: var(--ink);
}

.glyph svg {
  width: 100%;
  height: 100%;
}

.bottom {
  display: grid;
  gap: var(--s2);
  margin-top: auto;
}

.stamp {
  width: 100%;
  min-height: 3.5rem;
  border: var(--line-w-thick) solid var(--line);
  background: var(--cta);
  color: var(--cta-fg);
  box-shadow: var(--offset) var(--offset) 0 var(--shadow);
  font-family: var(--font-letter);
  font-size: var(--text-xl);
  letter-spacing: 0.04em;
}

.stamp:active {
  transform: translate(3px, 3px);
  box-shadow: 2px 2px 0 var(--shadow);
}

.fineprint {
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-sm);
  text-align: center;
}
</style>
