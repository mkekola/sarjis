import type { Exercise, Program, Workout } from './types'

/**
 * Every read and write goes through this port. The first implementation stores
 * everything on the device; a later one can add Supabase sync behind the same
 * interface without the app noticing. This is the repository pattern, and it is
 * the reason adding sync later is not a rewrite.
 *
 * Nothing here takes a user id: on-device storage has exactly one user. That
 * argument belongs to the sync layer, not to the domain.
 */
export interface TrainingRepository {
  listExercises(): Promise<Exercise[]>
  getExercise(id: string): Promise<Exercise | null>
  saveExercise(exercise: Exercise): Promise<void>

  listPrograms(): Promise<Program[]>
  getProgram(id: string): Promise<Program | null>
  saveProgram(program: Program): Promise<void>

  /** Newest first. */
  listWorkouts(): Promise<Workout[]>
  getWorkout(id: string): Promise<Workout | null>
  /** The workout with no endedAt, if one is running. */
  getActiveWorkout(): Promise<Workout | null>
  saveWorkout(workout: Workout): Promise<void>

  /** Every logged set for one exercise, for personal bests and inherited weights. */
  setsForExercise(exerciseId: string): Promise<Workout[]>

  /** Whole-database export, for the JSON backup. */
  exportAll(): Promise<{ exercises: Exercise[], programs: Program[], workouts: Workout[] }>
}
