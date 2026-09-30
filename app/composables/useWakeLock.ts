import { onScopeDispose, ref } from 'vue';

/**
 * Keeps the screen awake during a workout, so the phone does not lock on the
 * rack between sets.
 *
 * Two things the API does not do for you: it is released automatically whenever
 * the page is hidden, so it has to be re-requested when you come back, and it
 * rejects without warning when the browser declines. Neither is an error worth
 * showing, since the app simply works slightly worse.
 *
 * Supported in Safari from iOS 16.4, and in installed home-screen apps only
 * from iOS 18.4, where a long-standing bug was fixed.
 */
export function useWakeLock() {
  const isHeld = ref(false);
  let sentinel: WakeLockSentinel | null = null;
  let wanted = false;

  const supported = () => typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  async function acquire() {
    if (!supported() || sentinel !== null || document.visibilityState !== 'visible') return;
    try {
      sentinel = await navigator.wakeLock.request('screen');
      isHeld.value = true;
      sentinel.addEventListener('release', () => {
        sentinel = null;
        isHeld.value = false;
      });
    } catch {
      isHeld.value = false;
    }
  }

  function onVisibility() {
    if (wanted) void acquire();
  }

  async function request() {
    wanted = true;
    document.addEventListener('visibilitychange', onVisibility);
    await acquire();
  }

  async function release() {
    wanted = false;
    document.removeEventListener('visibilitychange', onVisibility);
    await sentinel?.release();
    sentinel = null;
    isHeld.value = false;
  }

  onScopeDispose(() => {
    void release();
  });

  return { isHeld, request, release };
}
