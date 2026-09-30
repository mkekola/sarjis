<script setup lang="ts">
const props = defineProps<{ done: number; total: number }>();

const pips = computed(() =>
  Array.from({ length: props.total }, (_, i) => {
    if (i < props.done) return 'done';
    return i === props.done ? 'now' : 'todo';
  }),
);
</script>

<template>
  <ul class="pips" :aria-label="`Sarja ${Math.min(done + 1, total)} / ${total}`">
    <li v-for="(state, i) in pips" :key="i" class="pip" :class="state" />
  </ul>
</template>

<style scoped>
.pips {
  display: flex;
  gap: var(--s1);
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pip {
  width: 1.375rem;
  height: 1.375rem;
  border: var(--line-w) solid var(--line);
  background: var(--paper);
}

.pip.done {
  background: var(--ink);
}

.pip.now {
  background: var(--caption);
}
</style>
