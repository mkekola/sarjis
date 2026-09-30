<script setup lang="ts">
defineProps<{ text: string }>();
</script>

<template>
  <!-- Comic element 1 of 3: the narrator box states where you are.
       It does not address you — that is the speech bubble's job. -->
  <p class="caption">{{ text }}</p>
</template>

<style scoped>
.caption {
  position: relative;
  z-index: 2;
  width: fit-content;
  margin: 0;
  padding: 0.08em var(--s3) 0.16em;
  border: var(--line-w) solid var(--line);
  background: var(--caption);
  color: var(--caption-fg);
  font-family: var(--font-letter);
  font-size: var(--text-xl);
  letter-spacing: 0.04em;
  transform: rotate(-1.2deg);
}
</style>
