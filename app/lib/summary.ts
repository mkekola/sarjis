import type { Workout } from './types';

/** Sets actually logged, which is not the same as sets planned. */
export function setCount(workout: Workout): number {
  return workout.entries.reduce((total, entry) => total + entry.sets.length, 0);
}

/**
 * Total load moved: weight × reps summed over every logged set. The standard
 * way to compare one session against another when the exercises differ.
 */
export function totalVolume(workout: Workout): number {
  return workout.entries.reduce(
    (total, entry) => total + entry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
    0,
  );
}

/** True once every exercise has all its planned sets. */
export function isComplete(workout: Workout): boolean {
  return workout.entries.every((entry) => entry.sets.length >= entry.plannedSets);
}

/** Milliseconds spent, frozen once the workout has ended. */
export function durationMs(workout: Workout, now: number): number {
  const end = workout.endedAt ? Date.parse(workout.endedAt) : now;
  return end - Date.parse(workout.startedAt);
}
