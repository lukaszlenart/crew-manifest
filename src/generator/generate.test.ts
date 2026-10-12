import { describe, expect, it } from 'vitest'
import { gearItemText } from '../domain/gear'
import { RULES, cashRange, findCareer } from '../domain/rules'
import { TEST_RULES, validCharacter } from '../domain/testing'
import type { Rules } from '../domain/types'
import { validateCharacter } from '../domain/validation'
import { generateCharacter, rerollSections } from './generate'
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
        const c = generateCharacter({
          seed,
          rules: TEST_RULES,
          tables: testTables,
          locked: { careerId },
        })
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
