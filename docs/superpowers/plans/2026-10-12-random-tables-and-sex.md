# Random Tables and Character Sex Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every character a sex (female/male), and generate names and narrative fields from per-career rulebook tables plus a larger general pool, with Polish text in the right grammatical gender.

**Architecture:** `Character.sex` is a new required field in schema v1. The generator rolls it as a lockable section; re-rolling it also re-rolls the name. `tables.ts` holds per-language `general` and per-career tables. A pure `resolveGender` turns `{masculine|feminine}` markers into plain text when the generator picks an entry.

**Tech Stack:** TypeScript, Preact, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-12-random-tables-and-sex-design.md`

## Global Constraints

- Run every command with Node 24: `export PATH=$HOME/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH` (the default `node` is v18 and breaks Vitest).
- After each task: `npm run typecheck && npm test && npm run lint`; all must pass before committing.
- `schemaVersion` stays `1`; no migration.
- Domain code (`domain/`, `generator/`, `storage/`) never imports from `ui/`.
- No hard-coded UI text in components; only keys from `src/i18n/`. `en.ts` defines the keys; `pl.ts` must have the same ones.
- No new dependencies.
- Code and commits in English. End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A female character must never get masculine or raw-marker Polish text. Every entry in every table must resolve cleanly for both sexes (Task 3, `tables.test.ts`).
2. A locked name must survive re-rolling the sex; an unlocked one must follow it (Task 4).
3. A character with no career, or with a career that has no table, must still get text from the general pool, never an empty string (Task 3).
4. A backup entry without `sex`, or with another value, must be rejected with a reason rather than crash the import (Task 1, `schema.test.ts`).
5. A malformed marker (`{a|b` or `{a|b|c}`) must be left as it is rather than corrupted; the tables test catches any such entry (Task 2).

---

### Task 1: `sex` field in the domain and the schema

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/character.ts:5-28`
- Modify: `src/domain/testing.ts` (`validCharacter`)
- Modify: `src/storage/schema.ts:8-38`
- Modify: `src/generator/generate.ts` (`generateCharacter`)
- Create: `src/storage/schema.test.ts`

**Interfaces:**
- Produces: `type Sex = 'female' | 'male'`, `const SEXES: readonly Sex[]` (from `src/domain/types.ts`); `Character.sex: Sex`.

- [ ] **Step 1: Write the failing schema test**

Create `src/storage/schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { validCharacter } from '../domain/testing'
import { parseCharacter } from './schema'

describe('parseCharacter', () => {
  it('accepts both sexes', () => {
    for (const sex of ['female', 'male'] as const) {
      const result = parseCharacter(validCharacter({ sex }))
      expect(result.ok).toBe(true)
    }
  })

  it('rejects a character without sex', () => {
    const { sex: _sex, ...rest } = validCharacter()
    const result = parseCharacter(rest)
    expect(result).toEqual({ ok: false, error: expect.stringContaining('sex') })
  })

  it('rejects an unknown sex', () => {
    const result = parseCharacter({ ...validCharacter(), sex: 'other' })
    expect(result).toEqual({ ok: false, error: expect.stringContaining('sex') })
  })
})
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/storage/schema.test.ts`
Expected: FAIL. Typecheck errors aside, `rejects a character without sex` passes parsing (`ok: true`).

- [ ] **Step 3: Add the type**

In `src/domain/types.ts`, after the `Localized` type:

```ts
export type Sex = 'female' | 'male'

export const SEXES: readonly Sex[] = ['female', 'male']
```

In `interface Character`, after `name: string`:

```ts
  sex: Sex
```

- [ ] **Step 4: Add it to the schema**

In `src/storage/schema.ts`, after `name: z.string(),`:

```ts
  sex: z.enum(['female', 'male']),
```

- [ ] **Step 5: Fill it in everywhere a Character is built**

`src/domain/character.ts`, after `name: '',`:

```ts
    sex: 'male',
```

`src/domain/testing.ts`, in `validCharacter` after `name: 'Ellen',`:

```ts
    sex: 'female',
```

`src/generator/generate.ts`: import `SEXES` from `'../domain/types'` (extend the existing `import { ATTRIBUTES, SKILLS } from '../domain/types'`). In `generateCharacter`, directly after `const rng = mulberry32(seed)`:

```ts
  const sex = pick(rng, SEXES)
```

and in the `generated` object after `name,`:

```ts
    sex,
```

(`definedOnly(locked)` already lets a locked `sex` win.)

- [ ] **Step 6: Run the checks**

Run: `npm run typecheck && npm test && npm run lint`
Expected: all pass, including the 3 new schema tests.

- [ ] **Step 7: Commit**

```bash
git add src/domain src/storage src/generator/generate.ts
git commit -m "feat: add sex to the character model"
```

---

### Task 2: `resolveGender`

**Files:**
- Create: `src/generator/gender.ts`
- Create: `src/generator/gender.test.ts`

**Interfaces:**
- Consumes: `Sex` from `src/domain/types.ts`.
- Produces: `resolveGender(text: string, sex: Sex): string` and `GENDER_MARKER: RegExp` (a global regex matching one `{masculine|feminine}` marker).

- [ ] **Step 1: Write the failing test**

Create `src/generator/gender.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveGender } from './gender'

describe('resolveGender', () => {
  it('picks the masculine form for male and the feminine form for female', () => {
    expect(resolveGender('pomogł{eś|aś}', 'male')).toBe('pomogłeś')
    expect(resolveGender('pomogł{eś|aś}', 'female')).toBe('pomogłaś')
  })

  it('resolves several markers in one string', () => {
    const text = 'Niechlujn{y|a} i rozczochran{y|a}'
    expect(resolveGender(text, 'female')).toBe('Niechlujna i rozczochrana')
  })

  it('allows whole words and an empty form', () => {
    expect(resolveGender('{wziąłeś|wzięłaś}', 'female')).toBe('wzięłaś')
    expect(resolveGender('ok{|!}', 'male')).toBe('ok')
  })

  it('leaves text without markers unchanged', () => {
    expect(resolveGender('Plain text', 'female')).toBe('Plain text')
  })

  it('leaves malformed markers unchanged', () => {
    expect(resolveGender('{a|b', 'male')).toBe('{a|b')
    expect(resolveGender('{a|b|c}', 'male')).toBe('{a|b|c}')
  })
})
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/generator/gender.test.ts`
Expected: FAIL, cannot resolve `./gender`.

- [ ] **Step 3: Implement**

Create `src/generator/gender.ts`:

```ts
import type { Sex } from '../domain/types'

/** One `{masculine|feminine}` marker, e.g. `pomogł{eś|aś}`. */
export const GENDER_MARKER = /\{([^{}|]*)\|([^{}|]*)\}/g

export function resolveGender(text: string, sex: Sex): string {
  return text.replace(GENDER_MARKER, (_, masculine: string, feminine: string) =>
    sex === 'male' ? masculine : feminine,
  )
}
```

- [ ] **Step 4: Run it and see it pass**

Run: `npx vitest run src/generator/gender.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/generator/gender.ts src/generator/gender.test.ts
git commit -m "feat: resolve Polish gender markers"
```

---

### Task 3: General and per-career tables, and the generator picking from them

**Files:**
- Modify: `src/generator/tables.ts` (replace the whole file)
- Create: `src/generator/tables-en.ts`
- Create: `src/generator/tables-pl.ts`
- Create: `src/generator/tables.test.ts`
- Modify: `src/generator/generate.ts` (`generateCharacter`, `pickOr`)
- Modify: `src/generator/generate.test.ts`
- Modify: `README.md` (the `src/generator/tables.ts` section)

**Interfaces:**
- Consumes: `Sex`, `SEXES`, `resolveGender`, `GENDER_MARKER`.
- Produces:
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
    names: Record<Sex, string[]>
    appearance: string[]
    personalAgenda: string[]
    signatureItem: string[]
  }
  interface LangTables {
    general: GeneralTables
    careers: Record<CareerId, CareerTables>
  }
  const TABLES: Record<Lang, LangTables>
  ```
  `GenerateOptions.tables` becomes `Record<Lang, LangTables>`.

- [ ] **Step 1: Write the failing tables test**

Create `src/generator/tables.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { RULES } from '../domain/rules'
import { LANGS, SEXES } from '../domain/types'
import { resolveGender } from './gender'
import { TABLES, type LangTables } from './tables'

