# Random tables and character sex — design

Issue: #6 (expand the random tables), plus a new request: generate a female or a male character.

## Goal

- A character has a sex, female or male. It is rolled by the generator or set in the editor and
  shown on the sheet.
- Generated names and Polish text match that sex.
- Narrative fields draw on the rulebook's per-career lists as well as a larger general pool, so
  results fit the career and repeat less.

## 1. Data

- New domain type `Sex = 'female' | 'male'` and constant `SEXES` in `src/domain/types.ts`.
- New required field `Character.sex: Sex`. `schemaVersion` stays `1` and no migration is added:
  no characters or backups exist yet. `CharacterSchema` gains `sex: z.enum(['female', 'male'])`.
- `emptyCharacter` defaults to `'male'`; the editor toggle changes it.
- i18n keys: `section.sex`, `sex.female`, `sex.male` in `en.ts` and `pl.ts`
  (EN "Sex" / "Female" / "Male"; PL "Płeć" / "Kobieta" / "Mężczyzna").

## 2. Generator

- `sex` becomes a `Section`, so it can be locked and re-rolled like the others.
- New `SEX_DEPENDENT = ['name']`. Re-rolling `sex` also re-rolls the name unless the name is
  kept, the same way `CAREER_DEPENDENT` follows `careerId`.
- The sex is rolled 50/50 unless locked.
- Changing the sex in the editor does not rewrite existing text; the randomize buttons use the
  current sex from then on.
- Every field still consumes randomness unconditionally, so locking one field does not shift the
  others. Outputs for a given seed change once with this release; nothing depends on old seeds.

## 3. Tables

`src/generator/tables.ts` holds two kinds of tables, per language:

```ts
interface GeneralTables {
  firstNames: Record<Sex, string[]>
  lastNames: string[]
  appearance: string[]
  personalAgenda: string[]
  buddy: string[]
  rival: string[]
  signatureItem: string[]
}

interface CareerTables {
  names: Record<Sex, string[]> // full names, "First Last"
  appearance: string[]
  personalAgenda: string[]
  signatureItem: string[]
}

TABLES: Record<Lang, { general: GeneralTables; careers: Record<CareerId, CareerTables> }>
```

- **Career tables** come from the Polish rulebook, career pages pp. 38–55: sample names (male
  column left, female column right), appearance, personal agenda and signature item. English
  versions are my translations; there is no English edition to copy from. Personal names are the
  same in both languages.
- **General tables** are original entries, not rulebook text: at least 15 first names per sex,
  20 last names and 10 entries for each narrative field, in both languages.
- **Picking:** for name, appearance, personal agenda and signature item, the generator flips a
  coin between the career list and the general pool. It uses the general pool when the career
  has no list or the coin says so. Buddy and rival always use the general pool (the rulebook has
  no lists for them). A general name is `firstNames[sex]` + `lastNames`; a career name is a full
  entry from `names[sex]`.

## 4. Polish grammatical gender

- Entries may mark a gendered word as `{masculine|feminine}`, e.g. `pomogł{eś|aś}`.
- A pure function `resolveGender(text: string, sex: Sex): string` in `src/generator/` replaces
  every marker with the matching form. The generator applies it to every picked entry, so stored
  characters only contain plain text.
- English entries don't need markers, but the function runs on them too, and a missing marker
  is a no-op.

## 5. UI

- Editor: a female/male toggle beside the name, with the usual section header (title, lock and
  randomize).
- Sheet: a "Sex" / "Płeć" field near the name.
- No new hard-coded strings; only i18n keys.

## 6. Tests

- `resolveGender`: both sexes, several markers in one string, no markers.
- Tables: every career in `RULES` has a career table in both languages with non-empty lists, and
  every career and general entry resolves with no `{`, `}` or `|` left for both sexes.
- Generator: a locked sex is kept; re-rolling `sex` re-rolls the name unless it is kept; a career
  name comes from `names[sex]`; the existing 1000-seed run stays valid.
- Schema: a character without `sex`, or with another value, is rejected.

## Out of scope

- Gear either/or (#11) and starting cash (#12).
- Rewriting text that already exists when the sex changes.
- Any third value for sex.
