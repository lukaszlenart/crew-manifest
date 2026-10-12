# Talents Browser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A searchable Talents tab listing every career and general talent with a short summary,
a fuller explanation in our own words and the rulebook page, linked from the sheet and editor.

**Architecture:** Talent data grows in `src/domain/rules.ts` (`details`, `page`, 31 general
talents). Search, filtering and grouping are pure functions in `src/domain/talentSearch.ts`. A
thin `src/ui/TalentBrowser.tsx` renders them on new `#/talents` and `#/talents/:id` routes.
`Character`, its schema, validation and the generator are not touched.

**Tech Stack:** TypeScript, Preact, @preact/signals, Vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-12-talents-browser-design.md`

## Global Constraints

- Branch `feat/talents-browser`. Commit messages: conventional commits, no ticket prefix, ending
  with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Node: use fnm Node 24.15 (`fnm exec --using=24.15 -- npm test`); default Node 18 breaks Vitest.
- Full check before every commit: `npm run typecheck && npm test && npm run lint`.
- `domain/`, `generator/`, `storage/` never import from `ui/` (ESLint enforces it).
- No hard-coded UI text in components — only keys from `src/i18n/`; `pl.ts` must have exactly the
  keys of `en.ts`.
- Talent text is written **in our own words**, PL and EN. Never copy rulebook sentences.
- Do not invent rulebook content. Uncertain values or names get
  `// TODO: uzupełnić z podręcznika` and go on the PR-notes list (Task 8).
- `description` stays one sentence (shown on sheet, editor and print). `details` holds the full
  explanation (Talents tab only).
- `Character`, `CharacterSchema`, `migrate()`, `validation.ts` and `src/generator/` do not change.
  The golden generator test in `src/generator/generate.test.ts` must pass unmodified.

## Review Focus

- Polish input with or without diacritics, including `ł` (NFD does not decompose it): `zabojca`,
  `ZABÓJCA` and `Zabójca` all find *Zabójca*; `lapiac` finds text containing *łapiąc*. Pinned
  in Task 4.
- Queries with regex metacharacters or extra whitespace (`+2`, `(`, `  unik  `) are matched as
  plain text, never thrown or treated as empty words. Pinned in Task 4.
- Following a second deep link while already on the tab (`#/talents/dodge` → `#/talents/zabojca`)
  opens and scrolls to the new entry and clears an active search that would hide it; typing a
  query afterwards does not yank the page back. Pinned in Task 6 (`key` remount + manual check).
- Switching language with a query typed re-runs the search in the new language without a reload.
  Pinned in Task 6 (manual check).
- A printed sheet shows the talent name as plain black text, not a coloured link. Pinned in Task 7.

---

## File structure

| File | Responsibility |
|---|---|
| `src/domain/types.ts` | `Talent` gains `details`, `page` |
| `src/domain/rules.ts` | talent content; `careersOf()` |
| `src/domain/rules.test.ts` | talent content integrity, `careersOf` |
| `src/domain/talentSearch.ts` (new) | fold, filter, sort, group, filter `<select>` encoding |
| `src/domain/talentSearch.test.ts` (new) | search behaviour |
| `src/ui/router.ts` / `router.test.ts` | `talents` route |
| `src/i18n/en.ts`, `pl.ts` | new keys |
| `src/ui/TalentBrowser.tsx` (new) | the tab |
| `src/ui/App.tsx` | nav link, view switch |
| `src/ui/CharacterSheet.tsx`, `CharacterEditor.tsx` | links to the tab |
| `src/styles/app.css`, `print.css` | tab styles, plain links in print |

## Rulebook source (Tasks 1 and 3)

The Polish rulebook is `~/Downloads/OBCY_Gra_fabularna_REPRINT_web_PL.pdf`. Printed page *p* is
PDF page *p + 4*; chapter 4 talents are printed pp. 74–79 (PDF 78–83). Extract into the session
scratchpad, never into the repo:

```bash
pdftotext -layout -f 78 -l 83 ~/Downloads/OBCY_Gra_fabularna_REPRINT_web_PL.pdf "$SCRATCH/talents.txt"
```

Known extraction damage: `(`→`ż`, `!`→`ą`, `)`→`ń`, `$`→`ł`; the success-die icon disappears, so
"Za każdy wyrzucony ␣ …" means "for each success (☢) rolled". Two columns are interleaved per
line. When a number or condition is unclear, open the PDF page with the Read tool
(`pages: "78-83"`) and check the printed text.