function allEntries(t: LangTables): string[] {
  const g = t.general
  const careers = Object.values(t.careers).flatMap((c) => [
    ...c.names.female,
    ...c.names.male,
    ...c.appearance,
    ...c.personalAgenda,
    ...c.signatureItem,
  ])
  return [
    ...g.firstNames.female,
    ...g.firstNames.male,
    ...g.lastNames,
    ...g.appearance,
    ...g.personalAgenda,
    ...g.buddy,
    ...g.rival,
    ...g.signatureItem,
    ...careers,
  ]
}

describe('TABLES', () => {
  for (const lang of LANGS) {
    it(`has a non-empty table for every career (${lang})`, () => {
      for (const career of RULES.careers) {
        const c = TABLES[lang].careers[career.id]
        expect(c, career.id).toBeDefined()
        for (const list of [
          c?.names.female,
          c?.names.male,
          c?.appearance,
          c?.personalAgenda,
          c?.signatureItem,
        ]) {
          expect(list?.length, career.id).toBeGreaterThan(0)
        }
      }
    })

    it(`has the general pool sizes from the spec (${lang})`, () => {
      const g = TABLES[lang].general
      expect(g.firstNames.female.length).toBeGreaterThanOrEqual(15)
      expect(g.firstNames.male.length).toBeGreaterThanOrEqual(15)
      expect(g.lastNames.length).toBeGreaterThanOrEqual(20)
      for (const list of [g.appearance, g.personalAgenda, g.buddy, g.rival, g.signatureItem]) {
        expect(list.length).toBeGreaterThanOrEqual(10)
      }
    })

    it(`resolves every entry cleanly for both sexes (${lang})`, () => {
      for (const entry of allEntries(TABLES[lang])) {
        for (const sex of SEXES) {
          expect(resolveGender(entry, sex), entry).not.toMatch(/[{}|]/)
          expect(resolveGender(entry, sex).trim(), entry).not.toBe('')
        }
      }
    })
  }
})
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/generator/tables.test.ts`
Expected: FAIL; `LangTables` and `TABLES[lang].careers` don't exist.

- [ ] **Step 3: Replace `src/generator/tables.ts`**

```ts
import type { CareerId, Lang, Sex } from '../domain/types'
import { EN_TABLES } from './tables-en'
import { PL_TABLES } from './tables-pl'

/**
 * Random tables for narrative fields. Career tables come from the rulebook career pages;
 * general tables are original entries. Polish entries may use `{masculine|feminine}` markers.
 */
export interface GeneralTables {
  firstNames: Record<Sex, string[]>
  lastNames: string[]
  appearance: string[]
  personalAgenda: string[]
  buddy: string[]
  rival: string[]
  signatureItem: string[]
}

export interface CareerTables {
  /** Full names, "First Last". */
  names: Record<Sex, string[]>
  appearance: string[]
  personalAgenda: string[]
  signatureItem: string[]
}

export interface LangTables {
  general: GeneralTables
  careers: Record<CareerId, CareerTables>
}

export const TABLES: Record<Lang, LangTables> = { en: EN_TABLES, pl: PL_TABLES }
```

- [ ] **Step 4: Create `src/generator/tables-en.ts`**

```ts
import type { LangTables } from './tables'

