# Android player characters — design

Issue: #19. Rulebook: OBCY PL, pp. 28–29 ("Granie androidem"), damage p. 111.

## Goal

The GM can build an android player character in any career, and validation checks the android
creation rules. Play-only rules (no pushing, no Panic Rolls, different damage) are shown as a note
on the sheet, not modelled.

## Decisions

- **Store the base attributes plus the chosen bonus attributes**, not the final values. Final
  values plus a flag would accept unreachable spreads (e.g. 5/5/5/5 fits total 20 and caps 8/7 but
  has no legal 14-point base) and would not record which attributes got the bonus.
- **No migration, no schema version bump.** There are no saved characters yet, so the new fields
  are required in the schema with no defaults and `migrate()` stays a no-op.
- **Human/android is never random.** Human is the default; the user switches it and then
  generates. Generating and re-rolling always keep the current kind.

## Data model

`src/domain/types.ts`:

```ts
export type Kind = 'human' | 'android'
export const KINDS: readonly Kind[] = ['human', 'android']

interface Character {
  // ...existing fields
  kind: Kind
  /** Attributes that get the android bonus; always empty for a human. */
  androidBonus: Attribute[]
}
```

`RuleLimits` gains `androidAttributeBonus` and `androidBonusAttributes`; `RULES_LIMITS` sets them
to `3` and `2`.

`attributes` keeps storing the base values (total 14, caps 5/4). `emptyCharacter` sets
`kind: 'human'`, `androidBonus: []`.

`src/storage/schema.ts`: `kind: z.enum(['human', 'android'])` and
`androidBonus: z.array(z.enum(['strength', 'agility', 'wits', 'empathy']))`, both required. The
existing compile-time check keeps schema and type in sync.

## Derived values

`src/domain/derived.ts`:

- `effectiveAttributes(c, rules)` returns base + `androidAttributeBonus` for each attribute listed
  in `androidBonus` (only when `kind === 'android'`).
- `health(c, rules)` returns the effective Strength.

## Validation

`src/domain/validation.ts`:

- `validateAttributes` is unchanged: base attributes are checked as for a human.
- New `validateAndroid(c, rules)`, included in `validateCharacter`, with field `androidBonus`:
  - `androidBonus.count` (param `expected`) — an android whose `androidBonus` is not exactly
    `androidBonusAttributes` distinct attributes.
  - `androidBonus.human` — a human with a non-empty `androidBonus`.
- Both codes get `validation.*` messages in `en.ts` and `pl.ts`.
- `rules.test.ts` checks that `keyAttributeMax + androidAttributeBonus === 8` and
  `attributeMax + androidAttributeBonus === 7` (rulebook caps).

The signature item stays unvalidated, as today.

## Generator

`src/generator/generate.ts`:

- `kind` comes from `locked.kind`, defaulting to `'human'`. It is not a `Section` and is never
  rolled.
- For an android, the `attributes` section also rolls `androidBonus`: two distinct attributes
  picked uniformly at random. Locking `attributes` keeps both the base values and the bonus.
- For a human, `androidBonus` is `[]`.
- For an android, `signatureItem` is `''`.
- The UI always passes the draft's `kind` as locked when generating or re-rolling.

## Editor

`src/ui/CharacterEditor.tsx`:

- A Human/Android toggle next to Sex.
- Switching to human clears `androidBonus`. Switching to android clears `signatureItem`.
- In the attributes section, for an android, each attribute row gets a "+3" checkbox, disabled
  once two are checked (unless it is one of them). The row shows `base → effective`.
- The signature item field is hidden for an android.
- The Health line in the attributes section uses the new `health(c, rules)`.

## Sheet and print

`src/ui/CharacterSheet.tsx` (print reuses it):

- An "Android" badge next to the career.
- Attributes and Health show effective values.
- The signature item is hidden for an android.
- A short note for an android: cannot push skill rolls, never makes Panic Rolls, takes damage
  differently (p. 111).

All new UI text goes through keys in `src/i18n/en.ts` and `src/i18n/pl.ts`.

## Testing

- `validation.test.ts`: a valid android validates; the same record with `kind: 'human'` reports
  `androidBonus.human`; android with 0, 1, 3 or duplicate bonus attributes reports
  `androidBonus.count`.
- `derived.test.ts` (new): `effectiveAttributes` and `health` for human and android.
- `generate.test.ts`: kind defaults to human; locked android stays android across re-rolls; android
  gets exactly two distinct bonus attributes and an empty signature item; human gets `[]`; locking
  `attributes` keeps the bonus.
- `schema.test.ts`: round-trip of an android; an entry without `kind` is rejected.
- `rules.test.ts`: android caps as above.

UI components stay thin and get no tests. Done when `npm run typecheck && npm test && npm run lint`
passes.

## Out of scope

- Random human/android selection.
- Modelling stress, pushing, panic or android damage.
- An android marker in the character list.
