import { describe, expect, it } from 'vitest';
import { suggestWeight } from '../app/lib/weight-suggestion';
import type { SetFeel, WorkoutEntry } from '../app/lib/types';

/** A 5×5 entry at one weight, with the given ratings applied in order. */
function entry(weight: number, reps: number[], feels: (SetFeel | null)[]): WorkoutEntry {
  return {
    exerciseId: 'squat',
    plannedSets: 5,
    plannedReps: 5,
    plannedWeight: weight,
    restSeconds: 90,
    sets: reps.map((r, i) => ({
      weight,
      reps: r,
      completedAt: '2026-09-30T17:00:00.000Z',
      feel: feels[i] ?? null,
    })),
    note: null,
  };
}

const allFive = [5, 5, 5, 5, 5];

describe('suggestWeight', () => {
  it('suggests more weight when every set was completed and rated light', () => {
    const result = suggestWeight(entry(80, allFive, Array(5).fill('light')));
    expect(result).toEqual({
      exerciseId: 'squat',
      currentWeight: 80,
      suggestedWeight: 82.5,
      reason: 'all-sets-light',
    });
  });

  it('stays quiet on a single rating, because the first set always feels easiest', () => {
    expect(suggestWeight(entry(80, allFive, ['light', null, null, null, null]))).toBeNull();
  });

  it('stays quiet when the ratings disagree', () => {
    expect(suggestWeight(entry(80, allFive, ['light', 'light', 'ok', 'hard', 'hard']))).toBeNull();
  });

  it('does not suggest more weight when sets were left undone, however light they felt', () => {
    expect(suggestWeight(entry(80, [5, 5, 5], ['light', 'light', 'light']))).toBeNull();
  });

  it('suggests less weight only when reps were missed and every set felt hard', () => {
    const missed = suggestWeight(entry(80, [5, 5, 4, 3, 3], Array(5).fill('hard')));
    expect(missed?.reason).toBe('all-sets-hard');
    expect(missed?.suggestedWeight).toBe(77.5);

    // Hard but complete is exactly what a working set should feel like.
    expect(suggestWeight(entry(80, allFive, Array(5).fill('hard')))).toBeNull();
  });

  it('never proposes a weight at or below zero', () => {
    const result = suggestWeight(entry(2.5, [5, 5, 4, 3, 3], Array(5).fill('hard')));
    expect(result!.suggestedWeight).toBeGreaterThan(0);
  });

  it('reads the working weight as the heaviest set, surviving a mid-exercise drop', () => {
    const dropped = entry(80, allFive, Array(5).fill('light'));
    dropped.sets[4]!.weight = 70;
    expect(suggestWeight(dropped)!.currentWeight).toBe(80);
  });

  it('honours a custom increment for exercises without 1.25 kg plates', () => {
    const result = suggestWeight(entry(20, allFive, Array(5).fill('light')), 1);
    expect(result!.suggestedWeight).toBe(21);
  });
});
