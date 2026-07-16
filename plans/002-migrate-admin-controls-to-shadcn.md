# Plan 002: Migrate admin controls to shadcn/ui primitives

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report - do not improvise. When done, update the status row for this plan in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
>
> ```bash
> git diff --stat a04273a..HEAD -- src/components/AdminPanel.tsx src/components/IqamahRedirect.tsx tests/admin.spec.ts tests/navigation.spec.ts tests/accessibility.spec.ts src/components/ui src/utils.ts
> git status --short -- src/components/AdminPanel.tsx src/components/IqamahRedirect.tsx tests/admin.spec.ts tests/navigation.spec.ts tests/accessibility.spec.ts src/components/ui src/utils.ts
> ```
>
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding. This repo had a dirty worktree at planning time, so preserve existing uncommitted user work and do not revert unrelated edits.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED - `AdminPanel.tsx` is large and user-facing, but the work can be verified with focused E2E checks.
- **Depends on**: `plans/001-establish-shadcn-foundation.md`
- **Category**: tech-debt
- **Planned at**: commit `a04273a`, 2026-07-04, with a dirty worktree

## Why This Matters

The admin page is the app's settings surface, but it currently hand-codes repeated tabs, inputs, cards, and buttons with raw Tailwind classes. This makes the design system hard to evolve because color, spacing, focus rings, disabled states, and accessibility behavior are duplicated across one large component. After Plan 001 creates local shadcn/ui primitives, this plan migrates the admin surface onto those primitives without changing prayer-time state, persistence, routes, or display-screen visuals.

## Current State

- `src/components/AdminPanel.tsx` is the large settings UI. It owns tab state, form state, save handlers, add/edit/delete handlers, and the entire rendered admin layout.
- `src/components/AdminPanel.tsx:283` renders the root with `data-testid="admin-panel"`. Tests rely on that selector.
- `src/components/AdminPanel.tsx:306-386` renders seven raw tab buttons with repeated `border-b-2 px-6 py-4 font-medium text-sm` classes.
- `src/components/AdminPanel.tsx:411-491`, `596-700`, `835-880`, `978-1132`, and `1185-1289` repeat raw input classes like `w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500`.
- `src/components/AdminPanel.tsx:499`, `524`, `565`, `712`, `804`, `892`, `1146`, and `1320` repeat raw emerald button classes.
- `src/components/IqamahRedirect.tsx:90-117` renders a modal-like overlay with raw divs and buttons. It is small enough to migrate once `Dialog` and `Button` exist.
- `tests/admin.spec.ts:4-32` verifies the admin panel loads.
- `tests/navigation.spec.ts:9-12` verifies `/admin` navigation and `data-testid="admin-panel"`.
- `tests/accessibility.spec.ts:39-50` performs a basic keyboard focus check on `/`.
- Existing style conventions:
  - TypeScript React components use named imports and `type React`.
  - Formatting uses tabs, double quotes, and no semicolons.
  - Imports use `~/*` in routes and tests, but many components use relative context imports. Either is acceptable; use `~/components/ui/...` for new shadcn imports for consistency with `components.json`.
  - Preserve Indonesian UI copy, e.g. `Pengaturan`, `Informasi Masjid`, `Waktu Iqamah`.

## Commands You Will Need

| Purpose            | Command                                                                                                            | Expected on success                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Prerequisite check | `test -f src/components/ui/button.tsx && test -f src/components/ui/tabs.tsx && test -f src/components/ui/card.tsx` | exit 0                                                               |
| Typecheck          | `nub run check-types`                                                                                              | exit 0, no TypeScript errors                                         |
| Lint + typecheck   | `nub run check`                                                                                                    | exit 0, Oxfmt/Oxlint/TypeScript report no required changes or errors |
| Unit tests         | `nub run test:unit`                                                                                                | exit 0, all Vitest tests pass                                        |
| Focused E2E        | `nub exec playwright test tests/admin.spec.ts tests/navigation.spec.ts`                                            | exit 0, all selected Playwright tests pass                           |

## Suggested Executor Toolkit

- Official shadcn Button docs: https://ui.shadcn.com/docs/components/radix/button
- Official shadcn Card docs: https://ui.shadcn.com/docs/components/radix/card
- Official shadcn Tabs docs: https://ui.shadcn.com/docs/components/radix/tabs
- Official shadcn Input docs: https://ui.shadcn.com/docs/components/radix/input

## Scope

**In scope**:

