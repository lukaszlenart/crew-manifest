import { describe, expect, it } from 'vitest'
import { RULES, RULES_LIMITS, cashRange } from './rules'
import { ATTRIBUTES, SKILLS } from './types'

describe('RULES', () => {
  it('maps all 12 skills to attributes, three per attribute', () => {
    expect(Object.keys(RULES.skills).sort()).toEqual([...SKILLS].sort())
    for (const attr of ATTRIBUTES) {
      expect(SKILLS.filter((s) => RULES.skills[s].attribute === attr)).toHaveLength(3)
    }
  })

  it('references only known talents and has unique ids', () => {
    const talentIds = new Set(RULES.talents.map((t) => t.id))
    expect(talentIds.size).toBe(RULES.talents.length)
    expect(new Set(RULES.careers.map((c) => c.id)).size).toBe(RULES.careers.length)
    for (const career of RULES.careers) {
      expect(career.talents.length).toBeGreaterThan(0)
      for (const t of career.talents) expect(talentIds.has(t)).toBe(true)
    }
  })

  it('has key attribute/skill budgets that are achievable', () => {
    const l = RULES.limits
    for (const career of RULES.careers) {
      const maxSkills =
        career.keySkills.length * l.keySkillMax +
        (SKILLS.length - career.keySkills.length) * l.otherSkillMax
      expect(maxSkills).toBeGreaterThanOrEqual(l.skillTotal)
      expect(career.gearOptions.length).toBeGreaterThanOrEqual(l.gearCount)
    }
    expect(l.attributeMin * 4).toBeLessThanOrEqual(l.attributeTotal)
    expect(l.attributeMax * 3 + l.keyAttributeMax).toBeGreaterThanOrEqual(l.attributeTotal)
  })

  it('has two named alternatives in every gear line', () => {
    for (const career of RULES.careers) {
      for (const line of career.gearOptions) {
        expect(line).toHaveLength(2)
        for (const item of line) {
          expect(item.label.en.trim()).not.toBe('')
          expect(item.label.pl.trim()).not.toBe('')
          expect(item.label.en).not.toContain(' / ')
        }
      }
    }
  })

  it('has a valid starting cash roll for every career', () => {
    for (const career of RULES.careers) {
      expect([1, 2]).toContain(career.cash.dice)
      expect(Number.isInteger(career.cash.multiplier)).toBe(true)
      expect(career.cash.multiplier).toBeGreaterThan(0)
    }
  })

  it('gives the cash range of a career', () => {
    expect(cashRange({ dice: 1, multiplier: 100 })).toEqual({ min: 100, max: 600 })
    expect(cashRange({ dice: 2, multiplier: 100 })).toEqual({ min: 200, max: 1200 })
    expect(cashRange({ dice: 1, multiplier: 1 })).toEqual({ min: 1, max: 6 })
  })

  it('caps android attributes at 8 for the key attribute and 7 for the others', () => {
    expect(RULES_LIMITS.keyAttributeMax + RULES_LIMITS.androidAttributeBonus).toBe(8)
    expect(RULES_LIMITS.attributeMax + RULES_LIMITS.androidAttributeBonus).toBe(7)
    expect(RULES_LIMITS.androidBonusAttributes).toBe(2)
  })
})
