import { describe, expect, it } from 'vitest'
import { RULES } from '../domain/rules'
import { TEST_RULES, validCharacter } from '../domain/testing'
import { validateCharacter } from '../domain/validation'
import { generateCharacter, rerollSections } from './generate'
import { mulberry32 } from './rng'

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
})
