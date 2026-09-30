import { describe, expect, it } from 'vitest';
import { durationMs, isComplete, setCount, totalVolume } from '../app/lib/summary';
import type { Workout } from '../app/lib/types';

function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'w1',
    programId: 'voima-5x5',
    dayName: 'A-treeni',
    startedAt: '2026-09-30T17:00:00.000Z',
    endedAt: null,
    updatedAt: '2026-09-30T17:00:00.000Z',
    entries: [
      {
        exerciseId: 'squat',
        plannedSets: 2,
        plannedReps: 5,
        plannedWeight: 80,
        restSeconds: 90,
        sets: [
          { weight: 80, reps: 5, completedAt: '2026-09-30T17:05:00.000Z', feel: null },
          { weight: 80, reps: 4, completedAt: '2026-09-30T17:08:00.000Z', feel: null },
        ],
        note: null,
      },
    ],
    ...overrides,
  };
}

describe('setCount', () => {
  it('counts sets logged, not sets planned', () => {
    const partial = workout();
    partial.entries[0]!.sets.pop();
    expect(setCount(partial)).toBe(1);
  });
});

describe('totalVolume', () => {
  it('sums weight times reps, so a missed rep lowers the total', () => {
    expect(totalVolume(workout())).toBe(80 * 5 + 80 * 4);
  });

  it('is zero before anything is logged', () => {
    const empty = workout();
    empty.entries[0]!.sets = [];
    expect(totalVolume(empty)).toBe(0);
  });
});

describe('isComplete', () => {
  it('is true once every exercise has its planned sets', () => {
    expect(isComplete(workout())).toBe(true);
  });

  it('is false while any set is still missing', () => {
    const partial = workout();
    partial.entries[0]!.sets.pop();
    expect(isComplete(partial)).toBe(false);
  });
});

describe('durationMs', () => {
  const start = Date.parse('2026-09-30T17:00:00.000Z');

  it('runs against the clock while the workout is open', () => {
    expect(durationMs(workout(), start + 600_000)).toBe(600_000);
  });

  it('freezes at endedAt, so a finished workout stops counting', () => {
    const done = workout({ endedAt: '2026-09-30T17:45:00.000Z' });
    expect(durationMs(done, start + 9_999_999)).toBe(45 * 60_000);
  });
});
