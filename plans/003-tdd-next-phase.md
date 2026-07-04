# Plan 003: TDD next phase and coverage ratchet

> **Executor instructions**: Use RED/GREEN/REFACTOR for every behavior change. Run the focused test listed in each step before broad verification. Preserve existing dirty work and do not lower coverage thresholds to hide missing tests.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED - touches admin behavior, time-based iqamah logic, component tests, and E2E coverage.
- **Depends on**: `plans/001-establish-shadcn-foundation.md`, `plans/002-migrate-admin-controls-to-shadcn.md`
- **Category**: testing
- **Planned at**: current dirty worktree on 2026-07-04
- **Status**: DONE

## Why This Matters

The app now has separate gates for unit, browser component, Playwright E2E, and explicit coverage. The next phase should make those gates useful by adding behavior-first tests around the risky surfaces instead of chasing artificial 100% coverage.

## Current Gates

| Gate              | Command                                   | Expected                          |
| ----------------- | ----------------------------------------- | --------------------------------- |
| Unit              | `nub run test:unit`                       | Vitest unit tests pass            |
| Browser component | `nub run test:browser`                    | Vitest Browser Mode tests pass    |
| E2E               | `nub run test:e2e`                        | Playwright tests pass             |
| Full local gate   | `nub run test`                            | check + unit + browser + e2e pass |
| Coverage          | `nub run test:coverage -- --reporter=dot` | coverage thresholds pass          |

## TDD Rules

- Write a failing test before changing behavior.
- Bug fixes must start with a reproduction test.
- Prefer unit tests for pure logic and time calculations.
- Use Vitest Browser Mode for React rendering and form interaction.
- Use Playwright only for critical full-page journeys.
- Raise coverage thresholds only after useful tests raise the verified floor.

## Phase 1: AdminPanel helper extraction and behavior coverage

Target file: `src/components/AdminPanel.tsx`.

1. Add unit tests for admin helper logic:
   - trim announcement input
   - reject blank announcements
   - validate mosque coordinates as finite numbers
   - validate iqamah intervals as whole minutes from 1 to 60
2. Extract pure helpers into a small module.
3. Wire AdminPanel saves through the helpers.
4. Add browser component coverage for:
   - mosque info save
   - iqamah interval save
   - accessible tab switching

Focused verification:

```bash
nub run test:unit -- --reporter=dot src/components/AdminPanel.logic.test.ts
nub run test:browser -- --reporter=dot src/components/AdminPanel.test.tsx
```

## Phase 2: Iqamah state machine

Target files: `src/components/IqamahCountdown.tsx`, `src/components/IqamahRedirect.tsx`.

1. Extract shared iqamah schedule/state calculations.
2. Cover before-adzan, active countdown, iqamah-now, after-iqamah, invalid prayer name, and after-Isya/midnight boundaries.
3. Keep route behavior covered by existing Playwright checks.

Focused verification:

```bash
nub run test:unit -- --reporter=dot src/components/iqamahLogic.test.ts
nub run test:browser -- --reporter=dot src/components/IqamahCountdown.test.tsx
```

## Phase 3: Home display composition

Target file: `src/components/PrayerDisplay.tsx`.

1. Add browser component tests for the main landmark, mosque info, prayer times, announcement banner, Quran verse, events card, and skip control.
2. Keep the visual display custom; do not force shadcn cards into the TV-style UI.

Focused verification:

```bash
nub run test:browser -- --reporter=dot src/components/PrayerDisplay.test.tsx
```

## Phase 4: Persistence and network resilience

Target files: `src/contexts/PrayerContext.tsx`, `tests/network.spec.ts`.

1. Add unit tests for loading saved context from localStorage.
2. Keep Playwright network tests for real page behavior only.
3. Avoid reading or printing sensitive browser storage; assert only app-owned public values.

Focused verification:

```bash
nub run test:unit -- --reporter=dot src/contexts/PrayerContext.test.tsx
nub exec playwright test tests/network.spec.ts --reporter=line
```

## Phase 5: Accessibility regression coverage

Target files: `src/components/PrayerDisplay.tsx`, `tests/accessibility.spec.ts`.

1. Keep keyboard navigation deterministic.
2. Assert accessible names on admin icon buttons and skip control.
3. Do not rely on timing-only Tab tests.

Focused verification:

```bash
nub exec playwright test tests/accessibility.spec.ts tests/admin.spec.ts --reporter=line
```

## Coverage Ratchet

| Milestone              | Statement Floor |
| ---------------------- | --------------: |
| Current verified floor |              23 |
| After Phase 1          |              30 |
| After Phase 2          |              40 |
| After Phase 3          |              50 |
| Mature target          |             80+ |

Only raise a threshold after `nub run test:coverage -- --reporter=dot` proves the new floor.

## Definition Of Done

- Every new behavior has a test.
- Focused tests pass for the changed surface.
- `nub run test` passes.
- `nub run test:coverage -- --reporter=dot` passes.
- Generated report artifacts are not left dirty.
- Coverage thresholds were raised only when supported by evidence.
