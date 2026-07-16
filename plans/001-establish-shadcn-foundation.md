# Plan 001: Establish the latest shadcn/ui foundation

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report - do not improvise. When done, update the status row for this plan in `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
>
> ```bash
> git diff --stat a04273a..HEAD -- components.json package.json lock.yaml src/index.css src/components src/utils.ts
> git status --short -- components.json package.json lock.yaml src/index.css src/components src/utils.ts
> ```
>
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding. This repo had a dirty worktree at planning time, so preserve existing uncommitted user work and do not revert unrelated edits.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED - package manager, generated components, Tailwind tokens, and import paths all meet here.
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `a04273a`, 2026-07-04, with a dirty worktree

## Why This Matters

The repo has `components.json` and shadcn-style theme tokens, but it does not yet have a real local shadcn/ui primitive layer. The current `components.json` maps `ui` to `~/components`, so a future `shadcn add button` can put generated primitives beside app-specific files such as `AdminPanel.tsx` and `PrayerTimes.tsx`. It also maps `lib` and `utils` to `~/utils`, but there is no `src/utils.ts` file exporting `cn`, so generated components would not have a stable utility import.

This plan creates a current shadcn/ui foundation while respecting the repo's established package manager, alias style, and Tailwind v4 setup.

## Current State

- `package.json` uses `nub@0.2.10` and Node `26.3.1`; scripts include `check`, `check-types`, `test`, `test:unit`, and `test:e2e`.
- `lock.yaml` is the active lockfile. Do not create `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, or `bun.lockb`.
- `components.json:1-20` already uses `style: "new-york"`, `rsc: false`, `tsx: true`, Tailwind v4-style blank config, CSS variables, and lucide icons.
- `components.json:13-19` currently maps:

```json
"aliases": {
	"hooks": "~/hooks",
	"components": "~/components",
	"ui": "~/components",
	"lib": "~/utils",
	"utils": "~/utils"
}
```

- `src/index.css:1-98` imports Tailwind and `tw-animate-css`, defines shadcn-like tokens, and uses `@custom-variant dark (&:where(.dark, .dark *));`, but it does not import `shadcn/tailwind.css` and does not define a `.dark` token block.
- `src/components/ui` does not exist.
- `src/utils.ts` does not exist.
- `package.json:29-47` already includes `class-variance-authority`, `clsx`, `lucide-react`, `radix-ui`, `sonner`, `tailwind-merge`, and `tw-animate-css`, but not `shadcn`.
- Official docs checked during planning:
  - shadcn CLI says `init` installs dependencies, adds the `cn` util, and configures CSS variables: https://ui.shadcn.com/docs/cli
  - shadcn CLI says `add` adds components and dependencies and supports `--dry-run`: https://ui.shadcn.com/docs/cli
  - shadcn Vite docs use a TS path alias for source imports and then run the shadcn CLI: https://ui.shadcn.com/docs/installation/vite
  - shadcn `components.json` docs say Tailwind v4 should leave `tailwind.config` blank and aliases tell the CLI where to place `components`, `ui`, `lib`, `hooks`, and `utils`: https://ui.shadcn.com/docs/components-json
  - shadcn theming docs recommend CSS variables and show `@import "shadcn/tailwind.css"` plus `@theme inline` tokens: https://ui.shadcn.com/docs/theming

## Commands You Will Need

| Purpose               | Command                     | Expected on success                                                           |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Package manager check | `nub --version`             | Prints `nub 0.2.10` or newer compatible 0.2.x                                 |
| Add shadcn package    | `nub add shadcn@latest`     | exit 0, updates `package.json` and `lock.yaml`, creates no competing lockfile |
| shadcn CLI version    | `nub exec shadcn --version` | exit 0, prints `4.13.0` or newer                                              |
| shadcn project info   | `nub exec shadcn info`      | exit 0, no alias or Tailwind errors                                           |
| Typecheck             | `nub run check-types`       | exit 0, no TypeScript errors                                                  |
| Lint + typecheck      | `nub run check`             | exit 0, Oxfmt/Oxlint/TypeScript report no required changes or errors          |
| Unit tests            | `nub run test:unit`         | exit 0, all Vitest tests pass                                                 |

