# Android Player Characters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the GM build android player characters (any career, +3 to two attributes, no
signature item) and validate them against the android creation rules.

**Architecture:** `Character` gains `kind` and `androidBonus` (the two attributes getting +3);
`attributes` keeps the base values, and a pure `effectiveAttributes()` adds the bonus. Validation
keeps checking the base like a human's and adds a check of `androidBonus`. The generator never
rolls `kind`; for an android it rolls the bonus with the attributes section and leaves the
signature item empty. Editor and sheet read effective values.

**Tech Stack:** TypeScript, Preact + @preact/signals, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-12-android-characters-design.md`

## Global Constraints

- No schema version bump and no `migrate()` step; `kind` and `androidBonus` are required in the
  Zod schema with no defaults.
- Human is the default (`kind: 'human'`, `androidBonus: []`); `kind` is never randomized.
- Limits live in `RULES_LIMITS`: `androidAttributeBonus: 3`, `androidBonusAttributes: 2`.
- No hard-coded UI text: every string goes through keys in `src/i18n/en.ts` and `src/i18n/pl.ts`
  (`i18n.test.ts` fails if their keys differ).
- Domain code (`domain/`, `generator/`, `storage/`) never imports from `ui/`.
- No new dependencies. Code and commit messages in English. Default to no code comments.
- Run every Node command with Node 24:
  `PATH=$HOME/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH` (shown below as
  `$N24`; expand it in full when running). The default Node 18 crashes Vitest.
- Commit messages: `feat: …` / `test: …`, body `Refs #19`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work on branch
  `feat/android-characters`.

## Review Focus

1. **Re-rolling an android's attributes or career** must also re-roll the bonus, never leave a
   stale bonus. Pinned in Task 4 (`rerollSections` tests).
2. **Generating a human must not change** compared with before this feature (same seed → same
   human), so existing behaviour and the "same seed" guarantee hold. Pinned in Task 4
   (random-consumption test).
3. **Duplicate bonus entries** (`['strength', 'strength']`) must be reported, not counted as two.
   Pinned in Task 3.
4. **A human record carrying a leftover bonus** must be reported, so the "same values on a human"
   case is an issue. Pinned in Task 3.
5. **Switching android → human in the editor** must clear the bonus, and human → android must
   clear the signature item. UI-only; checked manually in Task 7.

---

## File Structure

| File | Change |
|---|---|
| `src/domain/types.ts` | `Kind`, `KINDS`; `Character.kind`, `Character.androidBonus`; two new `RuleLimits` fields |
| `src/domain/rules.ts` | `RULES_LIMITS.androidAttributeBonus`, `androidBonusAttributes` |
| `src/domain/character.ts` | `emptyCharacter` defaults |
| `src/domain/testing.ts` | `validCharacter` defaults |
| `src/storage/schema.ts` | two new required fields |
| `src/domain/derived.ts` | `effectiveAttributes`, `health(c, rules)` |
| `src/domain/derived.test.ts` | new; `health` test moves here from `validation.test.ts` |
| `src/domain/validation.ts` | `validateAndroid`, two issue codes |
| `src/generator/generate.ts` | `kind`, bonus roll, empty signature item, `rerollSections` |
| `src/i18n/en.ts`, `src/i18n/pl.ts` | new keys |
| `src/ui/CharacterEditor.tsx` | type toggle, +3 checkboxes, hidden signature item |
| `src/ui/CharacterSheet.tsx` | badge, effective values, play-rules note, hidden signature item |

---

### Task 1: Data model, limits and schema

**Files:**
- Modify: `src/domain/types.ts`, `src/domain/rules.ts:6-17`, `src/domain/character.ts`,
  `src/domain/testing.ts`, `src/storage/schema.ts`, `src/generator/generate.ts:103-122`
- Test: `src/storage/schema.test.ts`, `src/domain/rules.test.ts`

**Interfaces:**
- Produces: `type Kind = 'human' | 'android'`, `KINDS: readonly Kind[]`,
  `Character.kind: Kind`, `Character.androidBonus: Attribute[]`,
  `RuleLimits.androidAttributeBonus: number`, `RuleLimits.androidBonusAttributes: number`.
  `validCharacter()` returns `kind: 'human'`, `androidBonus: []`.