export const EN_TABLES: LangTables = {
  general: {
    firstNames: {
      female: [
        'Ada', 'Bianca', 'Carmen', 'Dana', 'Ellen', 'Freya', 'Grace', 'Hana',
        'Imani', 'Jun', 'Kira', 'Lena', 'Marta', 'Noor', 'Tess',
      ],
      male: [
        'Ash', 'Bruno', 'Caleb', 'Dmitri', 'Elias', 'Felix', 'Gabriel', 'Hiro',
        'Isaac', 'Jonah', 'Kofi', 'Leon', 'Mateo', 'Reed', 'Tomas',
      ],
    },
    lastNames: [
      'Abara', 'Brandt', 'Cho', 'Delgado', 'Engel', 'Farrow', 'Hale', 'Kowal', 'Lindqvist',
      'Mbeki', 'Novak', 'Okafor', 'Park', 'Quinn', 'Rios', 'Sato', 'Tanaka', 'Varga',
      'Weller', 'Yilmaz',
    ],
    appearance: [
      'Shaved head, burn scar on the neck',
      'Tired eyes, coffee-stained jumpsuit',
      'Tall and wiry, never stops fidgeting',
      'Neat uniform, company pin polished',
      'Grease under the nails, rolled-up sleeves',
      'Old tattoo of a ship that no longer exists',
      'Braided hair, a chipped front tooth',
      'Pale from years under artificial light',
      'A hearing aid that whistles now and then',
      'Always wears a faded colony-league jacket',
    ],
    personalAgenda: [
      'Get home with enough credits to retire',
      'Find out what really happened on your last ship',
      'Keep a secret about your past buried',
      'Earn a promotion, whatever it takes',
      'Protect the youngest member of the crew',
      'Prove you are not to blame for the accident',
      'Pay off a debt before the lender comes to collect',
      'Get a message to someone you left behind on Earth',
      'Smuggle a small package through without anyone noticing',
      'Never be the one left behind',
    ],
    buddy: [
      'The crewmate who covered for you once',
      'An old friend from your training days',
      'The one who shares your cabin and your rations',
      'Someone who reminds you of family back home',
      'The crewmate who saved your life during a hull breach',
      'The one you play cards with every night shift',
      'Someone who owes you a favor and knows it',
      'A crewmate from your home colony',
      'The one who always listens',
      'The newest crew member, whom you took under your wing',
    ],
    rival: [
      'The crewmate who got the job you wanted',
      'Someone who knows about your debt',
      'The one who keeps second-guessing your calls',
      'An ex-partner you never quite forgave',
      'The one who reported you to the captain',
      'Someone who blames you for a friend’s death',
      'A crewmate who cheats at cards and wins',
      'The one who took credit for your work',
      'Someone who thinks you are a Company spy',
      'A crewmate you once left behind',
    ],
    signatureItem: [
      'A worn photograph',
      'A lucky coin',
      'A cheap wristwatch that still keeps time',
      'A battered paperback',
      'A child’s drawing',
      'A dog tag that is not yours',
      'A harmonica',
      'A pressed flower from Earth',
      'A pocket knife with your initials',
      'A tape of your mother’s voice',
    ],
  },
  careers: {
    colonialMarine: {
      names: {
        male: ['Marcus Mullaney', 'Nik Elson', 'Vic Pasengrau'],
        female: ['Kimi Diem', 'Tara Zanelli', 'Chrissy Lopez'],
      },
      appearance: [
        'Crew cut',
        'Tattoo on the arm',
        'Scar',
        'Cold stare',
        'Cocky grin',
        'Customized armor',
      ],
      personalAgenda: [
        'You are a decorated hero and must protect your reputation, no matter what.',
        'You once helped cover up a war crime – no one can ever find out.',
        'A friend’s death truly scared you – now you fear combat and confrontation, though you never show it. You must overcome the fear.',
      ],
      signatureItem: [
        'The bullet that didn’t kill you',
        'A fallen friend’s dog tag',
        'A trophy from a defeated enemy',
      ],
    },
    colonialMarshal: {
      names: {
        male: ['Jack Kitani', 'Barrell Klein', 'Ivan Mankov'],
        female: ['Akira Kano', 'Angela Harris', 'Lee-Ann Jenkins'],
      },
      appearance: [
        'Toothpick in the mouth',
        'Cigarette forever stuck to the lip',
        'Bushy mustache',
        'Worn cap',
        'Disfiguring facial scar',
        'Graying hair',
        'Crew cut',
        'Curious gaze',
        'Old leather jacket',
      ],
      personalAgenda: [
        'Your longtime partner betrayed you and joined a crime syndicate. Settle the score.',
        'You dream of handing in your badge and retiring. Earn it.',
        'You once did something bad, and the past won’t let you forget it. You must finally face it.',
      ],
      signatureItem: [
        'Photo of a loved one',
        'Dented hip flask with a print on the front',
        'Clipping about an unsolved case',
      ],
    },
    companyAgent: {
      names: {
        male: ['Conrad Schmidt', 'Alexander Balconi', 'Ryan Middlebrook'],
        female: ['Michiko Nogumi', 'Sheridan Lamara', 'Mercedes Prince'],
      },
      appearance: [
        'Icy stare',
        'Disarming smile',
        'Expensive watch',
        'Unique signet ring',
        'Tan',
        'Elaborate hairstyle',
        'Indifferent look',
        'Embossed silk tie',
      ],
      personalAgenda: [
        'You crave power and never miss a chance to grab more.',
        'The Company is hiding information from you. What? And why?',
        'You are a nice person, but the Company is blackmailing you into doing its dirty work. Settle the score.',
      ],
      signatureItem: [
        'Letter of Company authorization',
        'Divorce papers',
        'Employee of the year award',
      ],
    },
    kid: {
      names: {
        male: ['Chip Harrington', 'Hugo Turner', 'Jakey Myers'],
        female: ['Meggie Wu', 'Maisie Kelly', 'Becca David'],
      },
      appearance: [
        'Messy and disheveled',
        'Trendy light-up sneakers',
        'Jeans with holes in the knees',
        'T-shirt with a favorite band’s logo',
        'Work shorts',
        'Ponytail',
        'Bored expression',
        'Baseball cap',
      ],
      personalAgenda: [
        'You want to find a grown-up you could trust. Really trust…',
        'You lost your whole family. Make sure you are never alone again.',
        'Nobody gives you anything to do, so explore, experiment and find something to keep you busy.',
      ],
      signatureItem: [
        'Lunchbox covered in stickers',
        'Favorite doll or action figure',
        'Bracelet made by an older brother or sister',
      ],
    },
    medic: {
      names: {
        male: ['Cho Hadfield', 'Ken Ibana', 'Sullivan Ward'],
        female: ['Ana Kasnavik', 'Juno Blanchard', 'Katie Aberly'],
      },
      appearance: [
        'Sympathetic smile',
        'Short, neat hair',
        'Warm, caring look',
        'Bags under the eyes',
        'Restless hands',
        'Calm, gentle voice',
        'Cold, emotionless stare',
        'Glasses',
        'White coat',
      ],
      personalAgenda: [
        'You are addicted to a strong painkiller. Protect your supply… and your secret.',
        'You have unusual (and classified) medical records the Company is looking for. Find out why they matter so much.',
        'You swore you would never take a life, and you mean to keep that oath.',
      ],
      signatureItem: [
        'Forged medical diploma',
        'Letter from a son or daughter',
        'Latest psych evaluation: “Finally, everything is fine.”',
      ],
    },
    officer: {
      names: {
        male: ['Eugene Proctor', 'Oliver Bryant', 'Lloyd T. Darrington'],
        female: ['Wendy Stern', 'Julia Kwang', 'Camille Kirschner'],
      },
      appearance: [
        'Crew cut or hair tied back',
        'Serious expression',
        'Spotless uniform',
        'Overworked and exhausted',
        'Stiff posture',
        'Relaxed, soothing voice',
        'Jumpsuit with a patch',
        'Taps a foot when impatient',
      ],
      personalAgenda: [
        'You come from a family with a long officer tradition. You must earn a promotion or a medal – as soon as possible.',
        'Long ago you messed up. Avoid similar situations and never let anyone blame you for a failed mission.',
        'Mistakes are deadly, so you can’t let any of your subordinates screw up. Make sure they know exactly how you feel about it.',
      ],
      signatureItem: ['Ship’s cat', 'Letter of recommendation', 'Merchant officer’s license'],
    },
    pilot: {
      names: {
        male: ['Casper Edmonton', 'Sven Stackman', 'Kiel Avari'],
        female: ['Fiona O’Neill', 'Constance Navona', 'Igraine Turner'],
      },
      appearance: [
        'Arrogant swagger',
        'Steel-gray eyes',
        'Flight suit with lots of pockets',
        'Sunglasses',
        'Patches from past missions',
        'Dead-serious expression',
        'Chewing gum',
        'Skeptical look',
      ],
      personalAgenda: [
        'It’s all about pushing the limits. Trusting your luck. Taking risks. So do just that – take risks.',
        'You are stubborn and hate backing down, even if your friends might get hurt.',
        'You are a loner, happy when you can get the job done without relying on anyone.',
      ],
      signatureItem: ['Dashboard figurine', 'Pilot’s logbook', 'Aviator sunglasses'],
    },
    roughneck: {
      names: {
        male: ['Mac Masterton', 'Kip Tranter', 'Charlie Stead'],
        female: ['Sassy Diaz', 'Kat Longridge', 'Jayden Pace'],
      },
      appearance: [
        'Tattoos',
        'Scar',
        'Broken nose',
        'Dull eyes',
        'Smirk',
        'Booming laugh',
        'Work-worn, calloused hands',
        'Eyes hidden behind safety goggles',
        'Dirty boots that clomp when you walk',
        'Tousled hair',
      ],
      personalAgenda: [
        'You are a thrill junkie. If there is a risk to take, you volunteer.',
        'Long ago you sacrificed your family for the job. You have learned never to abandon your friends again. Never.',
        'Downtime matters. You are happy with a moment to yourself – just you and a can of Aspen beer (or Souta Dry, but only when you are truly desperate).',
      ],
      signatureItem: ['Tool belt', 'Photo of your partner', 'Cross or other religious symbol'],
    },
    scientist: {
      names: {
        male: ['Viggo Kowalski', 'Drew Lancaster', 'Travis Torrence'],
        female: ['Elena Sanchez', 'Louise Mallory', 'Karima Yusef'],
      },
      appearance: [
        'Sloppy, unkempt look',
        'Stained lab coat',
        'Nervous wreck',
        'Hands always shoved in pockets',
        'Neat, trimmed hair',
        'Pensive look',
        'Clears the throat before speaking',
        'Puffy, tired eyes',
      ],
      personalAgenda: [
        'Your last project was stolen from you. Now you keep many of your discoveries secret.',
        'You hate authority and will do anything to be as difficult to work with as possible.',
        'You find it hard to delegate, even when it means more work for you.',
      ],
      signatureItem: [
        'Albert Einstein Award',
        'Unfinished research paper',
        'Letters with blackmail material',
      ],
    },
  },
}
```

(Prettier reflows the name arrays one per line when it formats; that's fine.)

- [ ] **Step 5: Create `src/generator/tables-pl.ts`**

```ts
import type { LangTables } from './tables'

