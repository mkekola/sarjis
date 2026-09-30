<script setup lang="ts">
import type { SetFeel } from '../lib/types';

defineProps<{ modelValue: SetFeel | null }>();
defineEmits<{ 'update:modelValue': [SetFeel] }>();

const OPTIONS: { value: SetFeel; label: string }[] = [
  { value: 'light', label: 'Kevyt' },
  { value: 'ok', label: 'Sopiva' },
  { value: 'hard', label: 'Raskas' },
];
</script>

<template>
  <!-- Rated after the set is logged, never as a gate before it: this is asked
       up to forty times a workout, so it has to be skippable without cost. -->
  <div class="feel">
    <p id="feel-q" class="q">Miltä sarja tuntui?</p>
    <div class="row" role="group" aria-labelledby="feel-q">
      <button
        v-for="option in OPTIONS"
        :key="option.value"
        type="button"
        :aria-pressed="modelValue === option.value"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.feel {
  display: grid;
  gap: var(--s1);
}

.q {
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.row {
  display: flex;
  gap: var(--s1);
}

.row button {
  flex: 1;
  min-height: var(--tap);
  border: var(--line-w) solid var(--line);
  background: var(--paper-2);
  color: var(--ink);
  font-size: var(--text-sm);
  font-weight: 700;
}

.row button[aria-pressed='true'] {
  background: var(--caption);
  color: var(--caption-fg);
}
</style>
