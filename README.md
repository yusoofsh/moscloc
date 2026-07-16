# Moscloc

Moscloc is a local-first mosque information display for prayer times, announcements, events, Quran verses, and Iqamah countdowns. It runs as a Vite web app or inside a Tauri desktop window.

## Current capabilities

- Fetch prayer times and Hijri dates from the Aladhan API
- Display the current time, current prayer, next prayer, announcements, events, and Quran verses
- Configure mosque details, prayer calculation settings, content, and Iqamah intervals at `/admin`
- Open `/iqamah` during an active Adhan-to-Iqamah window and return to the main display outside that window
- Persist settings in the current browser profile or Tauri WebView with `localStorage`
- Render an Indonesian interface with Arabic Quran text

## Local-first scope

Moscloc has no application backend, account system, or remote administration service. Changes from `/admin` affect only the browser profile or Tauri app data on that device. They do not sync to other browsers, computers, or displays.

The Tauri app wraps the same frontend and uses the configuration under `tauri/`. Its data remains local to the desktop app's WebView storage.

Moscloc does not currently include an installable Progressive Web App (PWA), a theme selector, or locale switching. Those capabilities require separate implementation work.

## Requirements

- Node.js 26.3.1
- [NubJS](https://github.com/nubjs/nub) 0.2.x
- Rust toolchain and platform prerequisites for Tauri development

## Run the web app

Install dependencies, then start Vite:

```bash
nub install
nub run dev
```

Open these local routes:

| Page             | URL                            |
| ---------------- | ------------------------------ |
| Mosque display   | `http://localhost:5173/`       |
| Local admin      | `http://localhost:5173/admin`  |
| Iqamah countdown | `http://localhost:5173/iqamah` |

## Run the desktop app

Start the Tauri development app:

```bash
nub run desktop:dev
```

Build platform installers with:

```bash
nub run desktop:build
```

## Build and verify

| Task                                | Command                |
| ----------------------------------- | ---------------------- |
| Build the web app                   | `nub run build`        |
| Preview the web build               | `nub run serve`        |
| Check Oxfmt, Oxlint, and TypeScript | `nub run check`        |
| Apply Oxfmt and Oxlint fixes        | `nub run check:fix`    |
| Run unit tests                      | `nub run test:unit`    |
| Run browser component tests         | `nub run test:browser` |
| Run Playwright end-to-end tests     | `nub run test:e2e`     |
| Run every verification step         | `nub run test`         |

Install the Chromium and WebKit binaries before the browser test suites:

```bash
nub exec playwright install chromium webkit
```

See [`tests/README.md`](tests/README.md) for the test matrix and Playwright behavior.

## Architecture

| Path                                 | Responsibility                                         |
| ------------------------------------ | ------------------------------------------------------ |
| `src/contexts/PrayerContext.tsx`     | State, Aladhan refresh schedule, and local persistence |
| `src/services/prayerService.ts`      | Aladhan prayer-time API integration                    |
| `src/components/PrayerDisplay.tsx`   | Main mosque display                                    |
| `src/components/AdminPanel.tsx`      | Local settings and content editor                      |
| `src/components/IqamahCountdown.tsx` | Iqamah countdown display                               |
| `src/routes/`                        | TanStack Router file-based routes                      |
| `tauri/`                             | Tauri desktop wrapper                                  |

TanStack Router generates `src/routeTree.gen.ts`; do not edit that file directly.

## Default configuration

- Mosque: Masjid Darul Arqom, Malang, Indonesia
- Coordinates: `-8.0679373, 112.5988417`
- Time zone: `Asia/Jakarta`
- Prayer calculation method: Aladhan custom method `20`
- Juristic school: Shafi

## License

Moscloc is available under the [MIT License](LICENSE).
