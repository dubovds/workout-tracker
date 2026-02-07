# Workout Tracker

A professional workout tracking application built with Next.js 16, React 19, TypeScript, and Supabase.

## 🚀 Quick Start

### Requirements

- Node.js 20+
- npm, yarn, pnpm or bun
- Supabase project (or local Supabase)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd workout-tracker

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional (recommended for single-user deployed mode):

```env
SITE_USERNAME=admin
SITE_PASSWORD=your_strong_password
```

When `SITE_PASSWORD` is set, the app is protected by HTTP Basic Auth.

### Database Migrations

```bash
# Apply migrations via Supabase CLI
supabase db push

# Or manually via Supabase Dashboard:
# 1. Open SQL Editor
# 2. Run files from supabase/migrations/ in order:
#    - 0001_init.sql
#    - 0003_seed_full_body_template.sql
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/app/
├── components/          # React components
│   ├── ExerciseAccordion.tsx
│   ├── Select.tsx
│   ├── SetRow.tsx
│   ├── SaveWorkoutButton.tsx
│   └── WorkoutSelector.tsx
├── hooks/              # Custom React hooks
│   ├── useToast.ts
│   └── useWorkoutState.ts
├── lib/
│   ├── constants.ts           # App constants
│   ├── repositories/          # Data access layer
│   │   ├── workoutRepository.ts
│   │   └── workoutTemplateRepository.ts
│   ├── services/              # Business logic
│   │   └── workoutService.ts
│   ├── types/                 # TypeScript types
│   │   ├── common.ts
│   │   └── workout.ts
│   ├── utils/                 # Utilities
│   │   ├── errorHandler.ts
│   │   ├── formatValidationErrors.ts
│   │   ├── supabaseErrorHandler.ts
│   │   └── validation.ts
│   ├── getLastExerciseWeights.ts
│   └── supabase.ts
└── page.tsx                   # Home page
```

## 🏗️ Architecture

The project follows the **Service Layer Pattern**:

- **Components** — UI components, rendering only
- **Hooks** — State management and side effects
- **Services** — Business logic and validation
- **Repositories** — Data access (Supabase)

## 🔒 Security

- ✅ Input validation
- ✅ String sanitization to prevent XSS
- ✅ HTTP Security Headers configured
- ✅ Rate limiting on critical operations
- ✅ Safe error handling (no information leakage)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript 5
- **Database:** Supabase (PostgreSQL)
- **Validation:** Custom validation utilities
- **Code Quality:** ESLint, Prettier

## 📝 Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run linter
- `npm run format` — Format code

## 🚀 Deployment

### Vercel (recommended)

1. Connect the repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon/Public key from Supabase
   - `SITE_USERNAME` — Basic Auth username (optional, default: `admin`)
   - `SITE_PASSWORD` — Basic Auth password (recommended for private single-user use)
3. **Important:** Apply database migrations in Supabase Dashboard (SQL Editor):
   - Run `supabase/migrations/0001_init.sql`
   - Run `supabase/migrations/0003_seed_full_body_template.sql`
4. Deployment will run automatically

**If you run into issues after deployment:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Other platforms

The app is ready to deploy on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted (Docker)

## 📊 Database

The database schema includes:

- `workouts` — Workout sessions
- `exercises` — Exercises
- `sets` — Sets
- `workout_templates` — Workout templates
- `workout_template_exercises` — Exercises in templates

All tables are protected with Row Level Security (RLS).

## 🧪 Testing

```bash
# TODO: Add tests
npm run test
```

## 📋 Future Tasks

See [TODO.md](./TODO.md) for planned improvements:
- Loading spinner
- PWA (Progressive Web App) implementation

## 📄 License

Private project
