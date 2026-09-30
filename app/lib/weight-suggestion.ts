import type { WeightSuggestion, WorkoutEntry } from './types';

/** Smallest practical barbell change: a 1.25 kg plate on each side. */
export const DEFAULT_INCREMENT_KG = 2.5;

/** One rating is not evidence — the first set of an exercise always feels easiest. */
const MIN_RATED_SETS = 2;

/**
 * Proposes a weight for the NEXT session from how this exercise felt.
 *
 * Deliberately never applies to the workout in progress: changing the weight
 * mid-exercise would break the set structure the plan is built on. This is
 * autoregulation — the load follows perceived effort instead of a fixed formula.
 */
export function suggestWeight(
  entry: WorkoutEntry,
  incrementKg: number = DEFAULT_INCREMENT_KG,
): WeightSuggestion | null {
  const ratings = entry.sets.map((set) => set.feel).filter((feel) => feel !== null);
  if (ratings.length < MIN_RATED_SETS) return null;

  // The working weight is the heaviest set that was actually completed, which
  // survives a warm-up or a mid-exercise drop better than the last set does.
  const currentWeight = Math.max(...entry.sets.map((set) => set.weight));
  if (!Number.isFinite(currentWeight) || currentWeight <= 0) return null;

  const completedAllSets = entry.sets.length >= entry.plannedSets;
  const missedReps = entry.sets.some((set) => set.reps < entry.plannedReps);

  if (completedAllSets && ratings.every((feel) => feel === 'light')) {
    return {
      exerciseId: entry.exerciseId,
      currentWeight,
      suggestedWeight: currentWeight + incrementKg,
      reason: 'all-sets-light',
    };
  }

  if (missedReps && ratings.every((feel) => feel === 'hard')) {
    return {
      exerciseId: entry.exerciseId,
      currentWeight,
      suggestedWeight: Math.max(incrementKg, currentWeight - incrementKg),
      reason: 'all-sets-hard',
    };
  }

  return null;
}
