# 📋 TODO / Future Tasks

## 🎯 Priority Tasks

### 1. Loading Spinner
- [ ] Add loading spinner while workout templates are being loaded
- [ ] Add loading spinner while exercises are being loaded
- [ ] Improve UX during data fetching operations
- **Location:** `src/app/hooks/useWorkoutState.ts` - already has `isLoading` state
- **Components to update:** `src/app/page.tsx`, `src/app/components/WorkoutSelector.tsx`

### 2. PWA (Progressive Web App)
- [ ] Add PWA manifest (`manifest.json`)
- [ ] Configure service worker for offline support
- [ ] Add app icons (various sizes for different devices)
- [ ] Enable "Add to Home Screen" functionality
- [ ] Test offline functionality
- [ ] Configure caching strategy for static assets
- **Files to create:**
  - `public/manifest.json`
  - `public/icons/` (various icon sizes)
  - `public/sw.js` or use Next.js PWA plugin
- **Next.js PWA plugin:** Consider using `next-pwa` package

## 📝 Notes

- Loading spinner: The `isLoading` state already exists in `useWorkoutState`, just need to add UI component
- PWA: Will require additional configuration in `next.config.ts` and possibly a service worker
