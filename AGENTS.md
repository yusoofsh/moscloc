# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
bun dev                # Start dev server (localhost:3001)
bun build              # Production build → dist/
bun serve              # Preview production build
bun check-types        # TypeScript type checking
bun test               # Run Playwright tests
bun test:headed        # Tests with visible browser
bun test:ui            # Interactive test debugger
bun desktop:dev        # Tauri desktop dev
bun desktop:build      # Tauri desktop build
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
- **Linting**: Biome (tabs, double quotes, no semicolons)

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

Playwright tests in `/tests/`. Key test IDs: `prayer-times`, `current-time`, `quran-verse`, `islamic-calendar`, `admin-panel`, `iqamah-countdown`.

Run single test: `bun test tests/home.spec.ts`
