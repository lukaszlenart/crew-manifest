# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Crew Manifest

Character generator for the ALIEN RPG (OBCY), for a single Game Master. Browser-only, no backend.
Data lives in `localStorage`. UI in English and Polish.

## Commands

- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — typecheck + production build (`base: './'`, served from any folder)
- `npm run preview` — preview the production build
- `npm test` — Vitest, node environment; unit tests live next to source as `src/**/*.test.ts`
- `npx vitest run src/domain/validation.test.ts` — one file; add `-t "<name>"` for one test
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint + Prettier check (`npm run format` to fix)

Full check before committing: `npm run typecheck && npm test && npm run lint`. CI
(`.github/workflows/deploy.yml`) runs lint, test and build, then deploys every push to `main` to
GitHub Pages.

## Architecture

- `src/domain/` — `types.ts` (the `Character`, `Rules`, `Localized` types), `rules.ts` (rulebook
  data: `RULES_LIMITS`, careers, talents, assembled into `RULES`), `validation.ts` (returns
  `ValidationIssue[]`; any issue makes the character a draft — drafts are still saved), `derived.ts`.
- `src/generator/` — seeded `mulberry32` RNG and per-language random tables. `generateCharacter`
  is deterministic for a given seed; fields passed in `locked` are kept, which is how the UI
  section locks and `rerollSections` work. Career-dependent sections are re-rolled together.
- `src/storage/` — `CharacterRepository` interface, `LocalStorageRepo`, and `MemoryStorage` for
  tests. Every stored entry passes through `migrate()` → Zod `CharacterSchema` in `schema.ts`. A
  compile-time check there keeps the schema and the domain `Character` type in sync, so changing
  one requires changing the other. Invalid entries are skipped and kept, never deleted; unreadable
  data is copied to `crew-manifest/characters.corrupt` first. `backup.ts` handles JSON
  export/import (merge by id or replace all, with a rejection report).
- `src/i18n/` — `en.ts` defines the keys and the `Messages` type; `pl.ts` must match it. `useT()`
  for UI strings, `useLocalize()` for rulebook `Localized` values. Current language is a signal.
- `src/ui/` — Preact + `@preact/signals`. `store.ts` holds the app-wide signals and wraps every
  repository write (errors become a `storageError` banner, then the list reloads). `router.ts`
  is a hash router: `#/`, `#/new`, `#/edit/:id`, `#/sheet/:id`, `#/print/:ids`.
- `src/styles/` — plain CSS; `print.css` lays out A4, one character per page.
- `src/pwa/` — hand-written service worker `sw.js` for offline use. A plugin in `vite.config.ts`
  prepends the precache list (built + `public/` files) and a content-hashed cache name at build
  time; it is registered only in production builds. Manifest and icons live in `public/`.

Characters store career and talent **ids**, not text, so switching language translates the whole
sheet. Renaming an id in `rules.ts` turns existing characters into drafts.

## Conventions

- Domain logic (`domain/`, `generator/`, `storage/`) never imports from `ui/` (enforced by ESLint).
- Pure functions and tests for all logic. UI components stay thin.
- Do not add dependencies outside the stack (Vite, TS, Preact, @preact/signals, Zod, Vitest,
  ESLint, Prettier) without asking.
- Do not invent rulebook content. Leave `// TODO: uzupełnić z podręcznika` and list the TODOs in
  the summary. All numeric limits live in `RULES_LIMITS` in `src/domain/rules.ts`.
  `rules.test.ts` checks referential integrity and that the point budgets are reachable.
- No hard-coded UI text in components — only keys from `src/i18n/`. Code and commits in English.
