# Agent instructions

## Package manager

- Use NubJS 0.2.x with Node.js 26.3.1
- Install dependencies with `nub install`
- Keep `lock.yaml` in sync with `package.json`

## Commands

| Task                              | Command                |
| --------------------------------- | ---------------------- |
| Start Vite on port 5173           | `nub run dev`          |
| Build the web app                 | `nub run build`        |
| Preview the web build             | `nub run serve`        |
| Check formatting, lint, and types | `nub run check`        |
| Apply formatting and lint fixes   | `nub run check:fix`    |
| Run unit tests                    | `nub run test:unit`    |
| Run browser component tests       | `nub run test:browser` |
| Run Playwright end-to-end tests   | `nub run test:e2e`     |
| Run the full verification gate    | `nub run test`         |

## Architecture

- React 19 and TanStack Router power the web interface
- `src/routeTree.gen.ts` is generated; never edit it directly
- `src/contexts/PrayerContext.tsx` owns validated local state and exposes separate content and live-schedule contexts; the combined hook remains for admin composition
- `src/services/prayerService.ts` integrates with the Aladhan API
- Admin data is local to one browser profile; there is no remote admin backend or sync

## Routes

- `/`: mosque display
- `/admin`: local settings and content editor
- `/iqamah`: Iqamah countdown, with redirect outside the active window

## Tests

- Unit tests run in jsdom from services, hooks, contexts, and library modules
- Component tests run in headless Chromium from `src/components/**/*.test.tsx`
- Playwright tests in `tests/` run against local Vite on port 5173 in WebKit
- `BASE_URL` does not override the current Playwright configuration

## Conventions

- Use Oxfmt and Oxlint through the package scripts
- Follow tabs, double quotes, and no semicolons
- Preserve local-first behavior unless the task explicitly changes the product architecture
