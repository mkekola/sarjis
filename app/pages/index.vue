<script setup lang="ts">
import { IndexedDbTrainingRepository } from '../lib/indexeddb-repository';
import { formatElapsed } from '../lib/duration';
import { seedExercises, seedWorkout } from '../lib/seed';
import { durationMs, isComplete, setCount, totalVolume } from '../lib/summary';
import type { Exercise, SetFeel, Workout } from '../lib/types';

const repo = new IndexedDbTrainingRepository();

const workout = ref<Workout | null>(null);
const names = ref(new Map<string, string>());
/** The set just completed, so the rating applies to it and not to whatever comes next. */
const justLogged = ref<{ entry: number; set: number } | null>(null);

const now = useNow();
const rest = useRestTimer();
const wake = useWakeLock();
const { isStandalone, isIos } = useStandalone();

const GUIDE_KEY = 'sarjis.install-dismissed';
/** Starts hidden so the guide never flashes before we know the display mode. */
const guideDismissed = ref(true);
const showGuide = computed(() => !isStandalone.value && !guideDismissed.value);

function dismissGuide() {
  guideDismissed.value = true;
  try {
    localStorage.setItem(GUIDE_KEY, '1');
  } catch {
    // Private mode, or storage refused. The guide will ask again, which is the
    // right failure: Safari clears this after a week of disuse anyway, and that
    // is exactly when the warning is worth repeating.
  }
}

/** IndexedDB stores structured clones, and a Vue proxy is not one. */
const plain = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const stamp = () => new Date().toISOString();

onMounted(async () => {
  try {
    guideDismissed.value = localStorage.getItem(GUIDE_KEY) === '1';
  } catch {
    guideDismissed.value = false;
  }

  const exercises = await loadExercises();
  names.value = new Map(exercises.map((exercise) => [exercise.id, exercise.name]));

  let active = await repo.getActiveWorkout();
  if (!active) {
    active = seedWorkout();
    await repo.saveWorkout(active);
  }
  workout.value = active;

  void wake.request();
});

async function loadExercises(): Promise<Exercise[]> {
  const existing = await repo.listExercises();
  if (existing.length > 0) return existing;
  await Promise.all(seedExercises.map((exercise) => repo.saveExercise(exercise)));
  return seedExercises;
}

const currentIndex = computed(
  () => workout.value?.entries.findIndex((entry) => entry.sets.length < entry.plannedSets) ?? -1,
);
const current = computed(() =>
  currentIndex.value >= 0 ? (workout.value?.entries[currentIndex.value] ?? null) : null,
);
const currentName = computed(() =>
  current.value ? (names.value.get(current.value.exerciseId) ?? current.value.exerciseId) : '',
);

/** Stops at endedAt: a finished workout must not keep counting. */
const elapsed = computed(() =>
  workout.value ? formatElapsed(durationMs(workout.value, now.value)) : '0:00',
);

const summary = computed(() =>
  workout.value
    ? { sets: setCount(workout.value), volume: totalVolume(workout.value) }
    : { sets: 0, volume: 0 },
);

const ratingOfLoggedSet = computed(() => {
  const mark = justLogged.value;
  if (!mark || !workout.value) return null;
  return workout.value.entries[mark.entry]?.sets[mark.set]?.feel ?? null;
});

const upNext = computed(() => {
  if (!workout.value || currentIndex.value < 0) return [];
  return workout.value.entries.slice(currentIndex.value + 1).map((entry) => ({
    id: entry.exerciseId,
    name: names.value.get(entry.exerciseId) ?? entry.exerciseId,
    detail: `${entry.plannedWeight ?? '?'} kg × ${entry.plannedReps}`,
  }));
});

async function logSet() {
  const active = workout.value;
  const entry = current.value;
  const index = currentIndex.value;
  if (!active || !entry) return;

  entry.sets.push({
    weight: entry.plannedWeight ?? 0,
    reps: entry.plannedReps,
    completedAt: stamp(),
    feel: null,
  });
  active.updatedAt = stamp();
  justLogged.value = { entry: index, set: entry.sets.length - 1 };

  // Closing the workout is what stops the clock and frees getActiveWorkout to
  // return nothing next time. Without it the app would reopen a finished
  // session for ever.
  const finished = isComplete(active);
  if (finished) {
    active.endedAt = stamp();
    rest.skip();
    void wake.release();
  }

  await repo.saveWorkout(plain(active));
  if (!finished) rest.start(entry.restSeconds);
}

async function startNextWorkout() {
  const next = seedWorkout();
  await repo.saveWorkout(next);
  workout.value = next;
  justLogged.value = null;
  void wake.request();
}

async function rateSet(feel: SetFeel) {
  const active = workout.value;
  const mark = justLogged.value;
  const set = active?.entries[mark?.entry ?? -1]?.sets[mark?.set ?? -1];
  if (!active || !set) return;

  set.feel = feel;
  active.updatedAt = stamp();
  await repo.saveWorkout(plain(active));
}

function skipRest() {
  rest.skip();
  justLogged.value = null;
}
</script>

