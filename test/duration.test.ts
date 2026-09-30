import { describe, expect, it } from 'vitest';
import { formatElapsed, formatRemaining } from '../app/lib/duration';

describe('formatRemaining', () => {
  it('shows a whole rest period', () => {
    expect(formatRemaining(90_000)).toBe('1:30');
  });

  it('rounds up, so the last second is shown for its whole length', () => {
    expect(formatRemaining(1)).toBe('0:01');
    expect(formatRemaining(1_400)).toBe('0:02');
  });

  it('never goes below zero, however late the tick arrives', () => {
    expect(formatRemaining(0)).toBe('0:00');
    expect(formatRemaining(-5_000)).toBe('0:00');
  });
});

describe('formatElapsed', () => {
  it('rounds down, so the clock never shows time not yet spent', () => {
    expect(formatElapsed(1_999)).toBe('0:01');
    expect(formatElapsed(59_999)).toBe('0:59');
  });

  it('pads seconds so the digits do not shift while you watch them', () => {
    expect(formatElapsed(65_000)).toBe('1:05');
    expect(formatElapsed(600_000)).toBe('10:00');
  });

  it('adds hours only once a workout is genuinely that long', () => {
    expect(formatElapsed(3_599_000)).toBe('59:59');
    expect(formatElapsed(3_600_000)).toBe('1:00:00');
    expect(formatElapsed(3_725_000)).toBe('1:02:05');
  });
});