export const PL_TABLES: LangTables = {
  general: {
    firstNames: {
      female: [
        'Agata', 'Barbara', 'Dana', 'Ewa', 'Hanna', 'Iga', 'Joanna', 'Kaja',
        'Lena', 'Marta', 'Nora', 'Ola', 'Teresa', 'Weronika', 'Zofia',
      ],
      male: [
        'Adam', 'Bartosz', 'Damian', 'Eliasz', 'Filip', 'Jakub', 'Jonasz', 'Kacper',
        'Marek', 'Oskar', 'Paweł', 'Robert', 'Szymon', 'Tomasz', 'Wiktor',
      ],
    },
    lastNames: [
      'Baran', 'Brandt', 'Cho', 'Delgado', 'Duda', 'Hale', 'Kaczmarek', 'Kowal', 'Król',
      'Kubiak', 'Lis', 'Mazur', 'Nowak', 'Okafor', 'Quinn', 'Sowa', 'Varga', 'Wieczorek',
      'Wójcik', 'Zając',
    ],
    appearance: [
      'Ogolona głowa, blizna po oparzeniu na szyi',
      'Zmęczone oczy, kombinezon poplamiony kawą',
      'Wysok{i|a} i żylast{y|a}, nie potrafi usiedzieć w miejscu',
      'Schludny mundur, wypolerowana odznaka firmy',
      'Smar pod paznokciami, podwinięte rękawy',
      'Stary tatuaż statku, który już nie istnieje',
      'Zaplecione włosy, wyszczerbiony przedni ząb',
      'Blad{y|a} od lat spędzonych w sztucznym świetle',
      'Aparat słuchowy, który co jakiś czas piszczy',
      'Zawsze w spłowiałej kurtce kolonialnej ligi',
    ],
    personalAgenda: [
      'Wrócić do domu z kredytami na emeryturę',
      'Dowiedzieć się, co naprawdę stało się na poprzednim statku',
      'Ukryć tajemnicę ze swojej przeszłości',
      'Zdobyć awans za wszelką cenę',
      'Chronić najmłodszego członka załogi',
      'Udowodnić, że wypadek nie był twoją winą',
      'Spłacić dług, zanim wierzyciel się o niego upomni',
      'Przekazać wiadomość komuś, kogo zostawił{eś|aś} na Ziemi',
      'Przemycić niewielką paczkę tak, by nikt nie zauważył',
      'Nigdy nie zostać {tym|tą}, kogo zostawiono w tyle',
    ],
    buddy: [
      'Członek załogi, który kiedyś cię krył',
      'Stary znajomy z czasów szkolenia',
      'Ktoś, z kim dzielisz kajutę i racje żywnościowe',
      'Osoba, która przypomina ci rodzinę',
      'Członek załogi, który uratował ci życie podczas rozszczelnienia kadłuba',
      'Ten, z kim grasz w karty na każdej nocnej zmianie',
      'Ktoś, kto jest ci winien przysługę i dobrze o tym wie',
      'Członek załogi z twojej rodzinnej kolonii',
      'Ten, kto zawsze cię wysłucha',
      'Najnowszy członek załogi, którego {wziąłeś|wzięłaś} pod swoje skrzydła',
    ],
    rival: [
      'Członek załogi, który dostał posadę, o którą się starał{eś|aś}',
      'Ktoś, kto wie o twoim długu',
      'Ten, kto ciągle podważa twoje decyzje',
      'Dawny partner, któremu nigdy nie wybaczył{eś|aś}',
      'Ten, kto doniósł na ciebie kapitanowi',
      'Ktoś, kto obwinia cię o śmierć przyjaciela',
      'Członek załogi, który oszukuje w karty i wygrywa',
      'Ten, kto przypisał sobie twoją pracę',
      'Ktoś, kto uważa cię za szpiega Firmy',
      'Członek załogi, którego kiedyś zostawił{eś|aś} w tyle',
    ],
    signatureItem: [
      'Wytarta fotografia',
      'Moneta na szczęście',
      'Tani zegarek, który wciąż chodzi',
      'Sfatygowana książka',
      'Rysunek dziecka',
      'Cudzy nieśmiertelnik',
      'Harmonijka ustna',
      'Zasuszony kwiat z Ziemi',
      'Scyzoryk z twoimi inicjałami',
      'Taśma z głosem twojej matki',
    ],
  },
  careers: {
    colonialMarine: {
      names: {
        male: ['Marcus Mullaney', 'Nik Elson', 'Vic Pasengrau'],
        female: ['Kimi Diem', 'Tara Zanelli', 'Chrissy Lopez'],
      },
      appearance: [
        'Fryzura na jeża',
        'Tatuaż na ramieniu',
        'Blizna',
        'Zimne spojrzenie',
        'Zawadiacki uśmiech',
        'Spersonalizowany pancerz',
      ],
      personalAgenda: [
        'Jesteś odznaczon{ym|ą} bohater{em|ką} i musisz chronić swoją reputację. Bez względu na wszystko.',
        'Kiedyś pomogł{eś|aś} zatuszować zbrodnię wojenną – nikt nie może się o tym dowiedzieć.',
        'Śmierć twojego przyjaciela naprawdę cię przeraziła – teraz boisz się walki i konfrontacji, choć nie dajesz tego po sobie poznać. Musisz pokonać strach.',
      ],
      signatureItem: [
        'Nabój, który cię nie zabił',
        'Nieśmiertelnik poległego przyjaciela',
        'Trofeum po pokonanym wrogu',
      ],
    },
    colonialMarshal: {
      names: {
        male: ['Jack Kitani', 'Barrell Klein', 'Ivan Mankov'],
        female: ['Akira Kano', 'Angela Harris', 'Lee-Ann Jenkins'],
      },
      appearance: [
        'Wykałaczka w ustach',
        'Papieros wiecznie przyklejony do wargi',
        'Bujne wąsy',
        'Znoszona czapka',
        'Blizna szpecąca twarz',
        'Siwiejące włosy',
        'Fryzura na jeża',
        'Ciekawskie spojrzenie',
        'Stara skórzana kurtka',
      ],
      personalAgenda: [
        'Twój długoletni partner zdradził cię i przeszedł na stronę syndykatu przestępczego. Wyrównaj rachunki.',
        'Marzysz o oddaniu odznaki i przejściu w stan spoczynku. Zapracuj na to.',
        'Zdarzyło ci się zrobić coś złego i dziś przeszłość nie daje o sobie zapomnieć. Musisz wreszcie się z nią zmierzyć.',
      ],
      signatureItem: [
        'Zdjęcie bliskiej osoby',
        'Pognieciona piersiówka z nadrukiem na przodzie',
        'Wycinek dotyczący nierozwiązanej sprawy',
      ],
    },
    companyAgent: {
      names: {
        male: ['Conrad Schmidt', 'Alexander Balconi', 'Ryan Middlebrook'],
        female: ['Michiko Nogumi', 'Sheridan Lamara', 'Mercedes Prince'],
      },
      appearance: [
        'Lodowate spojrzenie',
        'Rozbrajający uśmiech',
        'Drogi zegarek',
        'Wyjątkowy sygnet',
        'Opalenizna',
        'Wyszukana fryzura',
        'Obojętne spojrzenie',
        'Krawat z tłoczonego jedwabiu',
      ],
      personalAgenda: [
        'Jesteś żądn{y|a} władzy i nigdy nie marnujesz okazji, żeby sięgnąć po więcej.',
        'Firma ukrywa przed tobą informacje. Jakie? I dlaczego?',
        'Jesteś {miłym gościem|miłą osobą}, ale Firma szantażuje cię, zmuszając do wykonywania brudnej roboty. Wyrównaj rachunki.',
      ],
      signatureItem: [
        'List z firmowym upoważnieniem',
        'Papiery rozwodowe',
        'Nagroda dla pracownika roku',
      ],
    },
    kid: {
      names: {
        male: ['Chip Harrington', 'Hugo Turner', 'Jakey Myers'],
        female: ['Meggie Wu', 'Maisie Kelly', 'Becca David'],
      },
      appearance: [
        'Niechlujn{y|a} i rozczochran{y|a}',
        'Modne tenisówki z diodami',
        'Dżinsy z dziurami na kolanach',
        'T-shirt z logo ulubionej kapeli',
        'Krótkie spodnie robocze',
        'Kucyk',
        'Znudzony wyraz twarzy',
        'Czapka z daszkiem',
      ],
      personalAgenda: [
        'Chcesz znaleźć dorosłego, któremu mógł{byś|abyś} zaufać. Naprawdę zaufać…',
        'Stracił{eś|aś} całą rodzinę. Zadbaj o to, żeby już nigdy nie zostać {samemu|samej}.',
        'Nikt nie daje ci niczego do roboty, więc odkrywaj, eksperymentuj i szukaj sobie zajęcia.',
      ],
      signatureItem: [
        'Pudełko śniadaniowe oblepione naklejkami',
        'Ulubiona lalka albo figurka',
        'Bransoletka zrobiona przez starszego brata lub siostrę',
      ],
    },
    medic: {
      names: {
        male: ['Cho Hadfield', 'Ken Ibana', 'Sullivan Ward'],
        female: ['Ana Kasnavik', 'Juno Blanchard', 'Katie Aberly'],
      },
      appearance: [
        'Współczujący uśmiech',
        'Krótkie, zadbane włosy',
        'Ciepłe, troskliwe spojrzenie',
        'Worki pod oczami',
        'Niespokojne dłonie',
        'Spokojny i łagodny głos',
        'Zimne, pozbawione uczuć spojrzenie',
        'Okulary',
        'Biały fartuch',
      ],
      personalAgenda: [
        'Jesteś uzależnion{y|a} od mocnego środka przeciwbólowego. Chroń swoje zapasy… I tajemnicę.',
        'Znajdujesz się w posiadaniu niezwykłych (i utajnionych) sprawozdań medycznych, których poszukuje firma. Dowiedz się, czemu są tak ważne.',
        'Poprzysiągł{eś|aś} sobie, że nigdy nie pozbawisz nikogo życia, i masz zamiar się tego trzymać.',
      ],
      signatureItem: [
        'Podrobiony dyplom lekarski',
        'List od syna lub córki',
        'Ostatnia ocena psychologiczna: „Wreszcie wszystko jest w porządku”.',
      ],
    },
    officer: {
      names: {
        male: ['Eugene Proctor', 'Oliver Bryant', 'Lloyd T. Darrington'],
        female: ['Wendy Stern', 'Julia Kwang', 'Camille Kirschner'],
      },
      appearance: [
        'Fryzura na jeża lub włosy spięte z tyłu',
        'Poważny wyraz twarzy',
        'Nieskazitelnie czysty mundur',
        'Przepracowan{y|a} i wyczerpan{y|a}',
        'Sztywna postawa',
        'Relaksujący i kojący głos',
        'Kombinezon z naszywką',
        'Tupanie jako oznaka zniecierpliwienia',
      ],
      personalAgenda: [
        'Pochodzisz z rodziny o długich oficerskich tradycjach. Musisz otrzymać awans lub medal – tak szybko, jak to możliwe.',
        'Dawno temu dał{eś|aś} ciała. Unikaj podobnych sytuacji i nie pozwól nikomu na obciążenie cię odpowiedzialnością za niepowodzenie misji.',
        'Pomyłki mają zabójcze konsekwencje, dlatego nie możesz pozwolić, żeby ktokolwiek z twoich podwładnych skrewił. Upewnij się, że są w pełni świadomi twojego podejścia do tematu.',
      ],
      signatureItem: ['Kot pokładowy', 'List polecający', 'Licencja oficera statków handlowych'],
    },
    pilot: {
      names: {
        male: ['Casper Edmonton', 'Sven Stackman', 'Kiel Avari'],
        female: ['Fiona O’Neill', 'Constance Navona', 'Igraine Turner'],
      },
      appearance: [
        'Arogancki chód',
        'Stalowoszare oczy',
        'Kombinezon lotniczy z mnóstwem kieszeni',
        'Okulary przeciwsłoneczne',
        'Naszywki z poprzednich misji',
        'Śmiertelnie poważny wyraz twarzy',
        'Żucie gumy',
        'Sceptyczne spojrzenie',
      ],
      personalAgenda: [
        'Chodzi o przekraczanie granic. Zdawanie się na fart. Ryzykowanie. Więc rób właśnie to – ryzykuj.',
        'Jesteś upart{y|a} i nienawidzisz się wycofywać, nawet jeśli mogą ucierpieć twoi przyjaciele.',
        'Jesteś {samotnikiem, który czuje|samotniczką, która czuje} się szczęśliw{y|a}, kiedy może wykonać zadanie, nie polegając na innych.',
      ],
      signatureItem: ['Figurka z deski rozdzielczej', 'Dziennik pilota', 'Lustrzanki pilota'],
    },
    roughneck: {
      names: {
        male: ['Mac Masterton', 'Kip Tranter', 'Charlie Stead'],
        female: ['Sassy Diaz', 'Kat Longridge', 'Jayden Pace'],
      },
      appearance: [
        'Tatuaże',
        'Blizna',
        'Złamany nos',
        'Zgaszone spojrzenie',
        'Uśmieszek na twarzy',
        'Gromki śmiech',
        'Spracowane dłonie o stwardniałej skórze',
        'Oczy ukryte za okularami ochronnymi',
        'Brudne buciory, które głośno stukają, kiedy chodzisz',
        'Rozwichrzone włosy',
      ],
      personalAgenda: [
        'Jesteś uzależnion{y|a} od dreszczyku emocji. Jeśli można podjąć jakieś ryzyko, zgłaszasz się na ochotnika.',
        'Dawno temu poświęcił{eś|aś} rodzinę w imię pracy. Nauczył{eś|aś} się, aby nigdy więcej nie porzucić przyjaciół. Z naciskiem na „nigdy”.',
        'Odpoczynek jest ważny. Jesteś szczęśliw{y|a}, mając chwilę dla siebie. Tylko ty i puszka piwa Aspen (ewentualnie Souta Dry, ale tylko wtedy, gdy jesteś naprawdę zdesperowan{y|a}).',
      ],
      signatureItem: ['Pas monterski', 'Zdjęcie partnera', 'Krzyżyk albo inny symbol religijny'],
    },
    scientist: {
      names: {
        male: ['Viggo Kowalski', 'Drew Lancaster', 'Travis Torrence'],
        female: ['Elena Sanchez', 'Louise Mallory', 'Karima Yusef'],
      },
      appearance: [
        'Niechlujny, zaniedbany wygląd',
        'Poplamiony fartuch laboratoryjny',
        'Znerwicowan{y|a}',
        'Ręce niezmiennie wciśnięte w kieszenie',
        'Zadbane, przystrzyżone włosy',
        'Zamyślone spojrzenie',
        'Odchrząkujesz, zanim zaczniesz mówić',
        'Zapuchnięte, zmęczone oczy',
      ],
      personalAgenda: [
        'Okradziono cię z ostatniego projektu. Teraz trzymasz wiele ze swoich odkryć w tajemnicy.',
        'Nienawidzisz autorytetów i zrobisz wszystko, żeby być tak uciążliw{ym|ą} we współpracy, jak to tylko możliwe.',
        'Masz trudności z delegowaniem zadań, nawet jeśli oznacza to dla ciebie dodatkową pracę.',
      ],
      signatureItem: [
        'Nagroda Alberta Einsteina',
        'Niedokończona praca naukowa',
        'Listy z materiałami do szantażu',
      ],
    },
  },
}
```

- [ ] **Step 6: Run the tables test and see it pass**

Run: `npx vitest run src/generator/tables.test.ts`
Expected: PASS, 6 tests. Typecheck still fails in `generate.ts`; Step 8 fixes it.

- [ ] **Step 7: Write the failing generator tests**

In `src/generator/generate.test.ts`, add imports:

```ts
import type { LangTables } from './tables'
```

and append this `describe` block:

```ts
const career = (prefix: string) => ({
  names: { female: [`${prefix}F`], male: [`${prefix}M`] },
  appearance: [`${prefix}a`],
  personalAgenda: [`${prefix}p`],
  signatureItem: [`${prefix}s`],
})
const testLangTables: LangTables = {
  general: {
    firstNames: { female: ['GF'], male: ['GM'] },
    lastNames: ['L'],
    appearance: ['{ga-m|ga-f}'],
    personalAgenda: ['gp'],
    buddy: ['gb'],
    rival: ['gr'],
    signatureItem: ['gs'],
  },
  careers: { roughneck: career('C') },
}
const testTables = { en: testLangTables, pl: testLangTables }

