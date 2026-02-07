import test from "node:test";
import assert from "node:assert/strict";
import { WorkoutService } from "./workoutService";
import type { ExerciseEntry } from "../types/workout";
import { WORKOUT_CONSTANTS } from "../constants";

function makeExercise(overrides?: Partial<ExerciseEntry>): ExerciseEntry {
  return {
    id: "exercise-1",
    name: "Bench Press",
    sets: [
      {
        id: "set-1",
        weight: 60,
        reps: 8,
      },
    ],
    ...overrides,
  };
}

test("validateWorkout returns empty array for valid payload", () => {
  const service = new WorkoutService();
  const errors = service.validateWorkout([makeExercise()]);
  assert.equal(errors.length, 0);
});

test("validateWorkout returns errors for invalid set bounds", () => {
  const service = new WorkoutService();
  const errors = service.validateWorkout([
    makeExercise({
      sets: [
        {
          id: "set-1",
          weight: WORKOUT_CONSTANTS.MAX_WEIGHT_KG + 1,
          reps: 0,
        },
      ],
    }),
  ]);

  assert.equal(errors.length, 2);
  assert.equal(errors[0]?.field, "reps");
  assert.equal(errors[1]?.field, "weight");
});

test("validateWorkout returns error when exercise limit exceeded", () => {
  const service = new WorkoutService();
  const payload = Array.from(
    { length: WORKOUT_CONSTANTS.MAX_EXERCISES + 1 },
    (_, index) => makeExercise({ id: `exercise-${index + 1}` })
  );

  const errors = service.validateWorkout(payload);
  assert.ok(errors.length > 0);
  assert.match(errors[0]?.message ?? "", /Too many exercises/);
});

test("saveWorkout rejects invalid template id before persistence", async () => {
  const service = new WorkoutService();
  await assert.rejects(
    service.saveWorkout("not-a-uuid", [makeExercise()], new Map()),
    /Invalid template ID format/
  );
});

test("saveWorkout rejects invalid template exercise id in map", async () => {
  const service = new WorkoutService();
  const map = new Map<string, string>([["exercise-1", "bad-id"]]);

  await assert.rejects(
    service.saveWorkout(null, [makeExercise()], map),
    /Invalid template exercise ID format/
  );
});
