<template>
  <!-- The word in a comic frame, offset shadow in the action colour. -->
  <span class="wordmark">Sarjis</span>
</template>

<style scoped>
.wordmark {
  display: inline-block;
  padding: 0.04em 0.28em 0.14em;
  border: var(--line-w-thick) solid var(--line);
  background: var(--paper);
  box-shadow: var(--offset) var(--offset) 0 var(--cta);
  color: var(--ink);
  font-family: var(--font-letter);
  font-size: var(--display-sm);
  letter-spacing: 0.06em;
  line-height: 1.1;
}
</style>
