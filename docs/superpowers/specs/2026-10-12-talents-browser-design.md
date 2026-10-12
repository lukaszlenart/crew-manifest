# Talents browser — design

Request: a separate tab to browse and search talents and read how each one works. The talent data
exists but cannot be browsed, and it covers career talents only.

## Goal

- A **Talents** tab lists every talent in the rulebook (career and general), searchable and
  filterable, in the current language.
- Each talent has a short summary and a fuller explanation of its mechanics, with the rulebook
  page.
- The talent on the character sheet and in the editor links to its entry in the tab.
- Characters do not change: one career talent, same schema, same validation, same generator output.

## Scope decisions

- **Text in our own words.** Mechanics are summarized in our own words in PL and EN, never copied
  from the rulebook. The source and the site are public; the rulebook prose is not ours to publish.
- **Reference only.** Characters cannot own general talents. That would change `Character`, the
  Zod schema, validation, the editor, the sheet and print, and is out of scope.
- Source: the Polish rulebook, chapter 4 (pp. 73–79): career talents pp. 74–77, general talents
  pp. 78–79.

## 1. Data

- `Talent` gains two fields:

  ```ts
  interface Talent {
    id: TalentId
    label: Localized
    description: Localized // one-line summary; shown on the sheet, editor and print
    details: Localized // fuller explanation; shown only in the Talents tab
    page: number // rulebook page
  }
  ```

  `description` stays a one-liner so the one-page A4 print layout is unaffected.

- `TALENTS` in `src/domain/rules.ts` gains the general talents. All 27 career talents get
  `details` and `page`. The `talent()` helper takes the new arguments. The "Career talents only"
  comment is removed.
- Career or general is derived, not stored: `careersOf(rules, talentId): Career[]` in
  `src/domain/rules.ts` returns the careers whose `talents` list the id. Empty means general.
- `Character`, `CharacterSchema`, `migrate()` and `validation.ts` are unchanged. A character's
  talent must still belong to its career. The generator picks only from `career.talents`, so
  general talents are never rolled.

## 2. Search

`src/domain/talentSearch.ts`, pure, no `ui/` imports:

```ts
type TalentFilter = { kind: 'all' } | { kind: 'general' } | { kind: 'career'; careerId: CareerId }

function filterTalents(
  rules: Rules,
  options: { query: string; filter: TalentFilter },
  lang: Lang,
): Talent[]
```

- Matching is case-insensitive and ignores diacritics (NFD, combining marks removed, `ł`→`l`):
  `zabojca` finds _Zabójca_.
- The query is split on whitespace; every word must appear in the label, description or details
  of the current language. Other languages are not searched.
- An empty query returns all talents passing the filter.
- Results are sorted by label in the current language (`localeCompare` with `lang`).

## 3. Routing and navigation

- New routes `{ name: 'talents'; id?: string }` for `#/talents` and `#/talents/:id`;
  `href.talents(id?)` builds them with `encodeURIComponent`.
- A third nav link, **Talents / Talenty**, marked current on both routes.
- No service worker change: the view and data ship in the same bundle.

## 4. Talents tab

`src/ui/TalentBrowser.tsx`, kept thin; logic lives in `talentSearch.ts`.

- Top: a search input and a filter `<select>` (_All_, _General_, then the 9 careers).
- List: grouped as _Career talents_ (subheading per career, in `RULES.careers` order) and _General
  talents_. With a career filter only that career's group shows; with _General_ only the general
  group.
- Each entry is a native `<details>`: the summary shows the label, the one-line description,
  career badges and the page ("p. 78" / "s. 78"); the body shows `details`.
- No matches: an empty-state line.
- Query and filter are component state, not in the URL.
- `#/talents/:id` resets query and filter to defaults, opens that entry and scrolls it into view.
  An unknown id shows the full list with nothing opened.

## 5. Links from characters

- Character sheet: the talent label links to `href.talents(id)`. In print it renders as plain
  text; `print.css` is checked and adjusted if links are styled.
- Editor: a small "more →" link after the talent's one-line description.

## 6. i18n

New keys in `en.ts` and `pl.ts`: `nav.talents`, `talents.search`, `talents.filter.all`,
`talents.filter.general`, `talents.group.career`, `talents.group.general`, `talents.page`
(`p. {page}` / `s. {page}`), `talents.empty`, `talents.more`.

## 7. Testing

- `talentSearch.test.ts`: case and diacritic insensitivity, multi-word AND, each filter kind,
  language isolation (an EN-only word does not match in PL), empty query, sort order.
- `rules.test.ts`:
  - `careersOf` maps each career talent back to its career, and general talents to none;
  - every talent has non-empty `en` and `pl` label, description and details;
  - `page` is within 73–79;
  - a talent belongs to at most one career.
- `router.test.ts`: `#/talents`, `#/talents/:id`, encoded ids, `href.talents` round trip.
- The golden generator test must pass unchanged.
- Manual check in `npm run dev`: search and filters in both languages, deep link, link from the
  sheet and editor, print preview of a sheet, offline in `npm run preview`.

## 8. Content and review

- Drafted from the extracted rulebook text in separate commits so each diff can be checked against
  the book: career talents (`details`, `page`), then general talents, then EN text.
- Existing PL/EN labels are kept. New PL labels come from the book. EN labels for general
  talents follow the English edition from recollection and are each listed in the PR body for
  confirmation; where unsure, the label gets `// TODO: uzupełnić z podręcznika`.
- Any value the garbled extraction leaves uncertain (a modifier, a page) is listed in the PR body,
  not guessed.
