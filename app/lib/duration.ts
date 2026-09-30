function clock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Counting down. Rounds up, so "0:01" stays on screen for the whole final
 * second instead of flicking to zero half a second early.
 */
export function formatRemaining(ms: number): string {
  return clock(Math.ceil(Math.max(0, ms) / 1000));
}

/** Counting up. Rounds down, so the workout clock never shows time not yet spent. */
export function formatElapsed(ms: number): string {
  return clock(Math.floor(Math.max(0, ms) / 1000));
}
