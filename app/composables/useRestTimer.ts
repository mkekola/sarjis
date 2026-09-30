import { computed, onScopeDispose, ref } from 'vue';
import { formatRemaining } from '../lib/duration';

/**
 * Rest timer driven by a wall-clock deadline rather than a decrementing
 * counter.
 *
 * This is the whole point: browsers throttle timers in a backgrounded tab, and
 * a phone locks its screen between sets. A counter that subtracts on every tick
 * loses exactly the time the phone spent in your pocket. Storing the deadline
 * and recomputing from Date.now() means a missed tick costs nothing — when the
 * screen wakes, the number is already right.
 */
export function useRestTimer() {
  const deadline = ref<number | null>(null);
  const now = ref(Date.now());
  let ticker: ReturnType<typeof setInterval> | undefined;

  function sync() {
    now.value = Date.now();
  }

  function startTicking() {
    if (ticker !== undefined) return;
    // 250ms rather than 1000ms so the displayed second never lags a real one.
    ticker = setInterval(sync, 250);
    document.addEventListener('visibilitychange', sync);
  }

  function stopTicking() {
    if (ticker !== undefined) clearInterval(ticker);
    ticker = undefined;
    document.removeEventListener('visibilitychange', sync);
  }

  const remainingMs = computed(() =>
    deadline.value === null ? 0 : Math.max(0, deadline.value - now.value),
  );
  const isRunning = computed(() => remainingMs.value > 0);
  const label = computed(() => formatRemaining(remainingMs.value));

  function start(seconds: number) {
    sync();
    deadline.value = now.value + seconds * 1000;
    startTicking();
  }

  function add(seconds: number) {
    if (deadline.value === null) return start(seconds);
    deadline.value += seconds * 1000;
    sync();
  }

  function skip() {
    deadline.value = null;
    stopTicking();
  }

  onScopeDispose(stopTicking);

  return { label, remainingMs, isRunning, start, add, skip };
}
