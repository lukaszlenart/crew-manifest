import { describe, expect, it } from 'vitest'
import { RULES } from './rules'
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
})
