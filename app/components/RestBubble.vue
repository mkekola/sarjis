<script setup lang="ts">
defineProps<{ label: string }>();
defineEmits<{ add: []; skip: [] }>();
</script>

<template>
  <!-- Comic element 3 of 3: the app speaking. A bubble is the only shape in the
       language that addresses you directly, so the timer belongs in one. -->
  <div class="bubble">
    <p class="reading">
      <span class="lbl">Lepo</span>
      <span class="clock tabular">{{ label }}</span>
    </p>

    <div class="actions">
      <button type="button" @click="$emit('add')">+30s</button>
      <button type="button" @click="$emit('skip')">Ohita</button>
    </div>
  </div>
</template>

<style scoped>
.bubble {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s2);
  padding: var(--s2) var(--s3);
  border: var(--line-w) solid var(--line);
  border-radius: 1.375rem;
  background: var(--bubble);
  color: var(--bubble-fg);
  box-shadow: var(--offset) var(--offset) 0 var(--shadow);
}

/* Tail, drawn twice: the outline first, the fill on top of it. */
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

.reading {
  margin: 0;
}

.lbl {
  display: block;
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.clock {
  display: block;
  font-family: var(--font-display);
  font-size: var(--display-sm);
  line-height: 1;
}

.actions {
  display: flex;
  gap: var(--s1);
}

.actions button {
  min-width: 3.5rem;
  min-height: var(--tap);
  padding: var(--s2);
  border: var(--line-w) solid var(--line);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: var(--text-sm);
}
</style>
