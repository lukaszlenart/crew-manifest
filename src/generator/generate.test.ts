import { describe, expect, it } from 'vitest'
import { gearItemText } from '../domain/gear'
import { RULES, cashRange, findCareer } from '../domain/rules'
import { TEST_RULES, validCharacter } from '../domain/testing'
import type { Character, Rules } from '../domain/types'
import { SEXES } from '../domain/types'
import { validateCharacter } from '../domain/validation'
import { SECTIONS, generateCharacter, rerollSections, type Section } from './generate'
import { mulberry32 } from './rng'
import type { LangTables } from './tables'

const fixed = { id: 'fixed-id', createdAt: 'T', updatedAt: 'T' }

describe('mulberry32', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const x = a()
      expect(x).toBe(b())
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })
})

describe('generateCharacter', () => {
  for (const [name, rules] of [
    ['RULES', RULES],
    ['TEST_RULES', TEST_RULES],
  ] as const) {
    it(`produces valid characters for 1000 seeds (${name})`, () => {
      for (let seed = 0; seed < 1000; seed++) {
        for (const lang of ['en', 'pl'] as const) {
          const c = generateCharacter({ seed, rules, lang })
          expect(validateCharacter(c, rules), `seed ${seed} ${lang}`).toEqual([])
          expect(c.gear).toHaveLength(rules.limits.gearCount)
        }
      }
    })
  }

  it('takes one item from each of gearCount different lines', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (const lang of ['en', 'pl'] as const) {
        const c = generateCharacter({ seed, rules: RULES, lang })
        const career = RULES.careers.find((k) => k.id === c.careerId)
        const lines = c.gear.map((g) =>
          career?.gearOptions.findIndex((line) =>
            line.some((item) => gearItemText(item, lang) === g),
          ),
        )
        expect(lines, `seed ${seed} ${lang}: ${c.gear.join(', ')}`).not.toContain(-1)
        expect(new Set(lines).size).toBe(c.gear.length)
      }
    }
  })

  it('gives firearms their starting reloads', () => {
    const rules: Rules = {
      ...TEST_RULES,
      careers: TEST_RULES.careers.map((k) => ({
        ...k,
        gearOptions: [
          [
            { label: { en: 'Pistol', pl: 'Pistolet' }, firearm: true },
            { label: { en: 'Rifle', pl: 'Karabin' }, firearm: true },
          ],
          [
            { label: { en: 'Revolver', pl: 'Rewolwer' }, firearm: true },
            { label: { en: 'Shotgun', pl: 'Strzelba' }, firearm: true },
          ],
        ],
      })),
    }
    const c = generateCharacter({ seed: 1, rules })
    expect(c.gear).toHaveLength(2)
    for (const g of c.gear) expect(g).toMatch(/ \(2 reloads\)$/)
  })

  it('rolls starting cash within the career range', () => {
    for (let seed = 0; seed < 500; seed++) {
      const c = generateCharacter({ seed, rules: RULES })
      const career = findCareer(RULES, c.careerId)
      if (!career) throw new Error(`no career for seed ${seed}`)
      const { min, max } = cashRange(career.cash)
      expect(c.cash).toBeGreaterThanOrEqual(min)
      expect(c.cash).toBeLessThanOrEqual(max)
      expect(c.cash % career.cash.multiplier).toBe(0)
    }
  })

  it('gives the same result for the same seed', () => {
    const a = generateCharacter({ seed: 7, rules: TEST_RULES, locked: fixed })
    const b = generateCharacter({ seed: 7, rules: TEST_RULES, locked: fixed })
    expect(a).toEqual(b)
    const c = generateCharacter({ seed: 8, rules: TEST_RULES, locked: fixed })
    expect(c).not.toEqual(a)
  })

  it('favours key attributes and skills', () => {
    let keyAttrAtMax = 0
    for (let seed = 0; seed < 200; seed++) {
      const c = generateCharacter({ seed, rules: TEST_RULES, locked: { careerId: 'roughneck' } })
      if (c.attributes.strength === 5) keyAttrAtMax++
    }
    expect(keyAttrAtMax).toBeGreaterThan(100)
  })

  it('never changes locked fields', () => {
    const base = validCharacter({ name: 'Locked Name', notes: 'keep me', gear: ['x'] })
    for (let seed = 0; seed < 200; seed++) {
      const c = generateCharacter({
        seed,
        rules: TEST_RULES,
        locked: {
          name: base.name,
          attributes: base.attributes,
          skills: base.skills,
          notes: base.notes,
          gear: base.gear,
        },
      })
      expect(c.name).toBe(base.name)
      expect(c.attributes).toEqual(base.attributes)
      expect(c.skills).toEqual(base.skills)
      expect(c.notes).toBe('keep me')
      expect(c.gear).toEqual(['x'])
      // Locked stats fit only the roughneck, so the career must follow.
      expect(c.careerId).toBe('roughneck')
      expect(validateCharacter(c, TEST_RULES)).toEqual([])
    }
  })

  it('generates male humans by default', () => {
    for (let seed = 0; seed < 50; seed++) {
      const c = generateCharacter({ seed, rules: TEST_RULES })
      expect(c.kind).toBe('human')
      expect(c.sex).toBe('male')
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

  it('picks a career matching a locked talent', () => {
    for (let seed = 0; seed < 50; seed++) {
      const c = generateCharacter({ seed, rules: TEST_RULES, locked: { talentId: 't3' } })
      expect(c.careerId).toBe('scientist')
    }
  })
})

describe('rerollSections', () => {
  it('changes only the requested sections', () => {
    const base = validCharacter({ name: 'Base', appearance: 'A' })
    const c = rerollSections(base, ['appearance'], { seed: 3, rules: TEST_RULES })
    expect({ ...c, appearance: base.appearance }).toEqual(base)
  })

  it('re-rolls career-dependent sections with the career unless kept', () => {
    const base = validCharacter()
    for (let seed = 0; seed < 50; seed++) {
      const c = rerollSections(base, ['careerId'], { seed, rules: TEST_RULES, keep: ['talentId'] })
      expect(c.talentId).toBe(base.talentId)
      expect(c.name).toBe(base.name)
      expect(validateCharacter(c, TEST_RULES)).toEqual([])
    }
  })

  it('re-rolls cash with the career unless kept', () => {
    const base = validCharacter({ cash: 12345 })
    let changed = false
    for (let seed = 0; seed < 50; seed++) {
      const kept = rerollSections(base, ['careerId'], { seed, rules: TEST_RULES, keep: ['cash'] })
      expect(kept.cash).toBe(12345)
      if (rerollSections(base, ['careerId'], { seed, rules: TEST_RULES }).cash !== 12345)
        changed = true
    }
    expect(changed).toBe(true)
  })

  it('keeps the sex on randomize all', () => {
    const base = validCharacter({ sex: 'female' })
    for (let seed = 0; seed < 50; seed++) {
      expect(rerollSections(base, SECTIONS, { seed, rules: TEST_RULES }).sex).toBe('female')
    }
  })
})

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
    for (let seed = 0; seed < 100; seed++) {
      for (const sex of SEXES) {
        const c = generateCharacter({
          seed,
          rules: TEST_RULES,
          tables: testTables,
          locked: { careerId: 'roughneck', sex },
        })
        const expectedNames = sex === 'female' ? ['GF L', 'CF'] : ['GM L', 'CM']
        expect(expectedNames).toContain(c.name)
        seen.add(c.name)
        seen.add(c.appearance)
        expect(c.buddy).toBe('gb')
        expect(c.rival).toBe('gr')
      }
    }
    for (const value of ['GF L', 'CF', 'GM L', 'CM', 'Ca', 'ga-m', 'ga-f']) {
      expect(seen, value).toContain(value)
    }
  })

  it('falls back to the general pool when the career has no table', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const careerId of ['scientist', '']) {
        const c = generateCharacter({
          seed,
          rules: TEST_RULES,
          tables: testTables,
          locked: { careerId },
        })
        expect(c.name).toBe('GM L')
        expect(c.appearance).toBe('ga-m')
        expect(c.personalAgenda).toBe('gp')
        expect(c.signatureItem).toBe('gs')
      }
    }
  })

  it('resolves gender markers for the locked sex', () => {
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
      const c = generateCharacter({ seed, lang: 'pl', locked: { sex: SEXES[seed % 2] } })
      for (const text of [
        c.name,
        c.appearance,
        c.personalAgenda,
        c.buddy,
        c.rival,
        c.signatureItem,
      ]) {
        expect(text, `seed ${seed}`).not.toMatch(/[{}|]/)
        expect(text.trim(), `seed ${seed}`).not.toBe('')
      }
    }
  })
})

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