describe('generateCharacter tables', () => {
  it('mixes career and general entries, with names matching the sex', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 200; seed++) {
      const c = generateCharacter({
        seed,
        rules: TEST_RULES,
        tables: testTables,
        locked: { careerId: 'roughneck' },
      })
      const expectedNames = c.sex === 'female' ? ['GF L', 'CF'] : ['GM L', 'CM']
      expect(expectedNames).toContain(c.name)
      seen.add(c.name)
      seen.add(c.appearance)
      expect(c.buddy).toBe('gb')
      expect(c.rival).toBe('gr')
    }
    for (const value of ['GF L', 'CF', 'GM L', 'CM', 'Ca', 'ga-m', 'ga-f']) {
      expect(seen, value).toContain(value)
    }
  })

  it('falls back to the general pool when the career has no table', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const careerId of ['scientist', '']) {
        const c = generateCharacter({ seed, rules: TEST_RULES, tables: testTables, locked: { careerId } })
        expect(['GF L', 'GM L']).toContain(c.name)
        expect(['ga-m', 'ga-f']).toContain(c.appearance)
        expect(c.personalAgenda).toBe('gp')
        expect(c.signatureItem).toBe('gs')
      }
    }
  })

  it('resolves gender markers for the rolled or locked sex', () => {
    for (let seed = 0; seed < 50; seed++) {
      const female = generateCharacter({
        seed,
        rules: TEST_RULES,
        tables: testTables,
        locked: { careerId: 'scientist', sex: 'female' },
      })
      expect(female.sex).toBe('female')
      expect(female.appearance).toBe('ga-f')
      expect(female.name).toBe('GF L')
    }
  })

  it('never leaves markers in text generated from the real tables', () => {
    for (let seed = 0; seed < 300; seed++) {
      const c = generateCharacter({ seed, lang: 'pl' })
      for (const text of [c.name, c.appearance, c.personalAgenda, c.buddy, c.rival, c.signatureItem]) {
        expect(text, `seed ${seed}`).not.toMatch(/[{}|]/)
        expect(text.trim(), `seed ${seed}`).not.toBe('')
      }
    }
  })
})
```

- [ ] **Step 8: Wire the generator to the new tables**

In `src/generator/generate.ts`:

1. Replace `import { TABLES, type RandomTables } from './tables'` with:

```ts
import { resolveGender } from './gender'
import { TABLES, type CareerTables, type GeneralTables, type LangTables } from './tables'
```

2. Add `Sex` to the type import from `'../domain/types'`.

3. In `GenerateOptions`, change `tables?: Record<Lang, RandomTables>` to:

```ts
  tables?: Record<Lang, LangTables>
