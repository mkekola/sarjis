import { describe, expect, it } from 'vitest';
import { bestSet, estimateOneRepMax } from '../app/lib/one-rep-max';
import type { LoggedSet } from '../app/lib/types';

function set(weight: number, reps: number, completedAt = '2026-09-30T17:00:00.000Z'): LoggedSet {
  return { weight, reps, completedAt, feel: null };
}

describe('estimateOneRepMax', () => {
  it('returns the weight itself for a single', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('ranks a heavy set of five above a single, which is the whole reason for using it', () => {
    const five = estimateOneRepMax(95, 5)!;
    const single = estimateOneRepMax(100, 1)!;
    expect(five).toBeGreaterThan(single);
  });

  it('ignores sets longer than twelve reps, so light high-rep work cannot win', () => {
    expect(estimateOneRepMax(60, 12)).not.toBeNull();
    expect(estimateOneRepMax(40, 20)).toBeNull();
  });

  it('rejects impossible input', () => {
    expect(estimateOneRepMax(0, 5)).toBeNull();
    expect(estimateOneRepMax(-80, 5)).toBeNull();
    expect(estimateOneRepMax(80, 0)).toBeNull();
    expect(estimateOneRepMax(Number.NaN, 5)).toBeNull();
  });
});

describe('bestSet', () => {
  it('picks the best comparable set rather than the heaviest', () => {
    const best = bestSet('squat', [set(100, 1), set(95, 5), set(80, 5)]);
    expect(best).not.toBeNull();
    expect(best!.weight).toBe(95);
    expect(best!.reps).toBe(5);
  });

  it('keeps the earliest of two equally good sets, so a record is not reset by repeating it', () => {
    const first = set(80, 5, '2026-09-01T10:00:00.000Z');
    const repeat = set(80, 5, '2026-09-30T10:00:00.000Z');
    expect(bestSet('squat', [first, repeat])!.achievedAt).toBe(first.completedAt);
  });

  it('returns null when no set qualifies', () => {
    expect(bestSet('squat', [])).toBeNull();
    expect(bestSet('squat', [set(40, 20)])).toBeNull();
  });
});