- [ ] **Step 1: Write the failing tests**

Append to the `describe('parseCharacter', …)` block in `src/storage/schema.test.ts`:

```ts
  it('round-trips an android', () => {
    const android = validCharacter({ kind: 'android', androidBonus: ['strength', 'wits'] })
    expect(parseCharacter(android)).toEqual({ ok: true, value: android })
  })

  it('rejects a character without kind', () => {
    const withoutKind: Partial<Character> = validCharacter()
    delete withoutKind.kind
    expect(parseCharacter(withoutKind)).toEqual({
      ok: false,
      error: expect.stringContaining('kind'),
    })
  })

  it('rejects an unknown bonus attribute', () => {
    const result = parseCharacter({ ...validCharacter(), androidBonus: ['luck'] })
    expect(result).toEqual({ ok: false, error: expect.stringContaining('androidBonus') })
  })
```

Add to the `describe('RULES', …)` block in `src/domain/rules.test.ts` (import `RULES_LIMITS`
from `./rules` if not already imported):

```ts
  it('caps android attributes at 8 for the key attribute and 7 for the others', () => {
    expect(RULES_LIMITS.keyAttributeMax + RULES_LIMITS.androidAttributeBonus).toBe(8)
    expect(RULES_LIMITS.attributeMax + RULES_LIMITS.androidAttributeBonus).toBe(7)
    expect(RULES_LIMITS.androidBonusAttributes).toBe(2)
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `$N24 npx vitest run src/storage/schema.test.ts src/domain/rules.test.ts`
Expected: FAIL (type errors are not reported by Vitest; the failures are the missing
`androidAttributeBonus` → `NaN`, and the schema stripping/ignoring `kind`).

- [ ] **Step 3: Implement**

`src/domain/types.ts` — after the `SEXES` line add:

```ts
export type Kind = 'human' | 'android'

export const KINDS: readonly Kind[] = ['human', 'android']
```

In `RuleLimits`, after `startingReloads: number` add:

```ts
  androidAttributeBonus: number
  androidBonusAttributes: number
```

In `Character`, after `sex: Sex` add:

```ts
  kind: Kind
  /** Attributes that get the android bonus; always empty for a human. */
  androidBonus: Attribute[]
```

`src/domain/rules.ts` — in `RULES_LIMITS`, after `startingReloads: 2,` add:

```ts
  androidAttributeBonus: 3,
  androidBonusAttributes: 2,
```

`src/domain/character.ts` and `src/domain/testing.ts` — after `sex: …,` add:

```ts
    kind: 'human',
    androidBonus: [],
```

`src/storage/schema.ts` — after `sex: z.enum(['female', 'male']),` add:

```ts
  kind: z.enum(['human', 'android']),
  androidBonus: z.array(z.enum(['strength', 'agility', 'wits', 'empathy'])),
```

`src/generator/generate.ts` — in the `generated` object, after `sex,` add (Task 4 replaces this
with the real roll):

```ts
    kind: locked.kind ?? 'human',
    androidBonus: [],
```

- [ ] **Step 4: Run tests and typecheck**

Run: `$N24 npm run typecheck && $N24 npm test`
Expected: typecheck clean (the schema/type compile check passes); all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/storage src/generator/generate.ts
git commit -m "feat: add character kind and android bonus to the data model" -m "Refs #19" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Effective attributes and Health

**Files:**
- Modify: `src/domain/derived.ts`, `src/domain/validation.test.ts:3,144-148`,
  `src/ui/CharacterEditor.tsx:258`, `src/ui/CharacterSheet.tsx:92`
- Create: `src/domain/derived.test.ts`

**Interfaces:**
- Consumes: Task 1 types.
- Produces:
  `effectiveAttributes(c: Pick<Character, 'attributes' | 'kind' | 'androidBonus'>, rules: Rules): Record<Attribute, number>`;
  `health(c: Pick<Character, 'attributes' | 'kind' | 'androidBonus'>, rules: Rules): number`.

- [ ] **Step 1: Write the failing test**

Create `src/domain/derived.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { effectiveAttributes, health } from './derived'
import { TEST_RULES as R, validCharacter } from './testing'