```

4. In `generateCharacter`, replace `const table = tables[lang]` with:

```ts
  const { general, careers } = tables[lang]
```

and replace `const sex = pick(rng, SEXES)` (from Task 1) with the lines below. The roll stays unconditional so a locked sex doesn't shift later rolls, and text must use the locked sex, not the rolled one:

```ts
  const rolledSex = pick(rng, SEXES)
  const sex = locked.sex ?? rolledSex
```

5. Replace the six narrative lines (from `const name = ...` through `const signatureItem = ...`) with:

```ts
  const careerTable: CareerTables | undefined = careers[careerId]
  const text = (fromGeneral: readonly string[], fromCareer: readonly string[] | undefined) =>
    resolveGender(pickMixed(rng, fromGeneral, fromCareer), sex)
  const name = resolveGender(pickName(rng, general, careerTable, sex), sex)
  const appearance = text(general.appearance, careerTable?.appearance)
  const personalAgenda = text(general.personalAgenda, careerTable?.personalAgenda)
  const buddy = text(general.buddy, undefined)
  const rival = text(general.rival, undefined)
  const signatureItem = text(general.signatureItem, careerTable?.signatureItem)
```

6. Replace the `pickOr` function at the bottom with:

```ts
/** Always consumes exactly one random number, so an empty list does not shift later rolls. */
function pickOr(rng: Rng, items: readonly string[]): string {
  const r = rng()
  return items.length > 0 ? (items[Math.floor(r * items.length)] as string) : ''
}

