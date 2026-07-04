# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
nub run dev            # Start dev server (localhost:5173)
nub run build          # Production build -> dist/
nub run serve          # Preview production build
nub run check          # Format check, lint, and TypeScript checking
nub run check:fix      # Format and apply safe lint fixes
nub run check-types    # TypeScript type checking
nub run format         # Format with Oxfmt
nub run lint           # Lint with Oxlint
nub run test           # Run check, unit, browser, and Playwright tests
nub run test:headed    # Tests with visible browser
nub run test:ui        # Interactive test debugger
nub run desktop:dev    # Tauri desktop dev
nub run desktop:build  # Tauri desktop build
```

## Architecture

**Mosque management app** - React 19 + TanStack Router + Tauri for prayer times, events, announcements, and Iqamah countdown.

### Stack

- **Routing**: TanStack Router (file-based) - routes auto-generated to `src/routeTree.gen.ts` (never edit)
- **State**: React Context (`PrayerContext`) + localStorage persistence
- **Styling**: Tailwind CSS v4
- **Forms**: TanStack Form + Zod validation
- **API**: Aladhan.com for prayer times and Hijri dates
- **Desktop**: Tauri v2
- **Linting/formatting**: Oxlint + Oxfmt (tabs, double quotes, no semicolons)

### Routes

- `/` → `PrayerDisplay` (main display)
- `/admin` → `AdminPanel` (settings)
- `/iqamah` → `IqamahCountdown` (countdown timer)

### Key Files

- `src/contexts/PrayerContext.tsx` - Central state: mosque info, prayer times, events, verses, iqamah intervals
- `src/services/prayerService.ts` - Aladhan API integration
- `src/routes/__root.tsx` - Root layout with `PrayerProvider`
- `src/components/AdminPanel.tsx` - Settings UI (largest component)

### Data Flow

1. `PrayerContext` fetches prayer times from Aladhan API on mount + daily at midnight
2. Current/next prayer updated every minute
3. All settings persisted to localStorage
4. Components consume via `usePrayerContext()` hook

### Defaults

- Location: Malang, Indonesia (-8.0679373, 112.5988417)
- Timezone: Asia/Jakarta
- Prayer method: 20 (Custom)

## Testing

Vitest unit/browser tests live under `src/`; Playwright E2E tests live under `/tests/`. Key test IDs: `prayer-times`, `current-time`, `quran-verse`, `islamic-calendar`, `admin-panel`, `iqamah-countdown`.

Run single test: `nub exec playwright test tests/home.spec.ts`