const android = validCharacter({ kind: 'android', androidBonus: ['strength', 'wits'] })

describe('effectiveAttributes', () => {
  it('returns the base values for a human', () => {
    const c = validCharacter()
    expect(effectiveAttributes(c, R)).toEqual(c.attributes)
  })

  it('adds the android bonus to the chosen attributes', () => {
    expect(effectiveAttributes(android, R)).toEqual({
      strength: 8,
      agility: 3,
      wits: 6,
      empathy: 3,
    })
  })

  it('ignores a bonus left on a human', () => {
    const c = validCharacter({ androidBonus: ['strength'] })
    expect(effectiveAttributes(c, R)).toEqual(c.attributes)
  })
})

describe('health', () => {
  it('equals strength', () => {
    expect(health(validCharacter(), R)).toBe(5)
  })

  it('uses the android bonus to strength', () => {
    expect(health(android, R)).toBe(8)
  })
})
```

In `src/domain/validation.test.ts` delete the `describe('health', …)` block (lines 144–148) and
the `import { health } from './derived'` line.

- [ ] **Step 2: Run test to verify it fails**

Run: `$N24 npx vitest run src/domain/derived.test.ts`
Expected: FAIL — `effectiveAttributes` is not exported.

- [ ] **Step 3: Implement**

Replace `src/domain/derived.ts` with:

```ts
import type { Attribute, Character, Rules } from './types'
import { ATTRIBUTES } from './types'

type WithAttributes = Pick<Character, 'attributes' | 'kind' | 'androidBonus'>

/** Base attributes plus the android bonus. Derived, never stored. */
export function effectiveAttributes(c: WithAttributes, rules: Rules): Record<Attribute, number> {
  const bonus = (a: Attribute) =>
    c.kind === 'android' && c.androidBonus.includes(a) ? rules.limits.androidAttributeBonus : 0
  return Object.fromEntries(ATTRIBUTES.map((a) => [a, c.attributes[a] + bonus(a)])) as Record<
    Attribute,
    number
  >
}