/** Coin flip between the career list and the general list; general when the career has none. */
function pickMixed(
  rng: Rng,
  fromGeneral: readonly string[],
  fromCareer: readonly string[] | undefined,
): string {
  const useCareer = rng() < 0.5
  const general = pickOr(rng, fromGeneral)
  const career = pickOr(rng, fromCareer ?? [])
  return useCareer && career !== '' ? career : general
}

function pickName(
  rng: Rng,
  general: GeneralTables,
  career: CareerTables | undefined,
  sex: Sex,
): string {
  const generalName = `${pickOr(rng, general.firstNames[sex])} ${pickOr(rng, general.lastNames)}`
  return pickMixed(rng, [generalName.trim()], career?.names[sex])
}
```

- [ ] **Step 9: Run the checks**

Run: `npm run typecheck && npm test && npm run lint`
Expected: all pass, including the 4 new generator tests and the 1000-seed run. If lint fails only on formatting, run `npm run format` and re-run.

- [ ] **Step 10: Update the README**

In `README.md`, replace the `### src/generator/tables.ts` section body with:

```markdown
Random tables for names, appearance, personal agenda, buddy, rival and signature item, per
language. `tables-en.ts` and `tables-pl.ts` each hold a `general` pool (original entries) and a
`careers` table per career id, taken from the rulebook career pages. For names, appearance,
agenda and signature item the generator flips a coin between the career list and the general
pool; buddy and rival always come from the general pool.

Polish entries mark gendered words as `{masculine|feminine}`, e.g. `pomogł{eś|aś}`. The
generator picks the form for the character's sex. `src/generator/tables.test.ts` fails if any
entry leaves a marker behind.
```

