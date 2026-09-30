import type { Exercise, Workout } from './types';

/**
 * A workout already under way, so the first launch shows the screen doing its
 * job rather than an empty shell. Replaced by real programs once those can be
 * created in the app.
 */

export const seedExercises: Exercise[] = [
  { id: 'squat', name: 'Jalkakyykky', updatedAt: '2026-09-30T00:00:00.000Z' },
  { id: 'bench', name: 'Penkkipunnerrus', updatedAt: '2026-09-30T00:00:00.000Z' },
  { id: 'row', name: 'Kulmasoutu', updatedAt: '2026-09-30T00:00:00.000Z' },
];

export function seedWorkout(startedAt = new Date()): Workout {
  const iso = startedAt.toISOString();

  return {
    id: `workout-${startedAt.getTime()}`,
    programId: 'voima-5x5',
    dayName: 'A-treeni',
    startedAt: iso,
    endedAt: null,
    updatedAt: iso,
    entries: [
      {
        exerciseId: 'squat',
        plannedSets: 5,
        plannedReps: 5,
        plannedWeight: 80,
        restSeconds: 90,
        sets: [],
        note: null,
      },
      {
        exerciseId: 'bench',
        plannedSets: 5,
        plannedReps: 5,
        plannedWeight: 60,
        restSeconds: 90,
        sets: [],
        note: null,
      },
      {
        exerciseId: 'row',
        plannedSets: 5,
        plannedReps: 5,
        plannedWeight: 50,
        restSeconds: 75,
        sets: [],
        note: null,
      },
    ],
  };
}