/** Health equals effective Strength. Derived, never stored. */
export function health(c: WithAttributes, rules: Rules): number {
  return effectiveAttributes(c, rules).strength
}
```

Update the two call sites:
- `src/ui/CharacterEditor.tsx:258`: `health(draft)` → `health(draft, RULES)`
- `src/ui/CharacterSheet.tsx:92`: `health(c)` → `health(c, RULES)`

- [ ] **Step 4: Run tests and typecheck**

Run: `$N24 npm run typecheck && $N24 npx vitest run src/domain`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/ui/CharacterEditor.tsx src/ui/CharacterSheet.tsx
git commit -m "feat: derive effective attributes and health with the android bonus" -m "Refs #19" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Validate the android bonus

**Files:**
- Modify: `src/domain/validation.ts`, `src/i18n/en.ts`, `src/i18n/pl.ts`
- Test: `src/domain/validation.test.ts`

**Interfaces:**
- Consumes: Task 1 types and limits.
- Produces: `IssueCode` gains `'androidBonus.count' | 'androidBonus.human'`;
  `validateAndroid(c: Pick<Character, 'kind' | 'androidBonus'>, rules: Rules): ValidationIssue[]`,
  issues on field `'androidBonus'`. `validateCharacter` includes it.

- [ ] **Step 1: Write the failing tests**

Add `validateAndroid` to the import from `./validation` in `src/domain/validation.test.ts`, then
append:

```ts
describe('validateAndroid', () => {
  const android = (androidBonus: Character['androidBonus']) =>
    validCharacter({ kind: 'android', androidBonus })

  it('accepts an android with two distinct bonus attributes', () => {
    expect(validateCharacter(android(['strength', 'wits']), R)).toEqual([])
  })

  it('reports the same record as a human', () => {
    const human = validCharacter({ kind: 'human', androidBonus: ['strength', 'wits'] })
    expect(validateCharacter(human, R)).toEqual([
      { field: 'androidBonus', message: 'androidBonus.human' },
    ])
  })

  it('reports the effective android values entered as a human', () => {
    const human = withAttrs({ strength: 8, wits: 6 })
    expect(codes(validateAttributes(human, R))).toEqual([
      'attribute.aboveMax',
      'attribute.aboveMax',
      'attributes.total',
    ])
  })

  it('requires exactly two distinct bonus attributes', () => {
    for (const bonus of [
      [],
      ['strength'],
      ['strength', 'wits', 'empathy'],
      ['strength', 'strength'],
    ] as Character['androidBonus'][]) {
      expect(validateAndroid(android(bonus), R), bonus.join(',')).toEqual([
        { field: 'androidBonus', message: 'androidBonus.count', params: { expected: 2 } },
      ])
    }
  })

  it('accepts a human without bonus', () => {
    expect(validateAndroid(validCharacter(), R)).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$N24 npx vitest run src/domain/validation.test.ts`
Expected: FAIL — `validateAndroid` is not a function.

- [ ] **Step 3: Implement**

`src/domain/validation.ts` — add to `IssueCode` after `| 'cash.invalid'`:

```ts
  | 'androidBonus.count'
  | 'androidBonus.human'
```

Add after `validateCash`:

```ts
export function validateAndroid(
  c: Pick<Character, 'kind' | 'androidBonus'>,
  rules: Rules,
): ValidationIssue[] {
  if (c.kind === 'human') {
    return c.androidBonus.length > 0 ? [{ field: 'androidBonus', message: 'androidBonus.human' }] : []
  }
  const expected = rules.limits.androidBonusAttributes
  const distinct = new Set(c.androidBonus).size
  return distinct === expected && c.androidBonus.length === expected
    ? []
    : [{ field: 'androidBonus', message: 'androidBonus.count', params: { expected } }]
}
```

Add `...validateAndroid(c, rules),` to `validateCharacter` after `...validateAttributes(c, rules),`.

`src/i18n/en.ts` — after `'validation.cash.invalid'` add:

```ts
  'validation.androidBonus.count': 'Choose exactly {expected} different attributes for the +3 bonus.',
  'validation.androidBonus.human': 'Only an android gets the attribute bonus.',
```

`src/i18n/pl.ts` — after `'validation.cash.invalid'` add:

```ts
  'validation.androidBonus.count': 'Wybierz dokładnie {expected} różne atrybuty do premii +3.',
  'validation.androidBonus.human': 'Premię do atrybutów dostaje tylko android.',
```

- [ ] **Step 4: Run tests**

Run: `$N24 npm run typecheck && $N24 npm test`
Expected: all PASS (including `i18n.test.ts` key parity and the 1000-seed generator test, since
generated humans have `androidBonus: []`).

- [ ] **Step 5: Commit**

```bash
git add src/domain/validation.ts src/domain/validation.test.ts src/i18n
git commit -m "feat: validate the android attribute bonus" -m "Refs #19" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Generator support for androids

**Files:**
- Modify: `src/generator/generate.ts`
- Test: `src/generator/generate.test.ts`

**Interfaces:**
- Consumes: Task 1 types/limits; Task 3 `validateCharacter` (now includes `validateAndroid`).
- Produces: `generateCharacter` takes `kind` from `locked.kind` (default `'human'`). For an
  android it fills `androidBonus` with `androidBonusAttributes` distinct attributes and sets
  `signatureItem: ''`. `rerollSections` re-rolls `androidBonus` whenever `attributes` is re-rolled
  (including through a career re-roll). `Section` and `SECTIONS` are unchanged.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('generateCharacter', …)` in `src/generator/generate.test.ts`:

```ts
  it('generates humans by default', () => {
    for (let seed = 0; seed < 50; seed++) {
      const c = generateCharacter({ seed, rules: TEST_RULES })
      expect(c.kind).toBe('human')
      expect(c.androidBonus).toEqual([])
    }
  })

  it('generates valid androids when kind is locked', () => {
    for (let seed = 0; seed < 500; seed++) {
      const c = generateCharacter({ seed, rules: RULES, locked: { kind: 'android' } })
      expect(c.kind).toBe('android')
      expect(new Set(c.androidBonus).size).toBe(2)
      expect(c.signatureItem).toBe('')
      expect(validateCharacter(c, RULES), `seed ${seed}`).toEqual([])
    }
  })

  it('rolls the same human and the same other fields whether or not kind is android', () => {
    for (let seed = 0; seed < 50; seed++) {
      const human = generateCharacter({ seed, rules: TEST_RULES, locked: fixed })
      const android = generateCharacter({
        seed,
        rules: TEST_RULES,
        locked: { ...fixed, kind: 'android' },
      })
      const strip = (c: Character) => ({ ...c, kind: '', androidBonus: [], signatureItem: '' })
      expect(strip(android)).toEqual(strip(human))
    }
  })
```

Add a new `describe` at the end of the file:

```ts
describe('rerollSections with an android', () => {
  const base = validCharacter({
    kind: 'android',
    androidBonus: ['agility', 'empathy'],
    signatureItem: '',
  })
  const bonusChangedFor = (sections: Section[], keep: Section[] = []) => {
    let changed = 0
    for (let seed = 0; seed < 50; seed++) {
      const c = rerollSections(base, sections, { seed, rules: TEST_RULES, keep })
      expect(c.kind).toBe('android')
      expect(new Set(c.androidBonus).size).toBe(2)
      if (c.androidBonus.join() !== base.androidBonus.join()) changed++
    }
    return changed
  }

  it('re-rolls the bonus with the attributes', () => {
    expect(bonusChangedFor(['attributes'])).toBeGreaterThan(0)
  })

  it('re-rolls the bonus with the career', () => {
    expect(bonusChangedFor(['careerId'])).toBeGreaterThan(0)
  })

  it('keeps the bonus when attributes are kept', () => {
    expect(bonusChangedFor([...SECTIONS], ['attributes'])).toBe(0)
  })

  it('keeps an android without a signature item on randomize all', () => {
    const c = rerollSections(base, SECTIONS, { seed: 3, rules: TEST_RULES })
    expect(c.signatureItem).toBe('')
  })

  it('never turns a human into an android', () => {
    const human = validCharacter()
    for (let seed = 0; seed < 50; seed++) {
      const c = rerollSections(human, SECTIONS, { seed, rules: TEST_RULES })
      expect(c.kind).toBe('human')
      expect(c.androidBonus).toEqual([])
    }
  })
})
```

Update the imports at the top of the test file:
- `import type { Character, Rules } from '../domain/types'`
- `import { SECTIONS, generateCharacter, rerollSections, type Section } from './generate'`

- [ ] **Step 2: Run test to verify it fails**

Run: `$N24 npx vitest run src/generator/generate.test.ts`
Expected: FAIL — androids get `androidBonus: []` and a signature item.

- [ ] **Step 3: Implement**

`src/generator/generate.ts`:

1. After `const sex = locked.sex ?? rolledSex` add:

```ts
  const kind = locked.kind ?? 'human'
```

2. Replace `const signatureItem = text(general.signatureItem, careerTable?.signatureItem)` with:

```ts
  const rolledSignatureItem = text(general.signatureItem, careerTable?.signatureItem)
  const rolledBonus = sample(rng, ATTRIBUTES, rules.limits.androidBonusAttributes)
  const signatureItem = kind === 'android' ? '' : rolledSignatureItem
  const androidBonus = kind === 'android' ? rolledBonus : []
```

The bonus is rolled last and always, so a human rolls exactly what it rolled before this
feature, and an android differs from the same-seed human only in these fields.

3. In the `generated` object replace the Task 1 placeholder lines with:

```ts
    kind,
    androidBonus,
```

4. In `rerollSections`, after the `SEX_DEPENDENT` line add:

```ts
  if (reroll.has('attributes')) delete locked.androidBonus
```

(The existing loop deletes `locked[s]` for each re-rolled section; `androidBonus` is not a
section, so it needs this explicit delete. A career re-roll adds `attributes` to `reroll` first,
so it is covered too.)

- [ ] **Step 4: Run tests**

Run: `$N24 npm run typecheck && $N24 npm test`
Expected: all PASS, including the existing "same seed" and 1000-seed tests.

- [ ] **Step 5: Commit**

```bash
git add src/generator
git commit -m "feat: generate androids when the kind is set" -m "Refs #19" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Editor — type toggle and bonus picker

**Files:**
- Modify: `src/ui/CharacterEditor.tsx`, `src/i18n/en.ts`, `src/i18n/pl.ts`

**Interfaces:**
- Consumes: `KINDS`, `effectiveAttributes` (Task 2), `issuesFor(issues, 'androidBonus')`
  (Task 3), `RULES.limits.androidAttributeBonus` / `androidBonusAttributes`.

UI components have no tests in this project; verification is typecheck, lint, and the manual
check in Task 7.

- [ ] **Step 1: Add i18n keys**

`src/i18n/en.ts`, after `'sex.male': 'Male',`:

```ts
  'section.kind': 'Type',
  'kind.human': 'Human',
  'kind.android': 'Android',
```

After `'editor.cashRoll': …`:

```ts
  'editor.androidBonus': '+{bonus}',
  'editor.androidBonusLabel': 'Android bonus +{bonus} to {attribute}',
```

`src/i18n/pl.ts`, after `'sex.male': 'Mężczyzna',`:

```ts
  'section.kind': 'Typ',
  'kind.human': 'Człowiek',
  'kind.android': 'Android',
```

After `'editor.cashRoll': …`:

```ts
  'editor.androidBonus': '+{bonus}',
  'editor.androidBonusLabel': 'Premia androida +{bonus} do: {attribute}',
```

- [ ] **Step 2: Imports and derived values**

In `src/ui/CharacterEditor.tsx`:
- `import { effectiveAttributes, health } from '../domain/derived'`
- `import type { Attribute, Character, Kind } from '../domain/types'`
- `import { ATTRIBUTES, KINDS, SEXES, SKILLS } from '../domain/types'`

After `const skillLeft = remainingSkillPoints(draft, RULES)` add:

```tsx
  const isAndroid = draft.kind === 'android'
  const effective = effectiveAttributes(draft, RULES)
  const { androidAttributeBonus: bonus, androidBonusAttributes: bonusCount } = RULES.limits
  const setKind = (kind: Kind) =>
    update(kind === 'android' ? { kind, signatureItem: '' } : { kind, androidBonus: [] })
  const toggleBonus = (a: Attribute) =>
    update({
      androidBonus: draft.androidBonus.includes(a)
        ? draft.androidBonus.filter((x) => x !== a)
        : [...draft.androidBonus, a],
    })
  const textSections = TEXT_SECTIONS.filter((s) => !(isAndroid && s === 'signatureItem'))
```

- [ ] **Step 3: Type toggle**

Directly after the sex `radio-row` `</div>` (before `{header('careerId')}`) insert:

```tsx
          <h3>{t('section.kind')}</h3>
          <div class="radio-row" role="radiogroup" aria-label={t('section.kind')}>
            {KINDS.map((k) => (
              <label key={k}>
                <input
                  type="radio"
                  name="kind"
                  value={k}
                  checked={draft.kind === k}
                  onChange={() => setKind(k)}
                />{' '}
                {t(`kind.${k}`)}
              </label>
            ))}
          </div>
```

- [ ] **Step 4: Bonus picker in the attributes table**

In the attribute row, after `<IssueList issues={fieldIssues} />` inside `<td>`, insert:

```tsx
                      {isAndroid && (
                        <label class="android-bonus">
                          <input
                            type="checkbox"
                            checked={draft.androidBonus.includes(a)}
                            disabled={
                              !draft.androidBonus.includes(a) &&
                              draft.androidBonus.length >= bonusCount
                            }
                            aria-label={t('editor.androidBonusLabel', {
                              bonus,
                              attribute: loc(RULES.attributes[a].label),
                            })}
                            onChange={() => toggleBonus(a)}
                          />{' '}
                          {t('editor.androidBonus', { bonus })} → <strong>{effective[a]}</strong>
                        </label>
                      )}
```

After the existing `<IssueList issues={issuesFor(issues, 'attributes')} />` add:

```tsx
          <IssueList issues={issuesFor(issues, 'androidBonus')} />
```

- [ ] **Step 5: Hide the signature item for androids**

Replace `{TEXT_SECTIONS.map((s) => (` with `{textSections.map((s) => (`.

- [ ] **Step 6: Style**

Append to `src/styles/app.css`:

```css
.android-bonus {
  margin-left: 8px;
  white-space: nowrap;
}
```

- [ ] **Step 7: Verify**

Run: `$N24 npm run typecheck && $N24 npm test && $N24 npm run lint`
Expected: all pass. If Prettier complains, run `$N24 npm run format` and re-run lint.

- [ ] **Step 8: Commit**

```bash
git add src/ui/CharacterEditor.tsx src/i18n src/styles/app.css
git commit -m "feat: android toggle and bonus picker in the editor" -m "Refs #19" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Sheet — badge, effective values, play rules

**Files:**
- Modify: `src/ui/CharacterSheet.tsx`, `src/i18n/en.ts`, `src/i18n/pl.ts`

**Interfaces:**
- Consumes: `effectiveAttributes`, `health(c, RULES)` (Task 2); `kind.android` key (Task 5).

- [ ] **Step 1: Add i18n keys**

`src/i18n/en.ts`, after `'sheet.cash': '{amount} $',`:

```ts
  'sheet.androidRules': 'Android',
  'sheet.androidRulesText':
    'Cannot push skill rolls. Never makes Panic Rolls. Takes damage differently (p. 111).',
```

`src/i18n/pl.ts`, after `'sheet.cash': …`:

```ts
  'sheet.androidRules': 'Android',
  'sheet.androidRulesText':
    'Nie może forsować rzutów. Nigdy nie wykonuje rzutów na panikę. Inaczej otrzymuje obrażenia (s. 111).',
```

- [ ] **Step 2: Update `SheetCard`**

In `src/ui/CharacterSheet.tsx`:
- `import { effectiveAttributes, health } from '../domain/derived'`
- In `SheetCard`, after `const gear = cleanGear(c.gear)` add:

```tsx
  const isAndroid = c.kind === 'android'
  const attributes = effectiveAttributes(c, RULES)
```

- In the header, after `{isDraft && <span class="badge draft">{t('list.draft')}</span>}` add:

```tsx
        {isAndroid && <span class="badge">{t('kind.android')}</span>}
```

- In the attribute head replace `<strong>{c.attributes[a]}</strong>` with
  `<strong>{attributes[a]}</strong>`.
- Replace the signature item field with:

```tsx
        {!isAndroid && (
          <SheetField label={t('section.signatureItem')}>{c.signatureItem || '—'}</SheetField>
        )}
```

- Before the `{c.notes.trim() !== '' && (` block add:

```tsx
        {isAndroid && (
          <SheetField label={t('sheet.androidRules')} wide>
            {t('sheet.androidRulesText')}
          </SheetField>
        )}
```

- [ ] **Step 3: Verify**

Run: `$N24 npm run typecheck && $N24 npm test && $N24 npm run lint`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/ui/CharacterSheet.tsx src/i18n
git commit -m "feat: show android characters on the sheet" -m "Refs #19" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Manual check in the app

- [ ] **Step 1: Build**

Run: `$N24 npm run build`
Expected: success.

- [ ] **Step 2: Run the app and check** (`$N24 npm run dev`, http://localhost:5173)

1. New character: Type defaults to Human; no +3 checkboxes; signature item visible.
2. Switch to Android: +3 checkboxes appear; signature item field disappears and is emptied;
   the "choose exactly 2" issue shows until two are ticked; a third checkbox is disabled.
3. Randomize all: stays Android, two bonuses ticked, no signature item, no draft badge.
   Health shows effective Strength.
4. Switch back to Human: checkboxes gone, bonus cleared (no `androidBonus.human` issue).
5. Save an android, open its sheet: Android badge, effective attribute values, no signature
   item, play-rules note. Print preview shows the same. Switch language to PL and recheck labels.

- [ ] **Step 3: Report** results; fix anything found in the task that owns the code.