describe('an android with an incomplete bonus', () => {
  const android = (androidBonus: Character['androidBonus']) =>
    validCharacter({ kind: 'android', androidBonus, signatureItem: '' })

  it('gets two bonus attributes when attributes are kept', () => {
    const base = android([])
    for (let seed = 0; seed < 50; seed++) {
      const c = rerollSections(base, SECTIONS, { seed, rules: TEST_RULES, keep: ['attributes'] })
      expect(c.attributes).toEqual(base.attributes)
      expect(new Set(c.androidBonus).size).toBe(2)
      expect(validateCharacter(c, TEST_RULES), `seed ${seed}`).toEqual([])
    }
  })

  it('keeps a single pick and adds one more', () => {
    for (let seed = 0; seed < 50; seed++) {
      const c = rerollSections(android(['wits']), ['name'], { seed, rules: TEST_RULES })
      expect(c.androidBonus).toHaveLength(2)
      expect(c.androidBonus[0]).toBe('wits')
      expect(c.androidBonus[1]).not.toBe('wits')
    }
  })

  it('turns a duplicate pick into two distinct attributes', () => {
    for (let seed = 0; seed < 50; seed++) {
      const c = rerollSections(android(['wits', 'wits']), ['name'], { seed, rules: TEST_RULES })
      expect(c.androidBonus[0]).toBe('wits')
      expect(new Set(c.androidBonus).size).toBe(2)
    }
  })

  it('keeps a leftover bonus on a human', () => {
    const human = validCharacter({ androidBonus: ['wits'] })
    const c = rerollSections(human, ['name'], { seed: 1, rules: TEST_RULES })
    expect(c.androidBonus).toEqual(['wits'])
  })
})

