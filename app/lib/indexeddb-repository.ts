import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TrainingRepository } from './repository';
import type { Exercise, Program, Workout } from './types';

const DB_NAME = 'sarjis';
const DB_VERSION = 1;

interface SarjisDB extends DBSchema {
  exercises: { key: string; value: Exercise };
  programs: { key: string; value: Program };
  workouts: { key: string; value: Workout; indexes: { startedAt: string } };
}

/**
 * On-device storage. The only implementation for now; a syncing one can be
 * added behind TrainingRepository without the app changing.
 *
 * Note this data only survives on iOS when the app is installed to the home
 * screen — Safari clears a site's storage after seven days of disuse, and
 * installed web apps are exempt from that.
 */
export class IndexedDbTrainingRepository implements TrainingRepository {
  private connection: Promise<IDBPDatabase<SarjisDB>> | null = null;

  /** Opened on first use, so importing this module never touches indexedDB. */
  private db(): Promise<IDBPDatabase<SarjisDB>> {
    this.connection ??= openDB<SarjisDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('exercises')) {
          db.createObjectStore('exercises', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('programs')) {
          db.createObjectStore('programs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('workouts')) {
          const workouts = db.createObjectStore('workouts', { keyPath: 'id' });
          workouts.createIndex('startedAt', 'startedAt');
        }
      },
    });
    return this.connection;
  }

  async listExercises(): Promise<Exercise[]> {
    return (await this.db()).getAll('exercises');
  }

  async getExercise(id: string): Promise<Exercise | null> {
    return (await (await this.db()).get('exercises', id)) ?? null;
  }

  async saveExercise(exercise: Exercise): Promise<void> {
    await (await this.db()).put('exercises', exercise);
  }

  async listPrograms(): Promise<Program[]> {
    return (await this.db()).getAll('programs');
  }

  async getProgram(id: string): Promise<Program | null> {
    return (await (await this.db()).get('programs', id)) ?? null;
  }

  async saveProgram(program: Program): Promise<void> {
    await (await this.db()).put('programs', program);
  }

  async listWorkouts(): Promise<Workout[]> {
    const byDate = await (await this.db()).getAllFromIndex('workouts', 'startedAt');
    return byDate.reverse();
  }

  async getWorkout(id: string): Promise<Workout | null> {
    return (await (await this.db()).get('workouts', id)) ?? null;
  }

  /**
   * Walks back from the newest workout. A running workout is almost always the
   * newest one, so this reads a single record in practice.
   */
  async getActiveWorkout(): Promise<Workout | null> {
    const db = await this.db();
    let cursor = await db.transaction('workouts').store.index('startedAt').openCursor(null, 'prev');

    while (cursor) {
      if (cursor.value.endedAt === null) return cursor.value;
      cursor = await cursor.continue();
    }
    return null;
  }

  async saveWorkout(workout: Workout): Promise<void> {
    await (await this.db()).put('workouts', workout);
  }

  async workoutsWithExercise(exerciseId: string): Promise<Workout[]> {
    const all = await this.listWorkouts();
    return all.filter((workout) => workout.entries.some((e) => e.exerciseId === exerciseId));
  }

  async exportAll() {
    const db = await this.db();
    const [exercises, programs, workouts] = await Promise.all([
      db.getAll('exercises'),
      db.getAll('programs'),
      db.getAll('workouts'),
    ]);
    return { exercises, programs, workouts };
  }
}
