# Workout Tracker

Профессиональное приложение для отслеживания тренировок, построенное на Next.js 16, React 19, TypeScript и Supabase.

## 🚀 Быстрый старт

### Требования

- Node.js 20+
- npm, yarn, pnpm или bun
- Supabase проект (или локальный Supabase)

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd workout-tracker

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env.local
# Заполнить SUPABASE_URL и SUPABASE_ANON_KEY
```

### Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Запуск миграций базы данных

```bash
# Применить миграции через Supabase CLI
supabase db push

# Или вручную через Supabase Dashboard:
# 1. Откройте SQL Editor
# 2. Выполните файлы из supabase/migrations/ в порядке:
#    - 0001_init.sql
#    - 0003_seed_full_body_template.sql
```

### Разработка

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### Сборка для продакшена

```bash
npm run build
npm start
```

## 📁 Структура проекта

```
src/app/
├── components/          # React компоненты
│   ├── ExerciseAccordion.tsx
│   ├── Select.tsx
│   ├── SetRow.tsx
│   ├── SaveWorkoutButton.tsx
│   └── WorkoutSelector.tsx
├── hooks/              # Кастомные React хуки
│   ├── useToast.ts
│   └── useWorkoutState.ts
├── lib/
│   ├── constants.ts           # Константы приложения
│   ├── repositories/          # Слой доступа к данным
│   │   ├── workoutRepository.ts
│   │   └── workoutTemplateRepository.ts
│   ├── services/              # Бизнес-логика
│   │   └── workoutService.ts
│   ├── types/                 # TypeScript типы
│   │   ├── common.ts
│   │   └── workout.ts
│   ├── utils/                 # Утилиты
│   │   ├── errorHandler.ts
│   │   ├── formatValidationErrors.ts
│   │   ├── supabaseErrorHandler.ts
│   │   └── validation.ts
│   ├── getLastExerciseWeights.ts
│   └── supabase.ts
└── page.tsx                   # Главная страница
```

## 🏗️ Архитектура

Проект следует **Service Layer Pattern**:

- **Components** - UI компоненты, только рендеринг
- **Hooks** - Управление состоянием и side effects
- **Services** - Бизнес-логика и валидация
- **Repositories** - Доступ к данным (Supabase)

## 🔒 Безопасность

- ✅ Валидация всех входных данных
- ✅ Санитизация строк для предотвращения XSS
- ✅ HTTP Security Headers настроены
- ✅ Rate limiting на критичные операции
- ✅ Безопасная обработка ошибок (без утечки информации)

## 🛠️ Технологии

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript 5
- **Database:** Supabase (PostgreSQL)
- **Validation:** Custom validation utilities
- **Code Quality:** ESLint, Prettier

## 📝 Скрипты

- `npm run dev` - Запуск dev сервера
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск production сервера
- `npm run lint` - Проверка кода линтером
- `npm run format` - Форматирование кода

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Деплой произойдет автоматически

### Другие платформы

Приложение готово к деплою на любую платформу, поддерживающую Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted (Docker)

## 📊 База данных

Схема базы данных включает:

- `workouts` - Тренировки
- `exercises` - Упражнения
- `sets` - Подходы
- `workout_templates` - Шаблоны тренировок
- `workout_template_exercises` - Упражнения в шаблонах

Все таблицы защищены Row Level Security (RLS).

## 🧪 Тестирование

```bash
# TODO: Добавить тесты
npm run test
```

## 📄 Лицензия

Private project