## Suggested Executor Toolkit

- Use official shadcn docs as the source of truth:
  - https://ui.shadcn.com/docs/cli
  - https://ui.shadcn.com/docs/components-json
  - https://ui.shadcn.com/docs/theming
  - https://ui.shadcn.com/docs/installation/vite
- If the available shadcn version is newer than `4.13.0`, use the newer CLI's current docs but keep this repo's constraints: Nub package manager, `lock.yaml`, Tailwind v4, `~/*` alias, `rsc: false`, and no competing lockfiles.

## Scope

**In scope**:

- `package.json`
- `lock.yaml`
- `components.json`
- `src/index.css`
- `src/utils.ts` (create)
- `src/components/ui/*` generated by shadcn

**Out of scope**:

- Rewriting app components such as `AdminPanel.tsx`, `PrayerTimes.tsx`, or `PrayerDisplay.tsx`. That is Plan 002.
- Running `shadcn migrate rtl`.
- Changing the package manager from Nub.
- Creating or committing generated Playwright reports.
- Changing routes, context state, prayer APIs, or deployment configuration.

## Git Workflow

- Branch suggestion: `advisor/001-shadcn-foundation`.
- Commit message style in this repo is short conventional-ish messages such as `test: use vite default port and improve test reliability`, `chore: add vitest testing framework with browser and component support`, and `fix loader`.
- Do not push or open a PR unless the operator explicitly instructs it.

## Steps

### Step 1: Confirm the shadcn CLI can inspect this repo without writing

Run:

```bash
nub --version
nub dlx shadcn@latest info
```

Expected:

- `nub --version` prints `nub 0.2.10` or newer compatible 0.2.x.
- `nub dlx shadcn@latest info` exits 0 or reports only the known missing local UI/utility foundation. It must not create a competing lockfile.

