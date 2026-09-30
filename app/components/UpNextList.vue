<script setup lang="ts">
defineProps<{ items: { id: string; name: string; detail: string }[] }>();
</script>

<template>
  <section v-if="items.length" class="upnext">
    <h2 class="ttl">Seuraavaksi</h2>
    <ul>
      <li v-for="item in items" :key="item.id" class="mini">
        <span>{{ item.name }}</span>
        <span class="detail tabular">{{ item.detail }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.upnext {
  display: grid;
  gap: var(--s2);
}

.ttl {
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

ul {
  display: grid;
  gap: var(--s2);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Small panels: the rest of the page, still in reading order. */
.mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  padding: var(--s2) var(--s3);
  border: var(--line-w) solid var(--line);
  background: var(--paper-2);
  font-size: var(--text-sm);
  font-weight: 700;
}

.detail {
  font-family: var(--font-display);
  font-size: var(--text-sm);
}
</style>