Career talent pages (from the table of contents): Colonial Marine 74, Colonial Marshal 74,
Company Agent 75, Kid 75, Medic 75, Officer 76, Pilot 76, Roughneck 76, Scientist 77.

### Wording rules

- `description`: one sentence, ≤ 140 characters, the core effect. Keep the existing one unless it
  is wrong against the book.
- `details`: 1–4 sentences in our own words: when it applies, what it does (numbers, attributes,
  skills), the cost (stress, action type), limits ("not on yourself", "once per turn"). No flavour
  text. Mention cross-references as "see Combat" rather than page numbers of other chapters.
- Game terms in PL as in the book (POZIOM STRESU → "poziom stresu", test KONDYCJI → "test
  Kondycji"); in EN as in the English edition (Stress Level, Stamina roll, push, slow/fast action).
- PL and EN say the same thing.

---

### Task 1: Talent `details` and `page` for career talents

**Files:**
- Modify: `src/domain/types.ts:80-84`
- Modify: `src/domain/rules.ts:46-264` (all `talent(...)` calls), `:499-501` (helper)
- Test: `src/domain/rules.test.ts`

**Interfaces:**
- Produces: `Talent = { id: TalentId; label: Localized; description: Localized; details: Localized; page: number }`

- [ ] **Step 1: Write the failing tests**

Add inside `describe('RULES', ...)` in `src/domain/rules.test.ts`:

```ts
  it('has complete text and a chapter 4 page for every talent', () => {
    for (const t of RULES.talents) {
      for (const field of [t.label, t.description, t.details]) {
        expect(field.en.trim(), t.id).not.toBe('')
        expect(field.pl.trim(), t.id).not.toBe('')
      }
      expect(Number.isInteger(t.page), t.id).toBe(true)
      expect(t.page, t.id).toBeGreaterThanOrEqual(74)
      expect(t.page, t.id).toBeLessThanOrEqual(79)
    }
  })

  it('keeps talent summaries to one short line', () => {
    for (const t of RULES.talents) {
      expect(t.description.en.length, t.id).toBeLessThanOrEqual(140)
      expect(t.description.pl.length, t.id).toBeLessThanOrEqual(140)
    }
  })

  it('places career talents on the career talent pages', () => {
    for (const career of RULES.careers) {
      for (const id of career.talents) {
        const page = RULES.talents.find((t) => t.id === id)?.page ?? 0
        expect(page, id).toBeGreaterThanOrEqual(74)
        expect(page, id).toBeLessThanOrEqual(77)
      }
    }
  })
```

- [ ] **Step 2: Run to verify it fails**

Run: `fnm exec --using=24.15 -- npx vitest run src/domain/rules.test.ts`
Expected: FAIL — `t.details` is undefined (`Cannot read properties of undefined (reading 'en')`).

- [ ] **Step 3: Extend the type and helper**

`src/domain/types.ts`:

```ts
export interface Talent {
  id: TalentId
  label: Localized
  description: Localized
  details: Localized
  page: number
}
```

`src/domain/rules.ts` helper:

```ts
function talent(
  id: string,
  page: number,
  label: Localized,
  description: Localized,
  details: Localized,
): Talent {
  return { id, label, description, details, page }
}
```

- [ ] **Step 4: Write `details` and `page` for all 27 career talents**

Follow "Rulebook source" and "Wording rules" above. Each call gets the page after the id and a
`details` argument. Worked example (Dodge, Kid, p. 75):

```ts
  talent(
    'dodge',
    75,
    { en: 'Dodge', pl: 'Unik' },
    {
      en: '…existing one-liner, unchanged unless wrong…',
      pl: '…existing one-liner, unchanged unless wrong…',
    },
    {
      en: 'When attacked in close combat you can dodge. It works like blocking, but you roll Mobility instead of Close Combat, and successes only reduce the damage — no counterattack or disarm. You can also dodge creature signature attacks.',
      pl: 'Gdy ktoś atakuje cię wręcz, możesz zrobić unik. Działa jak blok, ale rzucasz na Sprawność zamiast Walki Wręcz, a sukcesy tylko zmniejszają obrażenia — bez kontrataku i rozbrojenia. Uniknąć możesz także charakterystycznych ataków stworzeń.',
    },
  ),
```

While doing this, compare each existing PL `label` with the heading in the book. Do not change
labels; record each mismatch (e.g. `pastTheLimit` is *Determinacja* in `rules.ts` — check the
Marine section) on the PR-notes list for Task 8.

- [ ] **Step 5: Run tests**

Run: `fnm exec --using=24.15 -- npx vitest run src/domain/rules.test.ts src/generator`
Expected: PASS, golden generator test included.

- [ ] **Step 6: Full check and commit**

```bash
fnm exec --using=24.15 -- sh -c 'npm run typecheck && npm test && npm run lint'
git add src/domain/types.ts src/domain/rules.ts src/domain/rules.test.ts
git commit -m "feat(rules): add details and page to career talents" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `careersOf`

**Files:**
- Modify: `src/domain/rules.ts` (after `findTalent`)
- Test: `src/domain/rules.test.ts`

**Interfaces:**
- Consumes: `Rules`, `Career`, `TalentId` from `types.ts`
- Produces: `careersOf(rules: Rules, talentId: TalentId): Career[]` — careers in `rules.careers`
  order; empty array means a general talent.

- [ ] **Step 1: Write the failing tests**

Import `careersOf` alongside `RULES` in `rules.test.ts` and add:

```ts
  it('maps each career talent back to exactly its career', () => {
    for (const career of RULES.careers) {
      for (const id of career.talents) {
        expect(careersOf(RULES, id).map((c) => c.id)).toEqual([career.id])
      }
    }
  })

  it('maps unknown and general talents to no career', () => {
    expect(careersOf(RULES, 'nope')).toEqual([])
  })
```

- [ ] **Step 2: Run to verify it fails**

Run: `fnm exec --using=24.15 -- npx vitest run src/domain/rules.test.ts`
Expected: the two new tests FAIL with `careersOf is not a function`; the others pass.

- [ ] **Step 3: Implement**

```ts
export function careersOf(rules: Rules, talentId: TalentId): Career[] {
  return rules.careers.filter((c) => c.talents.includes(talentId))
}
```

Add `TalentId` to the type import at the top of `rules.ts`.

- [ ] **Step 4: Run tests** — `fnm exec --using=24.15 -- npx vitest run src/domain/rules.test.ts` → PASS

- [ ] **Step 5: Commit** — full check, then
`git commit -m "feat(rules): find the careers that offer a talent"` with the co-author line.

---

### Task 3: General talents

**Files:**
- Modify: `src/domain/rules.ts` (`TALENTS`, the comment above it)
- Test: `src/domain/rules.test.ts`

**Interfaces:**
- Consumes: `talent(id, page, label, description, details)` from Task 1, `careersOf` from Task 2

- [ ] **Step 1: Write the failing test**

```ts
  it('lists the 31 general talents on pages 78-79', () => {
    const general = RULES.talents.filter((t) => careersOf(RULES, t.id).length === 0)
    expect(general).toHaveLength(31)
    for (const t of general) {
      expect(t.page, t.id).toBeGreaterThanOrEqual(78)
      expect(t.page, t.id).toBeLessThanOrEqual(79)
    }
  })
```

- [ ] **Step 2: Run to verify it fails** — expected `expected [] to have a length of 31 but got 0`.

- [ ] **Step 3: Add the 31 entries**

Replace the comment `// Career talents only; general talents are gained later through experience.`
with `// Career talents first, then general talents (gained later through experience).` and
append one `talent(...)` per row below, in this order, after the career talents. Write
`description` and `details` per "Wording rules". The EN label column is the English-edition name
as recalled, **not verified**: rows marked `?` get `// TODO: uzupełnić z podręcznika` on the line
above the call and go on the PR-notes list. Ids follow the EN label; general talents are never
stored on characters, so renaming an id later is safe.

| PL (book) | id | EN label | page |
|---|---|---|---|
| Bezlitosny | `merciless` | Merciless | 78 |
| Cichy | `stealthy` | Stealthy ? | 78 |
| Człowiek-demolka | `fullAuto` | Full Auto ? | 78 |
| Doradca | `counselor` | Counselor ? | 78 |
| Dowódca okrętu | `captain` | Captain ? | 78 |
| Drugi oddech | `secondWind` | Second Wind | 78 |
| Groźny | `menacing` | Menacing | 78 |
| Jak na psie | `fastHealer` | Fast Healer ? | 78 |
| Krótki sen | `shortSleeper` | Short Sleeper ? | 78 |
| Mechanik okrętowy | `shipMechanic` | Ship Mechanic ? | 78 |
| Narwaniec | `rebellious` | Rebellious ? | 78 |
| Niejadek | `lightEater` | Light Eater | 78 |
| Niewzruszony | `resistant` | Resistant ? | 78 |
| Ochroniarz | `bodyguard` | Bodyguard | 78 |
| Silny cios | `heavyBlow` | Heavy Blow ? | 78 |
| Skrytka | `stash` | Stash | 78 |
| Spokojny oddech | `deepBreather` | Deep Breather ? | 79 |
| Stalowe nerwy | `nervesOfSteel` | Nerves of Steel | 79 |
| Strzelec okrętowy | `shipGunner` | Ship Gunner ? | 79 |
| Szybkie dobywanie | `quickdraw` | Quickdraw | 79 |
| Szybkie przeładowanie | `rapidReload` | Rapid Reload | 79 |
| Szybki refleks | `fastReflexes` | Fast Reflexes | 79 |
| Szybkostrzelność | `rapidFire` | Rapid Fire | 79 |
| Tragarz | `packMule` | Pack Mule | 79 |
| Trening w stanie nieważkości | `zeroGTraining` | Zero-G Training | 79 |
| Twardziel | `tough` | Tough | 79 |
| Waga lekka | `lightweight` | Lightweight ? | 79 |
| Wyszkolony astronauta | `spacewalker` | Spacewalker ? | 79 |
| Ulubiona broń | `weaponSpecialist` | Weapon Specialist | 79 |
| Uważny | `watchful` | Watchful | 79 |
| Zabójca | `killer` | Killer | 79 |

`Skrytka` starts at the bottom of p. 78 and continues on p. 79; it stays on 78. If the book shows
a talent missing from this table, or vice versa, stop and report it: the count of 31 in the test
comes from this table.

Worked example:

```ts
  talent(
    'nervesOfSteel',
    79,
    { en: 'Nerves of Steel', pl: 'Stalowe nerwy' },
    { en: '−2 to all your Panic Rolls.', pl: '−2 do wszystkich twoich Testów Paniki.' },
    {
      en: 'You keep calm whatever happens: every Panic Roll you make gets a −2 modifier.',
      pl: 'Zachowujesz spokój bez względu na okoliczności: każdy twój Test Paniki dostaje modyfikator −2.',
    },
  ),
```

- [ ] **Step 4: Run tests** — `fnm exec --using=24.15 -- npx vitest run src/domain src/generator`
→ PASS, golden test unchanged.

- [ ] **Step 5: Commit** — full check, then
`git commit -m "feat(rules): add the general talents"` with the co-author line.

---

### Task 4: Talent search

**Files:**
- Create: `src/domain/talentSearch.ts`
- Test: `src/domain/talentSearch.test.ts`

**Interfaces:**
- Consumes: `careersOf` (Task 2); `Rules`, `Talent`, `Career`, `CareerId`, `Lang` from `types.ts`
- Produces:
  - `type TalentFilter = { kind: 'all' } | { kind: 'general' } | { kind: 'career'; careerId: CareerId }`
  - `filterTalents(rules: Rules, options: { query: string; filter: TalentFilter }, lang: Lang): Talent[]` — sorted by current-language label
  - `groupTalents(rules: Rules, talents: Talent[]): { careers: { career: Career; talents: Talent[] }[]; general: Talent[] }` — careers in `rules.careers` order, empty careers omitted, input order kept within groups
  - `filterToValue(filter: TalentFilter): string` / `filterFromValue(value: string): TalentFilter` — `<select>` encoding: `'all'`, `'general'`, `'career:<id>'`; anything else → `{ kind: 'all' }`

Tests use a small fixture, not `RULES`, so content edits never break them.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { RULES } from './rules'
import {
  filterFromValue,
  filterTalents,
  filterToValue,
  groupTalents,
  type TalentFilter,
} from './talentSearch'
import type { Rules, Talent } from './types'

function tal(id: string, en: string, pl: string, details = { en: '', pl: '' }): Talent {
  return { id, page: 78, label: { en, pl }, description: { en: '', pl: '' }, details }
}

const killer = tal('killer', 'Killer', 'Zabójca', {
  en: 'Swap the d66 dice on a critical injury.',
  pl: 'Zamieniasz kości k66 przy ranie ciężkiej.',
})
const dodge = tal('dodge', 'Dodge', 'Unik', {
  en: 'Roll Mobility, +2 is not involved.',
  pl: 'Rzucasz na Sprawność.',
})
const heavy = tal('heavyBlow', 'Heavy Blow', 'Silny cios', {
  en: '+2 to Close Combat (fast action).',
  pl: 'Modyfikator +2 do Walki Wręcz.',
})
const lungs = tal('deep', 'Deep Breather', 'Spokojny oddech', {
  en: 'Roll two fewer dice.',
  pl: 'Rzucasz dwiema kośćmi mniej, łapiąc oddech.',
})

const rules: Rules = {
  ...RULES,
  careers: [
    { ...RULES.careers[0], id: 'kid', talents: ['dodge'] },
    { ...RULES.careers[1], id: 'marine', talents: ['heavyBlow'] },
  ],
  talents: [killer, dodge, heavy, lungs],
}

const all: TalentFilter = { kind: 'all' }
const ids = (ts: Talent[]) => ts.map((t) => t.id)
const search = (query: string, lang: 'en' | 'pl' = 'pl', filter = all) =>
  ids(filterTalents(rules, { query, filter }, lang))

describe('filterTalents', () => {
  it('returns everything sorted by the current-language label for an empty query', () => {
    expect(search('', 'en')).toEqual(['deep', 'dodge', 'heavyBlow', 'killer'])
    expect(search('   ', 'pl')).toEqual(['heavyBlow', 'deep', 'dodge', 'killer'])
  })

  it('ignores case and Polish diacritics, including ł', () => {
    expect(search('zabojca')).toEqual(['killer'])
    expect(search('ZABÓJCA')).toEqual(['killer'])
    expect(search('lapiac')).toEqual(['deep'])
    expect(search('ŁAPIĄC')).toEqual(['deep'])
  })

  it('searches label, description and details', () => {
    expect(search('k66')).toEqual(['killer'])
    expect(search('sprawność')).toEqual(['dodge'])
  })

  it('requires every word to match', () => {
    expect(search('walki +2')).toEqual(['heavyBlow'])
    expect(search('walki zabojca')).toEqual([])
  })

  it('treats regex characters and extra whitespace as plain text', () => {
    expect(search('  +2  ', 'en')).toEqual(['dodge', 'heavyBlow'])
    expect(search('(fast', 'en')).toEqual(['heavyBlow'])
    expect(() => search('[(*', 'en')).not.toThrow()
  })

  it('searches only the current language', () => {
    expect(search('killer', 'pl')).toEqual([])
    expect(search('zabojca', 'en')).toEqual([])
  })

  it('filters by career and general', () => {
    expect(search('', 'en', { kind: 'career', careerId: 'kid' })).toEqual(['dodge'])
    expect(search('', 'en', { kind: 'general' })).toEqual(['deep', 'killer'])
  })
})

describe('groupTalents', () => {
  it('groups by career in career order and keeps the rest as general', () => {
    const groups = groupTalents(rules, filterTalents(rules, { query: '', filter: all }, 'en'))
    expect(groups.careers.map((g) => [g.career.id, ids(g.talents)])).toEqual([
      ['kid', ['dodge']],
      ['marine', ['heavyBlow']],
    ])
    expect(ids(groups.general)).toEqual(['deep', 'killer'])
  })

  it('omits careers with no talents left', () => {
    const groups = groupTalents(rules, [killer])
    expect(groups.careers).toEqual([])
    expect(ids(groups.general)).toEqual(['killer'])
  })
})

describe('filter <select> values', () => {
  it('round-trips every filter', () => {
    const filters: TalentFilter[] = [
      { kind: 'all' },
      { kind: 'general' },
      { kind: 'career', careerId: 'kid' },
    ]
    for (const f of filters) expect(filterFromValue(filterToValue(f))).toEqual(f)
  })

  it('falls back to all for unknown values', () => {
    expect(filterFromValue('bogus')).toEqual({ kind: 'all' })
    expect(filterFromValue('career:')).toEqual({ kind: 'all' })
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `fnm exec --using=24.15 -- npx vitest run src/domain/talentSearch.test.ts`
Expected: FAIL — cannot resolve `./talentSearch`.

- [ ] **Step 3: Implement**

```ts
import { careersOf } from './rules'
import type { Career, CareerId, Lang, Rules, Talent } from './types'

export type TalentFilter =
  | { kind: 'all' }
  | { kind: 'general' }
  | { kind: 'career'; careerId: CareerId }

export function filterTalents(
  rules: Rules,
  options: { query: string; filter: TalentFilter },
  lang: Lang,
): Talent[] {
  const words = fold(options.query).split(/\s+/).filter((w) => w !== '')
  return rules.talents
    .filter((t) => matchesFilter(rules, t, options.filter))
    .filter((t) => {
      const text = fold([t.label[lang], t.description[lang], t.details[lang]].join(' '))
      return words.every((w) => text.includes(w))
    })
    .sort((a, b) => a.label[lang].localeCompare(b.label[lang], lang))
}

export function groupTalents(
  rules: Rules,
  talents: Talent[],
): { careers: { career: Career; talents: Talent[] }[]; general: Talent[] } {
  const careers = rules.careers
    .map((career) => ({ career, talents: talents.filter((t) => career.talents.includes(t.id)) }))
    .filter((g) => g.talents.length > 0)
  const general = talents.filter((t) => careersOf(rules, t.id).length === 0)
  return { careers, general }
}

export function filterToValue(filter: TalentFilter): string {
  return filter.kind === 'career' ? `career:${filter.careerId}` : filter.kind
}

export function filterFromValue(value: string): TalentFilter {
  if (value === 'general') return { kind: 'general' }
  if (value.startsWith('career:') && value.length > 'career:'.length)
    return { kind: 'career', careerId: value.slice('career:'.length) }
  return { kind: 'all' }
}

function matchesFilter(rules: Rules, talent: Talent, filter: TalentFilter): boolean {
  if (filter.kind === 'all') return true
  const careers = careersOf(rules, talent.id)
  if (filter.kind === 'general') return careers.length === 0
  return careers.some((c) => c.id === filter.careerId)
}

function fold(text: string): string {
  return text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '')
}
```

- [ ] **Step 4: Run tests** — same command → PASS. If the PL sort expectation fails, check that
`localeCompare(…, 'pl')` puts *Silny cios* before *Spokojny oddech*; the expectation is correct
Polish collation, so fix the code, not the test.

- [ ] **Step 5: Commit** — full check, then
`git commit -m "feat(domain): search and group talents"` with the co-author line.

---

### Task 5: `talents` route and i18n keys

**Files:**
- Modify: `src/ui/router.ts`, `src/ui/router.test.ts`
- Modify: `src/i18n/en.ts`, `src/i18n/pl.ts` (after the `nav.*` and `list.*` blocks)

**Interfaces:**
- Produces: `Route` member `{ name: 'talents'; id?: string }`; `href.talents(id?: string): string`;
  message keys listed in Step 4.

- [ ] **Step 1: Write the failing tests** — in `router.test.ts`:

```ts
  it('parses the talents routes', () => {
    expect(parseRoute('#/talents')).toEqual({ name: 'talents' })
    expect(parseRoute('#/talents/dodge')).toEqual({ name: 'talents', id: 'dodge' })
    expect(parseRoute('#/talents/a%20b')).toEqual({ name: 'talents', id: 'a b' })
  })

  it('round-trips talent hrefs', () => {
    expect(href.talents()).toBe('#/talents')
    expect(parseRoute(href.talents('x/y z'))).toEqual({ name: 'talents', id: 'x/y z' })
  })
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run src/ui/router.test.ts` → FAIL
(`href.talents is not a function`, and `#/talents` parses as `list`).

- [ ] **Step 3: Implement** — in `router.ts`:

```ts
  | { name: 'talents'; id?: string }
```

in `parseRoute`, before the final `return`:

```ts
  if (head === 'talents') return arg ? { name: 'talents', id: arg } : { name: 'talents' }
```

in `href`:

```ts
  talents: (id?: string) => (id ? `#/talents/${encodeURIComponent(id)}` : '#/talents'),
```

`App.tsx`'s `View` switch must stay exhaustive: add a temporary
`case 'talents': return null` so typecheck passes until Task 6 replaces it.

- [ ] **Step 4: Add the i18n keys**

`en.ts`, after `'nav.new'`:

```ts
  'nav.talents': 'Talents',
```

`en.ts`, new block after the `list.*` block:

```ts
  'talents.title': 'Talents',
  'talents.search': 'Search talents',
  'talents.filter': 'Filter talents',
  'talents.filter.all': 'All talents',
  'talents.filter.general': 'General talents',
  'talents.group.career': 'Career talents',
  'talents.group.general': 'General talents',
  'talents.generalNote': 'Gained through experience during play.',
  'talents.page': 'p. {page}',
  'talents.empty': 'No talents match the search.',
  'talents.more': 'More →',
```

`pl.ts`, same positions:

```ts
  'nav.talents': 'Talenty',
```

```ts
  'talents.title': 'Talenty',
  'talents.search': 'Szukaj talentów',
  'talents.filter': 'Filtruj talenty',
  'talents.filter.all': 'Wszystkie talenty',
  'talents.filter.general': 'Talenty ogólne',
  'talents.group.career': 'Talenty zawodowe',
  'talents.group.general': 'Talenty ogólne',
  'talents.generalNote': 'Zdobywane dzięki doświadczeniu w trakcie gry.',
  'talents.page': 's. {page}',
  'talents.empty': 'Żaden talent nie pasuje do wyszukiwania.',
  'talents.more': 'Więcej →',
```

(`talents.title`, `talents.filter` and `talents.generalNote` are additions to the spec's key list:
a heading, the select's `aria-label`, and a one-line note under the general group.)

- [ ] **Step 5: Run tests** — `npx vitest run src/ui/router.test.ts src/i18n` → PASS.

- [ ] **Step 6: Commit** — full check, then
`git commit -m "feat(ui): add the talents route and messages"` with the co-author line.

---

### Task 6: Talents tab

**Files:**
- Create: `src/ui/TalentBrowser.tsx`
- Modify: `src/ui/App.tsx` (nav, `View`)
- Modify: `src/styles/app.css` (append a `/* Talents */` block)

**Interfaces:**
- Consumes: `filterTalents`, `groupTalents`, `filterToValue`, `filterFromValue`, `TalentFilter`
  (Task 4); `careersOf` (Task 2); `href.talents`, route `talents` (Task 5); keys from Task 5.
- Produces: `TalentBrowser({ id }: { id?: string })`.

UI components have no unit tests in this repo; this task is verified by the full check plus the
manual checklist in Step 5.

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useMemo, useState } from 'preact/hooks'
import { RULES, careersOf } from '../domain/rules'
import {
  filterFromValue,
  filterTalents,
  filterToValue,
  groupTalents,
  type TalentFilter,
} from '../domain/talentSearch'
import type { Talent } from '../domain/types'
import { lang, useLocalize, useT } from '../i18n'

const ALL: TalentFilter = { kind: 'all' }

export function TalentBrowser({ id }: { id?: string }) {
  const t = useT()
  const loc = useLocalize()
  const l = lang.value
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TalentFilter>(ALL)

  useEffect(() => {
    if (id) document.getElementById(entryId(id))?.scrollIntoView({ block: 'start' })
  }, [id])

  const groups = useMemo(
    () => groupTalents(RULES, filterTalents(RULES, { query, filter }, l)),
    [query, filter, l],
  )
  const empty = groups.careers.length === 0 && groups.general.length === 0

  const entry = (talent: Talent) => (
    <details key={talent.id} id={entryId(talent.id)} class="talent" open={talent.id === id}>
      <summary>
        <strong>{loc(talent.label)}</strong>
        {careersOf(RULES, talent.id).map((c) => (
          <span key={c.id} class="badge">
            {loc(c.label)}
          </span>
        ))}
        <span class="muted small">{t('talents.page', { page: talent.page })}</span>
        <span class="small talent-summary">{loc(talent.description)}</span>
      </summary>
      <p>{loc(talent.details)}</p>
    </details>
  )

  return (
    <section class="talents">
      <div class="toolbar">
        <h2>{t('talents.title')}</h2>
      </div>
      <div class="filters">
        <input
          type="search"
          value={query}
          placeholder={t('talents.search')}
          aria-label={t('talents.search')}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
        <select
          value={filterToValue(filter)}
          aria-label={t('talents.filter')}
          onChange={(e) => setFilter(filterFromValue(e.currentTarget.value))}
        >
          <option value="all">{t('talents.filter.all')}</option>
          <option value="general">{t('talents.filter.general')}</option>
          {RULES.careers.map((c) => (
            <option key={c.id} value={filterToValue({ kind: 'career', careerId: c.id })}>
              {loc(c.label)}
            </option>
          ))}
        </select>
      </div>

      {empty && <p class="empty muted">{t('talents.empty')}</p>}

      {groups.careers.length > 0 && (
        <section class="panel">
          <h3>{t('talents.group.career')}</h3>
          {groups.careers.map((g) => (
            <div key={g.career.id} class="talent-group">
              <h4>{loc(g.career.label)}</h4>
              {g.talents.map(entry)}
            </div>
          ))}
        </section>
      )}

      {groups.general.length > 0 && (
        <section class="panel">
          <h3>{t('talents.group.general')}</h3>
          <p class="muted small">{t('talents.generalNote')}</p>
          {groups.general.map(entry)}
        </section>
      )}
    </section>
  )
}

function entryId(talentId: string): string {
  return `talent-${talentId}`
}
```

- [ ] **Step 2: Wire it into `App.tsx`**

Import `TalentBrowser`. In `<nav>`, after the `nav.new` link:

```tsx
          <a href={href.talents()} aria-current={current.name === 'talents' ? 'page' : undefined}>
            {t('nav.talents')}
          </a>
```

Replace the temporary `case 'talents': return null` in `View` with:

```tsx
    case 'talents':
      return <TalentBrowser key={route.id ?? ''} id={route.id} />
```

The `key` remounts the tab on every new deep link, which resets query and filter (so the target
is visible) and re-runs the scroll effect; typing afterwards does not scroll.

- [ ] **Step 3: Styles** — append to `src/styles/app.css`:

```css
/* Talents */
.talents .panel + .panel {
  margin-top: 16px;
}

.talent-group h4 {
  margin: 16px 0 4px;
}

.talent {
  padding: 8px 0;
  border-top: 1px solid var(--panel-border);
}

.talent summary {
  cursor: pointer;
}

.talent summary > * + * {
  margin-left: 8px;
}

.talent summary > .talent-summary {
  display: block;
  margin: 2px 0 0;
}

.talent p {
  margin: 8px 0 0 16px;
}
```

- [ ] **Step 4: Full check** — `fnm exec --using=24.15 -- sh -c 'npm run typecheck && npm test && npm run lint'` → PASS.

- [ ] **Step 5: Manual check in `npm run dev`** (http://localhost:5173)
  - Nav shows *Talents*; it is marked current on `#/talents` and `#/talents/dodge`.
  - Typing `zabojca` in PL shows only *Zabójca*; switch to EN with the query still typed → the
    list updates without a reload (empty, because `zabojca` is not English).
  - Filter *General* shows only the general group with its note; a career filter shows one
    career subheading.
  - With `unik` typed, open `#/talents/killer` in the address bar → query clears, *Killer* is
    open and scrolled into view. Then `#/talents/dodge` → *Dodge* opens and scrolls.
  - `#/talents/bogus` shows the full list, nothing open, no console errors.

- [ ] **Step 6: Commit** — `git commit -m "feat(ui): add the talents tab"` with the co-author line.

---

### Task 7: Links from the sheet and editor

**Files:**
- Modify: `src/ui/CharacterSheet.tsx:125-133`
- Modify: `src/ui/CharacterEditor.tsx:252`
- Modify: `src/styles/print.css` (inside `@media print`)

**Interfaces:**
- Consumes: `href.talents(id)` (Task 5), key `talents.more` (Task 5).

- [ ] **Step 1: Sheet** — replace `<strong>{loc(talent.label)}</strong>` with:

```tsx
              <a class="talent-link" href={href.talents(talent.id)}>
                <strong>{loc(talent.label)}</strong>
              </a>
```

(`href` is already imported in `CharacterSheet.tsx`.)

- [ ] **Step 2: Editor** — the editor has no unsaved-changes guard, so the link opens a new tab
instead of leaving the draft. Replace line 252 with:

```tsx
          {talent && (
            <p class="muted small">
              {loc(talent.description)}{' '}
              <a href={href.talents(talent.id)} target="_blank" rel="noopener">
                {t('talents.more')}
              </a>
            </p>
          )}
```

(`href` is already imported in `CharacterEditor.tsx`.)

- [ ] **Step 3: Print** — inside `@media print` in `print.css`, add:

```css
  .sheet a {
    color: inherit;
    text-decoration: none;
  }
```

- [ ] **Step 4: Full check** → PASS.

- [ ] **Step 5: Manual check**
  - The sheet's talent name links to its open entry in the tab.
  - In the editor, *More →* opens the tab in a new browser tab; the draft and its *unsaved*
    marker stay in the original tab.
  - Print preview of a sheet (`#/print/<id>`): talent name is plain black, not underlined, and
    the sheet still fits one A4 page.

- [ ] **Step 6: Commit** — `git commit -m "feat(ui): link a character's talent to the talents tab"`
with the co-author line.

---

### Task 8: Verify and prepare the PR

**Files:** none changed unless a check fails.

- [ ] **Step 1: Full check and build**

```bash
fnm exec --using=24.15 -- sh -c 'npm run typecheck && npm test && npm run lint && npm run build'
```

Expected: all PASS; `git diff main -- src/generator src/storage src/domain/validation.ts` is
empty.

- [ ] **Step 2: Offline check** — `npm run preview`, load once, go offline in DevTools, reload
`#/talents` → the tab works.

- [ ] **Step 3: Collect PR notes** for the human review against the book:
  - every EN label marked `?` in Task 3, with its PL name;
  - every `// TODO: uzupełnić z podręcznika` added (`git diff main | grep "TODO: uzupełnić"`);
  - every existing PL label that differs from the book heading (Task 1, Step 4);
  - every value left uncertain by the extraction.

- [ ] **Step 4: Hand off** — run `superpowers:finishing-a-development-branch`. Before any
`gh pr create`, run `/security-review` on the branch diff (global instruction) and put the
Step 3 notes in the PR body.
