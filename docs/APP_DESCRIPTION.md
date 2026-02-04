# Workout Tracker — Application Description

This document describes the implemented pages, functionality, and database structure of the Workout Tracker application.

---

## 1. Overview

- **Name:** Workout Tracker (Personal Workout Tracker)
- **Type:** Web application (MVP), mobile-first
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL)
- **Purpose:** Quick logging of strength workouts with tracking of exercises, sets, weight and reps; weight suggestions from past sessions.

---

## 2. Implemented Pages (Routes)

### 2.1 Home Page — Active Workout

**Route:** `/`  
**File:** `src/app/page.tsx`

**Purpose:** Create and manage the current workout session.

**Content:**
- Header "Active workout" / "Session builder" and date "Today"
- "Skip to main content" link for accessibility
- Loading state: spinner and text "Loading workout templates..." while templates load
- Empty state: "No workout templates available" when no templates exist
- Workout template selector (custom select)
- Accordion with exercises and sets (weight, reps)
- "Save workout" button (fixed at bottom of screen)
- Toast notifications for success/error (save, load, validation)

**Behavior:**
- On load, workout templates are fetched from the DB and exercises for the selected template are loaded
- When the template changes, exercises for that template are loaded
- For each exercise, weight hint (working/max from past workouts) is shown; loaded via Intersection Observer
- User can add/remove sets and change weight and reps; the last set cannot be removed (toast warning)
- Save creates a workout record for today with template and all exercises/sets; cooldown and validation before save

---

### 2.2 Workout History (Placeholder)

**Route:** `/workouts`  
**File:** `src/app/workouts/page.tsx`

**Current state:** Placeholder with text "Workout history". History view is not implemented.

**Planned (per TODO/scope):** View past workouts by date.

---

## 3. Implemented Functionality

### 3.1 Workout Management

| Feature | Description |
|--------|-------------|
| Template selection | List of templates from DB; on selection, template exercises load in order |
| Editing sets | Per exercise: weight (kg) and reps per set |
| Adding a set | "Add set" button; new set is prefilled with last weight/reps or hint from history |
| Removing a set | Remove button per set; last set cannot be removed (toast) |
| Saving workout | Single "Save workout" button; date = today; writes to DB: workout → exercises → sets |

### 3.2 Weight Hints

- For each exercise, when it enters view, data from past workouts is requested.
- Shown: **working weight** (most frequent) and **max weight** in format "working / max kg".
- When adding a new set, last weight and reps for that exercise are prefilled (if available).

### 3.3 Validation and Limits

- Limits: max exercises per workout, max sets per exercise, max weight/reps, exercise name length (constants in `lib/constants.ts`).
- Pre-save checks: at least one set with weight/reps; numeric and date validation.
- Validation errors are shown in toast as a list (exercise — set — message).

### 3.4 UX and Accessibility

- States: loading templates, empty template list, empty exercise list.
- Toasts for save success, load/save/validation errors.
- Custom select with keyboard navigation and ARIA attributes.
- "Skip to main content" link, aria-live for toasts and loading.

### 3.5 Security and Reliability

- Supabase URL without protocol is automatically normalized to `https://`.
- UUID, date, number validation; string sanitization (XSS); centralized Supabase error handling and validation error formatting.
- Security headers in `next.config.ts` (HSTS, X-Frame-Options, X-Content-Type-Options, etc.).

---

## 4. Database Tables (Supabase / PostgreSQL)

Schema is created by migration `0001_init.sql`. RLS is enabled for all tables with "allow all" policies (single-user MVP).

### 4.1 `workout_templates`

Workout templates (program name).

| Column | Type | Description |
|--------|-----|-------------|
| `id` | uuid, PK | Identifier |
| `name` | text, NOT NULL | Template name (e.g. "Full Body A") |
| `created_at` | timestamptz | Created at |

**Indexes:** None (small table).

---

### 4.2 `workout_template_exercises`

Exercises in a template; order by `sort_order`.

| Column | Type | Description |
|--------|-----|-------------|
| `id` | uuid, PK | Identifier |
| `template_id` | uuid, FK → workout_templates(id) ON DELETE CASCADE | Template |
| `name` | text, NOT NULL | Exercise name |
| `sort_order` | integer, NOT NULL | Order in template |
| `created_at` | timestamptz | Created at |

**Indexes:**
- `idx_workout_template_exercises_template_id` on `template_id`
- `idx_workout_template_exercises_sort_order` on `(template_id, sort_order)`

