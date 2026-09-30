import { onScopeDispose, readonly, ref } from 'vue';

/**
 * A clock that ticks. Anything showing elapsed time derives it from this rather
 * than accumulating, for the same reason the rest timer does.
 */
export function useNow(intervalMs = 1000) {
  const now = ref(Date.now());
  const sync = () => {
    now.value = Date.now();
  };

  const ticker = setInterval(sync, intervalMs);
  document.addEventListener('visibilitychange', sync);

  onScopeDispose(() => {
    clearInterval(ticker);
    document.removeEventListener('visibilitychange', sync);
  });

  return readonly(now);
}