<template>
  <InstallGuide v-if="showGuide" :is-ios="isIos" @dismiss="dismissGuide" />

  <main v-else class="screen">
    <p v-if="!workout" class="loading">Ladataan treeniä…</p>

    <template v-else>
      <header class="hud">
        <span>Voima 5×5 · {{ workout.dayName }}</span>
        <span class="elapsed tabular">{{ elapsed }}</span>
      </header>

      <template v-if="current">
        <CaptionBox :text="currentName" />

        <section class="panel">
          <!-- Comic element 2 of 3: speed lines mean a set is under way. They
               are decoration over empty margin, never under readable text. -->
          <div v-if="rest.isRunning.value" class="motion" aria-hidden="true" />

          <p class="setline">Sarja {{ current.sets.length + 1 }} / {{ current.plannedSets }}</p>

          <p class="load tabular">
            <span class="kg">{{ current.plannedWeight ?? '—' }}</span>
            <span class="unit">kg</span>
            <span class="times">×</span>
            <span class="reps">{{ current.plannedReps }}</span>
          </p>

          <SetPips :done="current.sets.length" :total="current.plannedSets" />
        </section>

        <!-- Pinned to the bottom of the screen: this is the half of the phone a
             thumb reaches while the other hand is holding a bar. -->
        <div class="bottom">
          <RestBubble
            v-if="rest.isRunning.value"
            :label="rest.label.value"
            @add="rest.add(30)"
            @skip="skipRest"
          />

          <FeelPicker
            v-if="justLogged"
            :model-value="ratingOfLoggedSet"
            @update:model-value="rateSet"
          />

          <button type="button" class="stamp" @click="logSet">Merkkaa sarja</button>

          <UpNextList :items="upNext" />
        </div>
      </template>

      <template v-else>
        <!-- The closing panel. Comics end on one, and it is the right shape for
             a summary: still a panel, still read in order, just the last. -->
        <CaptionBox text="Treeni tehty" />

        <section class="panel">
          <dl class="summary">
            <div>
              <dt>Kesto</dt>
              <dd class="tabular">{{ elapsed }}</dd>
            </div>
            <div>
              <dt>Sarjoja</dt>
              <dd class="tabular">{{ summary.sets }}</dd>
            </div>
            <div>
              <dt>Volyymi</dt>
              <dd class="tabular">{{ summary.volume }} kg</dd>
            </div>
          </dl>
        </section>

        <div class="bottom">
          <!-- The last set still deserves a rating, so the picker outlives the
               exercise it belongs to. -->
          <FeelPicker
            v-if="justLogged"
            :model-value="ratingOfLoggedSet"
            @update:model-value="rateSet"
          />

          <button type="button" class="stamp" @click="startNextWorkout">Aloita uusi</button>
        </div>
      </template>
    </template>
  </main>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  max-width: 26rem;
  min-height: 100%;
  margin-inline: auto;
  padding-inline: var(--s3);
  padding-top: calc(var(--s3) + env(safe-area-inset-top, 0px));
  padding-bottom: calc(var(--s4) + env(safe-area-inset-bottom, 0px));
}

.bottom {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  margin-top: auto;
}

.loading {
  margin: var(--s6) 0;
  color: var(--ink-soft);
  text-align: center;
}

.summary {
  display: grid;
  gap: var(--s3);
  margin: 0;
}

.summary div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
}

.summary dt {
  color: var(--ink-soft);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.summary dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

.hud {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  padding-bottom: var(--s2);
  border-bottom: var(--line-w) solid var(--line);
  color: var(--ink-soft);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.elapsed {
  color: var(--ink);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  letter-spacing: 0;
}

/* One panel, one exercise. Depth comes from line weight and a hard offset,
   never from a soft shadow — that is how comics are printed. */
.panel {
  position: relative;
  overflow: hidden;
  padding: var(--s4) var(--s3) var(--s3);
  border: var(--line-w) solid var(--line);
  background: var(--paper);
  box-shadow: var(--offset) var(--offset) 0 var(--shadow);
  text-align: center;
}

/* Speed lines enter from the panel's edges and stop well short of the centred
   figures. Confined by position rather than by a mask, so there is no way for
   them to end up behind something readable. */
.motion {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.motion::before,
.motion::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2.25rem;
  background: repeating-linear-gradient(90deg, var(--dot) 0 1px, transparent 1px 7px);
}

.motion::before {
  left: 0;
  mask-image: linear-gradient(90deg, #000, transparent);
  -webkit-mask-image: linear-gradient(90deg, #000, transparent);
}

.motion::after {
  right: 0;
  mask-image: linear-gradient(270deg, #000, transparent);
  -webkit-mask-image: linear-gradient(270deg, #000, transparent);
}

.setline {
  position: relative;
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.load {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin: var(--s2) 0 var(--s3);
  font-family: var(--font-display);
  line-height: 0.88;
}

.kg {
  font-size: var(--display-lg);
}

.unit {
  margin-right: var(--s2);
  font-size: var(--text-lg);
}

.times {
  margin-inline: var(--s1);
  color: var(--ink-soft);
  font-size: var(--text-xl);
}

.reps {
  font-size: var(--display-md);
}

/* The one thing you press twenty times a workout, so it is the biggest thing
   on screen and sits within thumb reach. */
.stamp {
  width: 100%;
  min-height: 4rem;
  border: var(--line-w-thick) solid var(--line);
  background: var(--cta);
  color: var(--cta-fg);
  box-shadow: var(--offset) var(--offset) 0 var(--shadow);
  font-family: var(--font-letter);
  font-size: var(--display-sm);
  letter-spacing: 0.04em;
}

.stamp:active {
  transform: translate(3px, 3px);
  box-shadow: 2px 2px 0 var(--shadow);
}
</style>