---

### 4.3 `workouts`

Actual workout sessions by date.

| Column | Type | Description |
|--------|-----|-------------|
| `id` | uuid, PK | Identifier |
| `date` | date, NOT NULL | Workout date |
| `template_id` | uuid, FK → workout_templates(id) ON DELETE SET NULL | Template (optional) |
| `created_at` | timestamptz | Created at |

**Index:** `idx_workouts_template_id` on `template_id`.

---

### 4.4 `exercises`

Exercises within a saved workout (from template or manual).

| Column | Type | Description |
|--------|-----|-------------|
| `id` | uuid, PK | Identifier |
| `workout_id` | uuid, FK → workouts(id) ON DELETE CASCADE | Workout |
| `template_exercise_id` | uuid, FK → workout_template_exercises(id) ON DELETE SET NULL | Template exercise (optional) |
| `name` | text, NOT NULL | Exercise name |
| `created_at` | timestamptz | Created at |

**Index:** `idx_exercises_template_exercise_id` on `template_exercise_id`.

---

### 4.5 `sets`

Sets: weight and reps for an exercise in a workout.

| Column | Type | Description |
|--------|-----|-------------|
| `id` | uuid, PK | Identifier |
| `exercise_id` | uuid, FK → exercises(id) ON DELETE CASCADE | Exercise in workout |
| `weight` | numeric, NOT NULL | Weight (kg) |
| `reps` | integer, NOT NULL | Rep count |
| `created_at` | timestamptz | Created at |

**Indexes:** None; access via `exercise_id` and `exercises` relation.

---

## 5. Seed Data

Added by migrations after `0001_init.sql`:

- **0003_seed_full_body_template.sql** — Template **"Full Body A"** with 9 exercises: Dumbbell Squat, Dumbbell Romanian Deadlift, Bent-Over Dumbbell Row, One-Arm Dumbbell Row (Bench Supported), Dumbbell Bench Press, Dumbbell Chest Fly, Dumbbell Lateral Raise, Dumbbell Bicep Curl, Overhead Dumbbell Triceps Extension (Standing).
- **0004_seed_full_body_short.sql** — Template **"Full Body - Short"** with 5 exercises: Dumbbell Romanian Deadlift, Bent-Over Dumbbell Row, Dumbbell Bench Press, Dumbbell Lateral Raise, Dumbbell Ab Crunch.

Inserts use `WHERE NOT EXISTS` so templates and exercises are not duplicated on re-run.

---

## 6. Table Relationships (Summary)

- `workout_templates` 1 — N `workout_template_exercises` (by `template_id`).
- `workouts` N — 1 `workout_templates` (by `template_id`, optional).
- `workouts` 1 — N `exercises` (by `workout_id`).
- `exercises` N — 1 `workout_template_exercises` (by `template_exercise_id`, optional).
- `exercises` 1 — N `sets` (by `exercise_id`).

---

## 7. Key Application Files

| Purpose | Path |
|---------|------|
| Home page | `src/app/page.tsx` |
| History page (placeholder) | `src/app/workouts/page.tsx` |
| Root layout, metadata | `src/app/layout.tsx` |
| Workout state, loading templates/exercises, save | `src/app/hooks/useWorkoutState.ts` |
| Toast notifications | `src/app/hooks/useToast.ts` |
| Business logic (validation, save) | `src/app/lib/services/workoutService.ts` |
| Loading templates and template exercises | `src/app/lib/repositories/workoutTemplateRepository.ts` |
| Saving workout to DB | `src/app/lib/repositories/workoutRepository.ts` |
| Weight hints from past sessions | `src/app/lib/getLastExerciseWeights.ts` |
| Supabase client, URL normalization | `src/app/lib/supabase.ts` |
| UI components | `src/app/components/` (ExerciseAccordion, SetRow, Select, WorkoutSelector, SaveWorkoutButton) |
| Migrations and seeds | `supabase/migrations/0001_init.sql`, `0003_*`, `0004_*` |

---

## 8. Not in Current Implementation

- Workout history view (page `/workouts` is a placeholder).
- Authentication and multi-user support.
- Analytics, charts, reports.
- PWA / offline mode (planned, see TODO.md).
- Dedicated loading spinner (planned; basic loading state exists on home).

Detailed MVP technical requirements are in `docs/TECHNICAL_REQUIREMENTS.md`.