If `nub dlx shadcn@latest info` creates `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, or `bun.lockb`, remove only that newly-created competing lockfile and STOP. Do not continue.

**Verify**:

```bash
git status --short -- package-lock.json pnpm-lock.yaml yarn.lock bun.lock bun.lockb
```

Expected: no output.

### Step 2: Fix `components.json` aliases before generating UI files

Edit only the alias block in `components.json`:

```json
"aliases": {
	"hooks": "~/hooks",
	"components": "~/components",
	"ui": "~/components/ui",
	"lib": "~/utils",
	"utils": "~/utils"
}
```

Keep:

- `"style": "new-york"`
- `"rsc": false`
- `"tailwind.config": ""`
- `"tailwind.css": "src/index.css"`
- `"tailwind.cssVariables": true`
- `"iconLibrary": "lucide"`

Do not switch to `@/*`; this repo already uses `~/*` in `tsconfig.json` and `vite.config.ts`.

**Verify**:

```bash
nub run check-types
```

Expected: exit 0.

### Step 3: Add the runtime shadcn package with Nub

Run:

```bash
nub add shadcn@latest
nub exec shadcn --version
```

Expected:

- `package.json` now contains `shadcn`.
- `lock.yaml` is updated.
- `nub exec shadcn --version` prints `4.13.0` or newer.
- No competing lockfile is created.

**Verify**:

```bash
rg -n '"shadcn"' package.json lock.yaml
git status --short -- package-lock.json pnpm-lock.yaml yarn.lock bun.lock bun.lockb
```

Expected:

- `rg` prints at least one `package.json` match and lockfile entries.
- The lockfile status command prints no output.

### Step 4: Update global CSS to match current shadcn Tailwind v4 theming

Edit `src/index.css` carefully. Preserve the app-specific Amiri font import, `.animate-scroll`, custom scrollbar, `.display-screen`, and `.arabic-text` rules.

Required changes:

- Add `@import "shadcn/tailwind.css";` after `@import "tw-animate-css";`.
- Change the dark custom variant to the current shadcn shape:

```css
@custom-variant dark (&:is(.dark *));
```

- Keep the app font token, but make it an additive theme block. Do not delete the app's `--font-sans`.
- Update `@theme inline` radius tokens to include the current shadcn scale:

```css
--radius-sm: calc(var(--radius) * 0.6);
--radius-md: calc(var(--radius) * 0.8);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) * 1.4);
--radius-2xl: calc(var(--radius) * 1.8);
--radius-3xl: calc(var(--radius) * 2.2);
--radius-4xl: calc(var(--radius) * 2.6);
```

- Add a `.dark` token block using the current shadcn neutral dark defaults from https://ui.shadcn.com/docs/theming.
- Keep `@layer base` with `* { @apply border-border outline-ring/50; }` and `body { @apply bg-background text-foreground; }`.

**Verify**:

```bash
nub run check
```

Expected: exit 0, no Oxfmt, Oxlint, or TypeScript errors.

### Step 5: Add the first local UI primitives with the shadcn CLI

Run a dry-run first:

```bash
nub exec shadcn add button card tabs input field textarea select dialog sonner --dry-run
```

Expected:

- Dry-run output shows files under `src/components/ui`.
- It does not propose overwriting app components directly under `src/components`.
- It does not propose competing lockfiles.

Then run:

```bash
nub exec shadcn add button card tabs input field textarea select dialog sonner -y
```

Expected:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/field.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sonner.tsx`
- `src/utils.ts` exports a `cn` helper, or the CLI creates an equivalent file matching `components.json` aliases.

If the CLI creates `src/lib/utils.ts` instead of `src/utils.ts`, do not leave both utility locations active. Either adjust `components.json` to the generated path and add a matching `~/*` import path if needed, or move the generated helper to `src/utils.ts` and update generated imports. Prefer the smallest change that keeps `nub run check` green.

**Verify**:

```bash
find src/components/ui -maxdepth 1 -type f | sort
rg -n 'export .*cn|function cn|const cn' src/utils.ts src/lib/utils.ts 2>/dev/null || true
nub run check
```

Expected:

- The expected UI files exist under `src/components/ui`.
- Exactly one utility module exports `cn`.
- `nub run check` exits 0.

### Step 6: Verify package-manager hygiene and tests

Run:

```bash
git status --short
nub run test:unit
```

Expected:

- `git status --short` shows only intentional source/config/package/lock changes plus pre-existing dirty files from before this plan. It must not show new competing lockfiles.
- `nub run test:unit` exits 0.

## Test Plan

- No app behavior should change in this plan.
- The generated primitives compile through `nub run check`.
- Existing unit tests must still pass with `nub run test:unit`.
- Plan 002 will perform focused admin E2E verification after consuming the primitives.

## Done Criteria

All must hold:

- [ ] `components.json` maps `"ui"` to `"~/components/ui"`.
- [ ] `package.json` and `lock.yaml` include `shadcn`.
- [ ] `src/index.css` imports `shadcn/tailwind.css`, keeps app custom CSS, and includes light plus dark shadcn theme tokens.
- [ ] `src/components/ui` contains the generated primitives listed in Step 5.
- [ ] Exactly one `cn` utility exists and generated components import it successfully.
- [ ] No competing lockfiles exist.
- [ ] `nub run check` exits 0.
- [ ] `nub run test:unit` exits 0.
- [ ] `plans/README.md` status row for Plan 001 is updated.

## STOP Conditions

Stop and report back if:

- `shadcn` CLI cannot run under Nub without creating a competing lockfile.
- The CLI proposes writing generated primitives outside `src/components/ui`.
- `src/index.css` has materially drifted from the excerpts above and the token merge is no longer straightforward.
- `nub run check` fails twice after reasonable local fixes.
- You need to touch app behavior files such as `AdminPanel.tsx`, `PrayerTimes.tsx`, `PrayerContext.tsx`, routes, or deployment configuration.

## Maintenance Notes

- Future generated shadcn components should live under `src/components/ui`.
- App-specific display components may continue using custom Tailwind classes where the mosque display needs TV-style immersive surfaces.
- Reviewers should inspect `src/index.css` carefully: do not let shadcn defaults erase the app's Amiri Arabic font and display utilities.