- `src/components/AdminPanel.tsx`
- `src/components/IqamahRedirect.tsx` only if Plan 001 generated `Dialog` and this file remains easy to migrate safely
- `tests/admin.spec.ts` only for selectors or accessibility assertions needed by this migration
- `tests/navigation.spec.ts` only if route/admin selectors need updates
- `tests/accessibility.spec.ts` only if a focused keyboard assertion needs to be made less brittle

**Out of scope**:

- `PrayerDisplay.tsx`, `PrayerTimes.tsx`, `QuranVerse.tsx`, `CommunityEvents.tsx`, `AnnouncementBanner.tsx`, and `IqamahCountdown.tsx`.
- Prayer context, Aladhan API logic, localStorage persistence, deployment config, router config, and generated `routeTree.gen.ts`.
- Adding authentication to admin.
- Running `shadcn migrate rtl`.
- Visual redesign beyond replacing primitives and preserving current layout intent.

## Git Workflow

- Branch suggestion: `advisor/002-admin-shadcn-primitives`.
- Commit message style in this repo is short conventional-ish messages such as `style: enforce single quotes and lowercase imports`, `fix loader`, and `test: use vite default port and improve test reliability`.
- Do not push or open a PR unless the operator explicitly instructs it.

## Steps

### Step 1: Confirm Plan 001 is complete

Run:

```bash
test -f src/components/ui/button.tsx
test -f src/components/ui/card.tsx
test -f src/components/ui/tabs.tsx
test -f src/components/ui/input.tsx
test -f src/components/ui/field.tsx
test -f src/components/ui/textarea.tsx
test -f src/components/ui/select.tsx
test -f src/utils.ts
nub run check
```

Expected: all commands exit 0.

### Step 2: Replace raw admin tabs with shadcn `Tabs`

In `src/components/AdminPanel.tsx`:

- Import `Tabs`, `TabsContent`, `TabsList`, and `TabsTrigger` from `~/components/ui/tabs`.
- Replace the raw tab container at `src/components/AdminPanel.tsx:306-389` with a controlled shadcn tabs structure:

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
	<TabsList className="h-auto flex-wrap justify-start">
		<TabsTrigger value="mosque">Informasi Masjid</TabsTrigger>
		<TabsTrigger value="announcements">Pengumuman</TabsTrigger>
		<TabsTrigger value="events">Acara Komunitas</TabsTrigger>
		<TabsTrigger value="verses">Ayat Al-Quran</TabsTrigger>
		<TabsTrigger value="prayer-settings">Pengaturan Shalat</TabsTrigger>
		<TabsTrigger value="iqamah">Waktu Iqamah</TabsTrigger>
		<TabsTrigger value="settings">Pengaturan</TabsTrigger>
	</TabsList>
	<TabsContent value="mosque">...</TabsContent>
	...
</Tabs>
```

- Move each existing `activeTab === "..."` content block into the matching `TabsContent`.
- Preserve all handlers, form state, labels, and button text.

**Verify**:

```bash
nub run check-types
```

Expected: exit 0.

### Step 3: Replace admin panels and section surfaces with shadcn `Card`

In `src/components/AdminPanel.tsx`:

- Import `Card`, `CardContent`, `CardDescription`, `CardHeader`, and `CardTitle` from `~/components/ui/card`.
- Replace generic white/gray section wrappers with `Card` and `CardContent`.
- For each tab, put the current `h2` title in `CardTitle`. Use `CardDescription` only where helper text already exists, such as the prayer settings explanatory copy.
- Keep the root page width and padding classes (`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8`) unless there is a direct conflict.

Do not change the display page's glass cards in this plan.

**Verify**:

```bash
nub run check-types
```

Expected: exit 0.

### Step 4: Replace buttons with shadcn `Button`

In `src/components/AdminPanel.tsx`:

- Import `Button` from `~/components/ui/button`.
- Replace raw `<button>` elements with `Button`.
- Use variants consistently:
  - primary save/add actions: default `Button` with existing icons.
  - cancel/secondary actions: `variant="outline"` or `variant="secondary"`.
  - edit icon-only actions: `variant="ghost" size="icon"` with an `aria-label`.
  - delete icon-only actions: `variant="ghost" size="icon"` plus `className="text-destructive hover:text-destructive"` or the generated destructive variant if available.
  - back navigation: `variant="ghost" size="icon"` with `aria-label="Kembali ke tampilan utama"`.
- Preserve `type="button"` on every non-submit action.
- Preserve existing click handlers exactly.

In `src/components/IqamahRedirect.tsx`, optionally replace the two raw action buttons with `Button` if the file remains simple after imports. Preserve `data-testid="iqamah-redirect"` and both click handlers.

**Verify**:

```bash
nub run check-types
```

Expected: exit 0.

### Step 5: Replace form controls with shadcn `Field`, `Input`, `Textarea`, and `Select`

In `src/components/AdminPanel.tsx`:

- Import `Field`, `FieldLabel`, and `FieldDescription` from `~/components/ui/field`.
- Import `Input` from `~/components/ui/input`.
- Import `Textarea` from `~/components/ui/textarea`.
- Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, and `SelectValue` from `~/components/ui/select` only for current `<select>` controls.
- For text/number inputs, replace the raw `<label>` + `<input>` pairs with:

```tsx
<Field>
	<FieldLabel htmlFor={nameId}>Nama Masjid</FieldLabel>
	<Input
		id={nameId}
		type="text"
		value={formData.name}
		onChange={(event) => setFormData({ ...formData, name: event.target.value })}
	/>