describe('generateCharacter golden output', () => {
  const entries = (name: string) => [1, 2, 3, 4, 5, 6].map((i) => `${name}-${i}`)
  const careerTables = (id: string) => ({
    names: { female: entries(`${id}-name-f`), male: entries(`${id}-name-m`) },
    appearance: entries(`${id}-appearance`),
    personalAgenda: entries(`${id}-agenda`),
    signatureItem: entries(`${id}-item`),
  })
  const goldenLangTables: LangTables = {
    general: {
      firstNames: { female: entries('first-f'), male: entries('first-m') },
      lastNames: entries('last'),
      appearance: entries('appearance'),
      personalAgenda: entries('agenda'),
      buddy: entries('buddy'),
      rival: entries('rival'),
      signatureItem: entries('item'),
    },
    careers: { roughneck: careerTables('roughneck'), scientist: careerTables('scientist') },
  }
  const generate = (seed: number, sex: Character['sex'], kind: Character['kind']) =>
    generateCharacter({
      seed,
      rules: TEST_RULES,
      tables: { en: goldenLangTables, pl: goldenLangTables },
      now: 'T',
      locked: { id: 'golden', sex, kind },
    })

  it('keeps the output for fixed seeds', () => {
    const output = (
      [
        [1, 'male'],
        [8, 'female'],
      ] as const
    ).flatMap(([seed, sex]) =>
      (['human', 'android'] as const).map((kind) => ({
        seed,
        kind,
        character: generate(seed, sex, kind),
      })),
    )
    expect(output).toMatchInlineSnapshot(`
      [
        {
          "character": {
            "androidBonus": [],
            "appearance": "appearance-5",
            "attributes": {
              "agility": 3,
              "empathy": 4,
              "strength": 3,
              "wits": 4,
            },
            "buddy": "buddy-2",
            "careerId": "scientist",
            "cash": 100,
            "createdAt": "T",
            "gear": [
              "g1a",
              "g3a",
            ],
            "id": "golden",
            "kind": "human",
            "name": "scientist-name-m-4",
            "notes": "",
            "personalAgenda": "agenda-3",
            "rival": "rival-2",
            "schemaVersion": 1,
            "sex": "male",
            "signatureItem": "scientist-item-5",
            "skills": {
              "closeCombat": 1,
              "command": 0,
              "comtech": 1,
              "heavyMachinery": 0,
              "manipulation": 0,
              "medicalAid": 1,
              "mobility": 1,
              "observation": 3,
              "piloting": 1,
              "rangedCombat": 0,
              "stamina": 0,
              "survival": 2,
            },
            "talentId": "t3",
            "updatedAt": "T",
          },
          "kind": "human",
          "seed": 1,
        },
        {
          "character": {
            "androidBonus": [
              "agility",
              "empathy",
            ],
            "appearance": "appearance-5",
            "attributes": {
              "agility": 3,
              "empathy": 4,
              "strength": 3,
              "wits": 4,
            },
            "buddy": "buddy-2",
            "careerId": "scientist",
            "cash": 100,
            "createdAt": "T",
            "gear": [
              "g1a",
              "g3a",
            ],
            "id": "golden",
            "kind": "android",
            "name": "scientist-name-m-4",
            "notes": "",
            "personalAgenda": "agenda-3",
            "rival": "rival-2",
            "schemaVersion": 1,
            "sex": "male",
            "signatureItem": "",
            "skills": {
              "closeCombat": 1,
              "command": 0,
              "comtech": 1,
              "heavyMachinery": 0,
              "manipulation": 0,
              "medicalAid": 1,
              "mobility": 1,
              "observation": 3,
              "piloting": 1,
              "rangedCombat": 0,
              "stamina": 0,
              "survival": 2,
            },
            "talentId": "t3",
            "updatedAt": "T",
          },
          "kind": "android",
          "seed": 1,
        },
        {
          "character": {
            "androidBonus": [],
            "appearance": "appearance-1",
            "attributes": {
              "agility": 4,
              "empathy": 3,
              "strength": 5,
              "wits": 2,
            },
            "buddy": "buddy-5",
            "careerId": "roughneck",
            "cash": 500,
            "createdAt": "T",
            "gear": [
              "g2b",
              "g3a",
            ],
            "id": "golden",
            "kind": "human",
            "name": "roughneck-name-f-2",
            "notes": "",
            "personalAgenda": "roughneck-agenda-6",
            "rival": "rival-2",
            "schemaVersion": 1,
            "sex": "female",
            "signatureItem": "roughneck-item-6",
            "skills": {
              "closeCombat": 3,
              "command": 0,
              "comtech": 0,
              "heavyMachinery": 3,
              "manipulation": 0,
              "medicalAid": 1,
              "mobility": 0,
              "observation": 0,
              "piloting": 0,
              "rangedCombat": 0,
              "stamina": 2,
              "survival": 1,
            },
            "talentId": "t1",
            "updatedAt": "T",
          },
          "kind": "human",
          "seed": 8,
        },
        {
          "character": {
            "androidBonus": [
              "empathy",
              "strength",
            ],
            "appearance": "appearance-1",
            "attributes": {
              "agility": 4,
              "empathy": 3,
              "strength": 5,
              "wits": 2,
            },
            "buddy": "buddy-5",
            "careerId": "roughneck",
            "cash": 500,
            "createdAt": "T",
            "gear": [
              "g2b",
              "g3a",
            ],
            "id": "golden",
            "kind": "android",
            "name": "roughneck-name-f-2",
            "notes": "",
            "personalAgenda": "roughneck-agenda-6",
            "rival": "rival-2",
            "schemaVersion": 1,
            "sex": "female",
            "signatureItem": "",
            "skills": {
              "closeCombat": 3,
              "command": 0,
              "comtech": 0,
              "heavyMachinery": 3,
              "manipulation": 0,
              "medicalAid": 1,
              "mobility": 0,
              "observation": 0,
              "piloting": 0,
              "rangedCombat": 0,
              "stamina": 2,
              "survival": 1,
            },
            "talentId": "t1",
            "updatedAt": "T",
          },
          "kind": "android",
          "seed": 8,
        },
      ]
    `)
  })
})
