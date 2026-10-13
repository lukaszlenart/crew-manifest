# Tests tab — design

Request: a new tab with the most common tests (supply, panic, and similar), excluding combat, which
gets its own tab later.

## Goal

- A **Tests** tab is a reference for the GM at the table: which roll to make, when, what success
  and failure do, and the rulebook page, in the current language.
- A short **How a test works** primer sits at the top, so pushing and stress dice need no page
  flipping.
- Reference only: no dice roller, no link to characters. `Character`, the schema, validation and
  the generator are unchanged.

## Scope decisions

- **Text in our own words.** Every entry, primer section and table row is written in our own words
  in PL and EN, never copied from the rulebook. The source is the Polish rulebook; no extracts are
  committed.
- **English names.** Where no official 2019 English name can be confirmed, use a descriptive name
  and add it to issue #31.
- **Out of scope:** combat, damage and critical injuries (pp. 80–99 except the Survival test),
  explosions (p. 108, blast power belongs with combat), vehicle combat, links from the sheet or
  talents to tests, printing this tab.

## 1. Data

New module `src/domain/tests.ts`, separate from `RULES` (`Rules` describes character creation;
validation and the generator never read tests).

```ts
type TestId = string

interface TestRoll {
  pool: Localized // e.g. "Strength + Stamina", "dice = supply rating"
  canPush: boolean
  stressDice: boolean
}

interface TestTable {
  caption: Localized
  columns: Localized[]
  rows: Localized[][]
}

interface TestEntry {
  id: TestId
  group: 'core' | 'hazard'
  label: Localized
  summary: Localized // one line, shown in the collapsed entry
  roll: TestRoll
  when: Localized
  outcome: Localized // what success and failure do
  table?: TestTable
  related: TestId[]
  page: number // printed rulebook page
}

interface PrimerSection {
  id: string
  label: Localized
  text: Localized
  page: number
}
```

Exports `TESTS: TestEntry[]` and `TEST_PRIMER: PrimerSection[]`, both in book order. Types live
in `tests.ts` (not `types.ts`), since nothing else uses them.

Entries (printed pages):

| Group  | Entry                    | Page | Table                   |
| ------ | ------------------------ | ---- | ----------------------- |
| core   | Supply test              | 34   | when to roll per supply |
| core   | Panic test               | 104  | panic results           |
| core   | Stopping panic (Command) | 104  | —                       |
| core   | Survival test            | 99   | —                       |
| hazard | Vacuum and chill         | 107  | —                       |
| hazard | Fall                     | 108  | —                       |
| hazard | Fire                     | 108  | —                       |
| hazard | Disease                  | 109  | —                       |
| hazard | Radiation                | 110  | radiation levels        |
| hazard | Drowning                 | 110  | —                       |
| hazard | Suffocation              | 110  | —                       |

Hazard entries link to the Survival test through `related` where failure escalates to it. Fall and
fire are damage rolls, not skill tests (fall: optional Mobility roll reduces damage; fire: base
dice equal to intensity); their `roll.pool` says so.

Primer sections (pp. 58–64): rolling a test, stress dice, pushing, group tests, opposed tests,
modifiers and difficulty, help from others.

## 2. Search

`src/domain/testSearch.ts`, pure, no `ui/` imports:

```ts
function filterTests(tests: TestEntry[], query: string, lang: Lang): TestEntry[]
function groupTests(tests: TestEntry[]): { group: TestEntry['group']; tests: TestEntry[] }[]
```

- Same matching as the talents search via `textSearch.ts`: case- and diacritic-insensitive, every
  whitespace-separated word must match, current language only.
- Searched text: label, summary, roll pool, when, outcome, table caption, columns and cells.
- An empty query returns all entries.
- `groupTests` returns core then hazard, keeping book order inside each, and drops empty groups.
- No filter dropdown: the group headings do that job.

## 3. Routing and navigation

- Route `{ name: 'tests'; id?: TestId }` for `#/tests` and `#/tests/:id`; `href.tests(id?)`
  builds them with `encodeURIComponent`. An unknown id falls back to `{ name: 'tests' }`.
- A fifth nav link, **Tests / Testy**, current on both routes.
- No service worker change.

## 4. Tests tab

`src/ui/TestBrowser.tsx`, thin, same layout as `SkillBrowser`:

- Toolbar with the title, then the search box.
- **How a test works** panel: one `<details>`, closed by default, with the primer sections and
  their pages. Not filtered by search.
- Panels **Core tests** and **Hazards**. Each entry is a `<details>`:
  - summary: label, page, one-line summary;
  - body: roll line (pool; can or cannot be pushed; stress dice or not), when, outcome, the table
    if any, and **See also** links to related entries.
- `#/tests/:id` opens and scrolls to that entry.
- Empty search result shows a localized "no tests match" message.
- New i18n keys `nav.tests` and `tests.*` in `en.ts` and `pl.ts`. Content stays in `tests.ts`.
- Styles: reuse the skills tab panel and `details` styles; add a small table style.

## 5. Testing

- `tests.test.ts`: unique ids; every `related` id exists and is not the entry itself; every
  `Localized` (entries, tables, primer) has non-empty PL and EN text; every table row has as many
  cells as columns; pages within the book's range; primer ids unique.
- `testSearch.test.ts`: diacritic-insensitive match; match inside a table cell; every word
  required; other language not searched; grouping is core then hazard in book order, empty groups
  dropped.
- `router.test.ts`: `#/tests`, `#/tests/:id`, unknown id fallback; `href.tests` round-trips.
- Full check: `npm run typecheck && npm test && npm run lint` on Node 24.
