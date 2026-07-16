# Test Moscloc

Moscloc uses Vitest for unit and browser component tests, plus Playwright for end-to-end tests. The full test command runs formatting, lint, type checking, and all three test layers.

## Install browser binaries

The component suite needs Chromium. The end-to-end suite needs WebKit.

```bash
nub exec playwright install chromium webkit
```

## Test matrix

| Layer      | Command                | Environment            | Scope                                          |
| ---------- | ---------------------- | ---------------------- | ---------------------------------------------- |
| Quality    | `nub run check`        | Node.js                | Oxfmt check, Oxlint, and TypeScript            |
| Unit       | `nub run test:unit`    | jsdom                  | Services, hooks, contexts, and library modules |
| Component  | `nub run test:browser` | Headless Chromium      | `src/components/**/*.test.tsx`                 |
| End-to-end | `nub run test:e2e`     | Desktop WebKit         | `tests/*.spec.ts` against local Vite           |
| Full gate  | `nub run test`         | All environments above | Quality, unit, component, then end-to-end      |

Watch unit or component tests during development:

```bash
nub run test:unit:watch
nub run test:browser:watch
```

## Run end-to-end tests

Playwright starts `nub run dev` and waits for `http://localhost:5173`. It reuses an existing server outside continuous integration (CI) and starts a fresh server in CI.

```bash
nub run test:e2e
```

Use these commands for focused or interactive runs:

```bash
nub exec playwright test tests/home.spec.ts
nub run test:headed
nub run test:ui
nub run test:report
```

The current `playwright.config.ts` defines only the `webkit` project. Browser names such as `chromium`, `firefox`, and mobile projects are not available through `--project` unless the configuration adds them.

## Base URL behavior

`playwright.config.ts` fixes both `use.baseURL` and the development server URL to `http://localhost:5173`. Setting `BASE_URL` does not change the target. Remote staging or production smoke tests require a separate Playwright configuration change.

## End-to-end coverage

| File                          | Coverage                                                            |
| ----------------------------- | ------------------------------------------------------------------- |
| `tests/home.spec.ts`          | Main display content and responsive viewport                        |
| `tests/admin.spec.ts`         | Admin rendering, local persistence, tabs, and event controls        |
| `tests/iqamah.spec.ts`        | Iqamah display and redirect behavior                                |
| `tests/navigation.spec.ts`    | Route navigation and unknown paths                                  |
| `tests/accessibility.spec.ts` | Basic headings, image alternatives, visibility, and keyboard checks |
| `tests/integration.spec.ts`   | Display integration, viewports, and prayer-time rendering           |
| `tests/network.spec.ts`       | Aladhan failures, delayed responses, reloads, and persisted state   |
| `tests/utils.ts`              | Shared selectors and helpers                                        |

The network suite does not prove service-worker caching or full offline support. Its reload test confirms that the display remains available and local state persists.

## Reports and traces

Playwright writes an HTML report after end-to-end runs. It records a trace on the first retry; retries occur only in CI. Screenshots and videos are not enabled in the current configuration.

Open the latest HTML report with:

```bash
nub run test:report
```

## Add an end-to-end test

Use Playwright locators that match the accessible interface or stable `data-testid` attributes:

```typescript
import { expect, test } from "@playwright/test"

test("shows the prayer schedule", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByTestId("prayer-times")).toBeVisible()
})
```

Keep local storage behavior in mind: one Playwright browser context shares state across pages in that context, but a new context starts with separate storage.
