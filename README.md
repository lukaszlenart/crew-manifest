# Crew Manifest

A character generator for the **ALIEN RPG** (Polish edition: **OBCY**), built for a single Game
Master. It runs entirely in the browser. There is no backend and no account. Characters are
stored in `localStorage`. The interface is available in English and Polish.

## Features

- Character creator that checks the creation rules as you type: attribute and skill point
  budgets, per-career caps, and one talent from the career.
- Randomize the whole character or one section. A lock keeps a section unchanged.
- Characters that break the rules can still be saved; they are marked as **drafts**.
- Character list with search, career filter, duplicate, edit and delete.
- Table-ready character sheet. Prints on A4, one character per page. You can also print several
  selected characters at once.
- JSON backup: export everything, then import it with **merge** (overwrite by id) or
  **replace all**. After an import you get a report of what was rejected and why.
- Keyboard shortcuts. List: `N` new character, `/` search. Editor: `R` randomize all,
  `Ctrl+S` / `⌘S` save.

## Running

Requires Node.js 20+.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/ (relative paths; serve it from any folder of a static host)
npm run preview    # serve the production build
```

Browsers do not load the built app from `file://`, so serve `dist/` over HTTP (for example
`npm run preview`, or any static file server on your LAN).

### Hosted version

Every push to `main` is built and deployed to GitHub Pages by `.github/workflows/deploy.yml`:
<https://uit-soft.github.io/crew-manifest/>. One-time setup: **Settings → Pages → Source:
GitHub Actions**.

On an iPad or phone, open that address in Safari and use **Share → Add to Home Screen**. A
Home Screen app keeps its data; in a plain Safari tab, Safari may clear the site's storage after
about 7 days without a visit. Characters live only on the device they were created on; move
them with **Export** / **Import**.

Checks:

```sh
npm run typecheck && npm test && npm run lint
```

## Filling in the rulebook data

The nine careers, their talents and their starting gear come from the Polish edition of the
rulebook. Talent descriptions are short summaries, not rulebook text. English names come from
the English edition. Some data is still missing. Search the code for
`TODO: uzupełnić z podręcznika` to find every spot.

### `src/domain/rules.ts`

- `RULES_LIMITS`: all numeric limits (attribute total and caps, skill total and caps, number
  of gear items picked by the generator). Correct them here if needed.
- `ATTRIBUTES` and `SKILLS`: names in EN and PL. The skill → attribute mapping is fixed by the
  `Skill` type.
- `TALENTS`: career talents, in entries like this:

  ```ts
  {
    id: 'myTalent',
    label: { en: 'Talent name', pl: 'Nazwa talentu' },
    description: { en: 'Short summary', pl: 'Krótki opis' },
  }
  ```

- `CAREERS`: entries like this. Each gear option is one rulebook line, `X / Y`:

  ```ts
  {
    id: 'myCareer',
    label: { en: 'Career', pl: 'Zawód' },
    keyAttribute: 'wits',
    keySkills: ['observation', 'survival', 'comtech'],
    talents: ['myTalent', 'otherTalent'],
    gearOptions: [{ en: 'Item', pl: 'Przedmiot' }],
  }
  ```

All user-visible rulebook text is `Localized` (`{ en, pl }`). If one language is missing, the
code does not compile. `src/domain/rules.test.ts` checks the data: every talent a career
references must exist, ids must be unique, and the point budgets must be reachable. Run
`npm test` after editing.

Characters store only career and talent **ids**. Switching the language translates the whole
sheet. Changing an id in `rules.ts` turns existing characters that use it into drafts, with an
"unknown career/talent" message.

### `src/generator/tables-en.ts` and `tables-pl.ts`

Random tables for names, appearance, personal agenda, buddy, rival and signature item, per
language. `tables-en.ts` and `tables-pl.ts` each hold a `general` pool (original entries) and a
`careers` table per career id, taken from the rulebook career pages. For names, appearance,
agenda and signature item the generator flips a coin between the career list and the general
pool; buddy and rival always come from the general pool.

Polish entries mark gendered words as `{masculine|feminine}`, e.g. `pomogł{eś|aś}`. The
generator picks the form for the character's sex. `src/generator/tables.test.ts` fails if any
entry leaves a marker behind.

## Project layout

```
src/
  domain/      types, rules data, validation, derived values (pure, tested)
  generator/   seeded RNG (mulberry32), random tables, character generation
  storage/     repository interface, localStorage implementation, Zod schema, backup
  i18n/        typed EN/PL dictionaries; en.ts defines the keys, pl.ts must match
  ui/          Preact components, hash router (#/, #/new, #/edit/:id, #/sheet/:id, #/print/:ids)
  styles/      app.css, print.css
```

See `CLAUDE.md` for the development conventions.

## Data safety

- Invalid stored entries are skipped with a console warning. They are kept in storage, never
  silently deleted.
- If the stored data is unreadable, it is copied to `crew-manifest/characters.corrupt` before
  anything is written over it.
- Browser storage can be cleared by the browser or the user. Export a backup regularly.
