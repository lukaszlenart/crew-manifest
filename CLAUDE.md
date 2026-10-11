# Crew Manifest

Character generator for the ALIEN RPG (OBCY), for a single Game Master. Browser-only, no backend.
Data lives in `localStorage`. UI in English and Polish.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the production build
- `npm test` — Vitest (unit tests live next to source as `*.test.ts`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint + Prettier check (`npm run format` to fix)

## Layout

- `src/domain/` — types, rules data (`rules.ts`), validation, derived values
- `src/generator/` — seeded RNG, random tables, character generation
- `src/storage/` — repository interface, localStorage implementation, Zod schema, backup
- `src/i18n/` — typed EN/PL dictionaries (`en.ts` is the source of keys)
- `src/ui/` — Preact components (thin), hash router
- `src/styles/` — plain CSS, `print.css` for printing

## Conventions

- Work one stage at a time. After each stage run `npm run typecheck && npm test && npm run lint`
  and commit as `feat(etap-N): ...`.
- Domain logic (`domain/`, `generator/`, `storage/`) never imports from `ui/` (enforced by ESLint).
- Pure functions and tests for all logic. UI components stay thin.
- Do not add dependencies outside the stack (Vite, TS, Preact, @preact/signals, Zod, Vitest,
  ESLint, Prettier) without asking.
- Do not invent rulebook content. Leave `// TODO: uzupełnić z podręcznika` and list TODOs in the
  stage summary. All numeric limits live in `RULES` in `src/domain/rules.ts`.
- No hard-coded UI text in components — only keys from `src/i18n/`. Code and commits in English.