</Field>
```

- For multiline controls, use `Textarea`.
- For selects, keep the same value/onValueChange semantics. Convert string values to numbers only where the existing state type requires a number.
- Preserve all existing `useId()` IDs.
- Preserve Arabic text fields with `className="arabic-text text-right"` where the current UI requires RTL text entry.
- Preserve helper copy, such as the Iqamah interval explanations.

**Verify**:

```bash
nub run check-types
```

Expected: exit 0.

### Step 6: Add or tighten focused behavior tests only where useful

Prefer no test churn if existing tests still prove route behavior. If the migration changes accessible roles in useful ways, add focused tests in `tests/admin.spec.ts`:

- `/admin` loads and `[data-testid="admin-panel"]` is visible.
- A tab can be selected by accessible name, e.g. click `Waktu Iqamah` and assert the Iqamah interval inputs or explanatory text are visible.
- The back icon button has an accessible name.

Do not add brittle class-name assertions.

**Verify**:

```bash
nub exec playwright test tests/admin.spec.ts tests/navigation.spec.ts
```

Expected: exit 0.

### Step 7: Run final checks

Run:

```bash
nub run check
nub run test:unit
nub exec playwright test tests/admin.spec.ts tests/navigation.spec.ts
git status --short
```

Expected:

- `nub run check` exits 0.
- `nub run test:unit` exits 0.
- Focused Playwright specs exit 0.
- `git status --short` shows only intended modifications for this plan plus pre-existing dirty work. It must not show generated reports staged as source changes unless they were already dirty before this plan.

## Test Plan

- Existing unit tests should remain green because this plan must not alter context, service, or hook behavior.
- Focused Playwright checks should prove `/admin` still renders and navigation still reaches the admin page.
- If new admin tests are added, they should use accessible names and `data-testid`, not Tailwind class names.

## Done Criteria

All must hold:

- [ ] `AdminPanel.tsx` imports and uses shadcn `Tabs`, `Card`, `Button`, `Field`, `Input`, `Textarea`, and `Select` where applicable.
- [ ] Repeated raw tab classes at the old `AdminPanel.tsx:306-386` area are removed.
- [ ] Repeated raw input classes like `w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500` are removed from `AdminPanel.tsx`.
- [ ] Existing user-visible Indonesian copy is preserved.
- [ ] `[data-testid="admin-panel"]` remains on the admin root.
- [ ] `nub run check` exits 0.
- [ ] `nub run test:unit` exits 0.
- [ ] `nub exec playwright test tests/admin.spec.ts tests/navigation.spec.ts` exits 0.
- [ ] `plans/README.md` status row for Plan 002 is updated.

## STOP Conditions

Stop and report back if:

- Plan 001 is not complete.
- `AdminPanel.tsx` has been split or heavily rewritten since this plan was written and the cited blocks no longer exist.
- A shadcn component import requires touching route, context, service, or deployment files.
- Replacing controls changes form state shape or persistence semantics.
- Focused E2E tests fail twice after reasonable local fixes.
- You need to change authentication or add new admin protection logic to make tests pass.

## Maintenance Notes

- Keep generated UI primitives under `src/components/ui`; customize them locally only when the change benefits every use of that primitive.
- Keep app-specific one-off display treatments in app components until there is a repeated pattern worth promoting into the design system.
- Reviewers should focus on accessible names, preserved state updates, and absence of class-name test coupling.
