import type { LoggedSet, PersonalBest } from './types';

/**
 * Above this the Epley formula stops being meaningful: a 20-rep set would
 * estimate a higher max than a heavy triple. Long sets simply do not compete
 * for a personal best.
 */
const MAX_REPS_FOR_ESTIMATE = 12;

/**
 * Epley: 1RM = weight × (1 + reps / 30). Returns null when the set cannot be
 * meaningfully compared. Unrounded, so comparisons stay exact; round for display.
 */
export function estimateOneRepMax(weight: number, reps: number): number | null {
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) return null;
  if (weight <= 0 || reps < 1) return null;
  if (reps > MAX_REPS_FOR_ESTIMATE) return null;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** The best comparable set for one exercise, or null if none qualifies. */
export function bestSet(exerciseId: string, sets: LoggedSet[]): PersonalBest | null {
  let best: PersonalBest | null = null;

  for (const set of sets) {
    const estimate = estimateOneRepMax(set.weight, set.reps);
    if (estimate === null) continue;
    if (best && estimate <= best.estimatedOneRepMax) continue;

    best = {
      exerciseId,
      estimatedOneRepMax: estimate,
      weight: set.weight,
      reps: set.reps,
      achievedAt: set.completedAt,
    };
  }

  return best;
}