- [ ] **Step 11: Commit**

```bash
git add src/generator README.md
git commit -m "feat: per-career and general random tables with Polish gender forms"
```

---

### Task 4: `sex` as a generator section that pulls the name along

**Files:**
- Modify: `src/generator/generate.ts` (`Section`, `SECTIONS`, `rerollSections`)
- Modify: `src/generator/generate.test.ts`

**Interfaces:**
- Produces: `'sex'` in `Section` and `SECTIONS`; `SEX_DEPENDENT: readonly Section[] = ['name']`.

- [ ] **Step 1: Write the failing tests**

Append to the `describe('rerollSections', ...)` block in `src/generator/generate.test.ts`:

```ts
  it('re-rolls the name with the sex unless the name is kept', () => {
    const base = validCharacter({ name: 'Kept Name', sex: 'female' })
    let nameChanged = false
    let sexChanged = false
    for (let seed = 0; seed < 50; seed++) {
      const kept = rerollSections(base, ['sex'], { seed, rules: TEST_RULES, keep: ['name'] })
      expect(kept.name).toBe('Kept Name')
      const free = rerollSections(base, ['sex'], { seed, rules: TEST_RULES })
      if (free.name !== base.name) nameChanged = true
      if (free.sex !== base.sex) sexChanged = true
      expect(free.careerId).toBe(base.careerId)
    }
    expect(nameChanged).toBe(true)
    expect(sexChanged).toBe(true)
  })

  it('keeps the sex when only the name is re-rolled', () => {
    const base = validCharacter({ sex: 'female' })
    for (let seed = 0; seed < 50; seed++) {
      expect(rerollSections(base, ['name'], { seed, rules: TEST_RULES }).sex).toBe('female')
    }
  })
```

- [ ] **Step 2: Run them and see them fail**

Run: `npx vitest run src/generator/generate.test.ts`
Expected: the first new test FAILS (`nameChanged` stays false, because `sex` is not yet a section that pulls the name along). The second may already pass, since `rerollSections` locks every field it doesn't re-roll; it stays as a guard against the name ever pulling the sex along.

- [ ] **Step 3: Implement**

In `src/generator/generate.ts`, add `| 'sex'` to `Section` right after `| 'name'`, and `'sex',` to `SECTIONS` right after `'name',`. Below `CAREER_DEPENDENT` add:

```ts
/** Fields that should follow the sex when it is re-rolled. */
export const SEX_DEPENDENT: readonly Section[] = ['name']
```

In `rerollSections`, after the `CAREER_DEPENDENT` line, add:

```ts
  if (reroll.has('sex')) for (const s of SEX_DEPENDENT) if (!keep.has(s)) reroll.add(s)
```

- [ ] **Step 4: Run the checks**

Run: `npm run typecheck && npm test && npm run lint`
Expected: all pass. The typecheck flags `src/ui/CharacterEditor.tsx` only if it does exhaustive work over `Section`; it doesn't today (it calls `t(\`section.${s}\`)` only for sections it renders). If `section.sex` is reported missing, it is Task 5's key; add it there and re-run.

- [ ] **Step 5: Commit**

```bash
git add src/generator
git commit -m "feat: make sex a lockable section that re-rolls the name"
```

---

### Task 5: Editor toggle, sheet field and translations

**Files:**
- Modify: `src/i18n/en.ts` (section keys)
- Modify: `src/i18n/pl.ts` (section keys)
- Modify: `src/ui/CharacterEditor.tsx` (name panel)
- Modify: `src/ui/CharacterSheet.tsx` (`SheetCard` header)
- Modify: `src/styles/app.css`

**Interfaces:**
- Consumes: `SEXES`, `Sex`, `'sex'` section.
- Produces: i18n keys `section.sex`, `sex.female`, `sex.male`.

- [ ] **Step 1: Add the keys**

`src/i18n/en.ts`, after `'section.name': 'Name',`:

```ts
  'section.sex': 'Sex',
  'sex.female': 'Female',
  'sex.male': 'Male',
```

`src/i18n/pl.ts`, after `'section.name': 'Imię',`:

```ts
  'section.sex': 'Płeć',
  'sex.female': 'Kobieta',
  'sex.male': 'Mężczyzna',
```

- [ ] **Step 2: Add the editor toggle**

In `src/ui/CharacterEditor.tsx`, change `import { ATTRIBUTES, SKILLS } from '../domain/types'` to:

```ts
import { ATTRIBUTES, SEXES, SKILLS } from '../domain/types'
```

Directly after the name block's `<IssueList issues={issuesFor(issues, 'name')} />`, add:

```tsx
          {header('sex')}
          <div class="radio-row" role="radiogroup" aria-label={t('section.sex')}>
            {SEXES.map((s) => (
              <label key={s}>
                <input
                  type="radio"
                  name="sex"
                  value={s}
                  checked={draft.sex === s}
                  onChange={() => update({ sex: s })}
                />{' '}
                {t(`sex.${s}`)}
              </label>
            ))}
          </div>
```

- [ ] **Step 3: Show it on the sheet**

In `src/ui/CharacterSheet.tsx`, replace:

```tsx
          <div class="sheet-career">{career ? loc(career.label) : t('character.noCareer')}</div>
```

with:

```tsx
          <div class="sheet-career">
            {career ? loc(career.label) : t('character.noCareer')} · {t(`sex.${c.sex}`)}
          </div>
```

- [ ] **Step 4: Style the radio row**

Append to `src/styles/app.css` (outside any `@media` block):

```css
.radio-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
```

- [ ] **Step 5: Run the checks**

Run: `npm run typecheck && npm test && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 6: Check it in the browser**

Run: `npm run dev`, open http://localhost:5173/#/new and check:
- Randomize all (R) fills sex, name and text; with "Kobieta" in PL, the agenda uses feminine forms (re-roll the agenda a few times on a kid or a roughneck).
- Locking the name and re-rolling the sex keeps the name; unlocked, the name changes with the sex.
- Save, open the sheet: the header shows `Career · Sex`.

- [ ] **Step 7: Commit**

```bash
git add src/i18n src/ui src/styles
git commit -m "feat: sex toggle in the editor and on the sheet"
```
