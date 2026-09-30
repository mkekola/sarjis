// Domain model. Identifiers and values are English so the code reads in one
// language; Finnish display strings live in the UI layer.

/** Coarse RPE. Three values because a sweaty thumb cannot hit ten. */
export type SetFeel = 'light' | 'ok' | 'hard';

export interface Exercise {
  id: string;
  name: string;
  updatedAt: string;
}

export interface ProgramItem {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  /** null = inherit from the last time this exercise was trained. */
  targetWeight: number | null;
  restSeconds: number;
}

export interface ProgramDay {
  id: string;
  name: string;
  items: ProgramItem[];
}

export interface Program {
  id: string;
  name: string;
  days: ProgramDay[];
  updatedAt: string;
}

export interface LoggedSet {
  weight: number;
  reps: number;
  completedAt: string;
  /** null until rated, and it stays null if the rating is skipped. */
  feel: SetFeel | null;
}

export interface WorkoutEntry {
  exerciseId: string;
  /**
   * The plan as it was when this workout started. Copied rather than
   * referenced, so editing a program never rewrites past workouts.
   */
  plannedSets: number;
  plannedReps: number;
  plannedWeight: number | null;
  restSeconds: number;
  sets: LoggedSet[];
  note: string | null;
}

export interface Workout {
  id: string;
  programId: string;
  /** Snapshotted label, for the same reason the plan is snapshotted. */
  dayName: string;
  startedAt: string;
  /** null while the workout is still running. */
  endedAt: string | null;
  entries: WorkoutEntry[];
  updatedAt: string;
}

/** Derived, never stored: recomputed from logged sets. */
export interface PersonalBest {
  exerciseId: string;
  estimatedOneRepMax: number;
  weight: number;
  reps: number;
  achievedAt: string;
}

/** A weight change proposed for the next session, from how the sets felt. */
export interface WeightSuggestion {
  exerciseId: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: 'all-sets-light' | 'all-sets-hard';
}
