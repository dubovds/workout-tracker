# Technical Requirements Specification (TRS)

**Project**

- Name: Personal Workout Tracker
- Type: Web application (MVP)
- Audience: Single user (personal use)
- Platform: Mobile-first Web (Phone / Tablet)

## 1. Purpose & Scope

### 1.1 Purpose

The purpose of this project is to develop a lightweight web application that allows a user to record strength workouts with detailed tracking of:

- exercises
- sets
- repetitions
- weight per set

The system must support quick input during training and easy review of past workouts.

### 1.2 Scope (MVP)

The MVP covers:

- workout creation
- exercise tracking
- set-level weight & reps
- workout history
- automatic weight suggestions based on previous sessions

Out of scope:

- authentication
- multi-user support
- analytics & charts
- AI features
- offline-first / PWA
- notifications

## 2. Definitions & Terminology

| Term            | Definition                                                  |
| --------------- | ----------------------------------------------------------- |
| Workout         | A training session performed on a specific date             |
| Exercise        | A physical exercise performed within a workout              |
| Set             | A single execution unit of an exercise with reps and weight |
| Dominant weight | The most frequently used weight within an exercise          |
| Max weight      | The highest weight used within an exercise                  |

## 3. Technology Stack

### 3.1 Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Client-side data fetching

### 3.2 Backend / Data

- Supabase (PostgreSQL)
- Supabase REST API / JS SDK
- Row Level Security (single-user model)

### 3.3 Automation (Post-MVP)

- n8n (backups, export, integrations)

## 4. Functional Requirements

### 4.1 Workout Management

**FR-01**  
The system shall allow creating a new workout with an automatically assigned date.

**FR-02**  
A workout shall contain one or more exercises.

**FR-03**  
The user shall be able to view a list of past workouts ordered by date (descending).

### 4.2 Exercise Management

**FR-04**  
The system shall display exercises as expandable (accordion-style) items.

**FR-05**  
Each exercise shall contain one or more sets.

**FR-06**  
Exercises are selected from a predefined list (hardcoded for MVP).

### 4.3 Set Management

**FR-07**  
Each set shall contain:

- weight (numeric)
- repetitions (integer)

**FR-08**  
Weight shall be defined per set, not per exercise.

**FR-09**  
The user shall be able to add and remove sets dynamically.

### 4.4 Weight Calculation Logic

**FR-10 — Dominant Weight**  
The dominant weight for an exercise is defined as the weight used in the highest number of sets.  
If multiple weights have equal frequency, the higher weight is selected.

**FR-11 — Maximum Weight**  
The maximum weight is defined as the highest weight used in any set of the exercise.

**FR-12 — Display Rule**  
In collapsed exercise view, the system shall display:

`<dominant weight> / <max weight>`

Example:

`10 / 15 kg`

**FR-13 — Default Weight**  
When starting a new workout, the default weight for a new set shall be the dominant weight from the previous workout for that exercise.

## 5. User Interface Requirements

### 5.1 General UI Principles

- single-page workflow
- mobile-first
- large touch targets
- minimal navigation
- no modal-heavy flows

### 5.2 Main Screen Layout

- workout template selector (dropdown)
- exercise list (accordion)
- expanded exercise → set editor
- sticky “Save Workout” action

### 5.3 Exercise Accordion States

Collapsed

▸ Dumbbell Bench Press 10 / 15 kg

Expanded

▾ Dumbbell Bench Press

[ 10 kg ] [ 10 reps ] [ ✕ ]  
[ 10 kg ] [ 9 reps ] [ ✕ ]  
[ 15 kg ] [ 6 reps ] [ ✕ ]

[ + Add set ]

## 6. Data Model (Supabase)

### 6.1 Table: workouts

| Field      | Type      | Notes        |
| ---------- | --------- | ------------ |
| id         | uuid      | PK           |
| date       | date      | Workout date |
| created_at | timestamp | Auto         |

### 6.2 Table: exercises

| Field      | Type      | Notes         |
| ---------- | --------- | ------------- |
| id         | uuid      | PK            |
| workout_id | uuid      | FK → workouts |
| name       | text      | Exercise name |
| created_at | timestamp | Auto          |

### 6.3 Table: sets

| Field       | Type      | Notes          |
| ----------- | --------- | -------------- |
| id          | uuid      | PK             |
| exercise_id | uuid      | FK → exercises |
| weight      | numeric   | Weight per set |
| reps        | int       | Repetitions    |
| created_at  | timestamp | Auto           |

## 7. Non-Functional Requirements

**NFR-01**  
The application must be usable on mobile devices with one hand.

**NFR-02**  
Time to add a new set should not exceed 3 seconds.

**NFR-03**  
All operations must be client-side without full page reloads.

## 8. Security & Access

- No authentication (single-user MVP)
- Supabase anon key
- RLS enabled for select/insert
- No public exposure of write access outside app

## 9. Project Structure (Frontend)

```
app/
├─ page.tsx // active workout
├─ workouts/page.tsx // history
├─ components/
│  ├─ WorkoutSelector.tsx
│  ├─ ExerciseAccordion.tsx
│  ├─ SetRow.tsx
│  └─ SaveWorkoutButton.tsx
└─ lib/
└─ supabase.ts
```

## 10. Acceptance Criteria (Definition of Done)

The MVP is considered complete when:

- a workout can be created and saved
- exercises can be expanded and edited
- each set supports individual weight input
- dominant and max weight are correctly calculated
- data persists in Supabase
- workout history is accessible
- the app is comfortably usable on a phone

## 11. Risks & Assumptions

- single-user assumption
- no auth / backup in MVP
- data integrity relies on Supabase availability

## 12. Post-MVP Extensions (Not Included)

- charts & progress analytics
- PWA / offline mode
- workout templates as entities
- Telegram / n8n integrations
- voice input
