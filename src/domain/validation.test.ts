import { describe, expect, it } from 'vitest'
import { TEST_RULES as R, validCharacter } from './testing'
import {
  remainingAttributePoints,
  remainingSkillPoints,
  validateAttributes,
  validateCash,
  validateCharacter,
  validateSkills,
  validateTalent,
} from './validation'
import type { Character } from './types'

const withAttrs = (a: Partial<Character['attributes']>) =>
  validCharacter({ attributes: { ...validCharacter().attributes, ...a } })
const withSkills = (s: Partial<Character['skills']>) =>
  validCharacter({ skills: { ...validCharacter().skills, ...s } })
const codes = (issues: { message: string }[]) => issues.map((i) => i.message)

describe('validateCharacter', () => {
  it('accepts a valid character (exactly 14 attribute and 10 skill points)', () => {
    const c = validCharacter()
    expect(validateCharacter(c, R)).toEqual([])
    expect(remainingAttributePoints(c, R)).toBe(0)
    expect(remainingSkillPoints(c, R)).toBe(0)
  })

  it('requires a name and a known career', () => {
    expect(codes(validateCharacter(validCharacter({ name: '  ' }), R))).toContain('name.required')
    expect(codes(validateCharacter(validCharacter({ careerId: 'nope' }), R))).toContain(
      'career.unknown',
    )
    expect(codes(validateCharacter(validCharacter({ careerId: '' }), R))).toContain(
      'career.required',
    )
  })
})

describe('validateAttributes', () => {
  it('reports wrong total (13 and 15)', () => {
    const low = withAttrs({ agility: 2 })
    expect(remainingAttributePoints(low, R)).toBe(1)
    expect(validateAttributes(low, R)).toEqual([
      { field: 'attributes', message: 'attributes.total', params: { total: 13, expected: 14 } },
    ])
    const high = withAttrs({ agility: 4 })
    expect(remainingAttributePoints(high, R)).toBe(-1)
    expect(codes(validateAttributes(high, R))).toEqual(['attributes.total'])
  })

  it('allows 5 in the key attribute only', () => {
    expect(validateAttributes(withAttrs({ strength: 5 }), R)).toEqual([])
    const c = withAttrs({ strength: 4, wits: 4 })
    expect(validateAttributes(c, R)).toEqual([])
    const nonKey = withAttrs({ strength: 3, wits: 5 })
    expect(validateAttributes(nonKey, R)).toEqual([
      { field: 'attributes.wits', message: 'attribute.aboveMax', params: { max: 4 } },
    ])
  })

  it('rejects 6 in the key attribute and values below 2', () => {
    expect(codes(validateAttributes(withAttrs({ strength: 6, agility: 2 }), R))).toEqual([
      'attribute.aboveMax',
    ])
    expect(
      codes(validateAttributes(withAttrs({ strength: 5, agility: 1, wits: 4, empathy: 4 }), R)),
    ).toEqual(['attribute.belowMin'])
  })

  it('uses the key attribute of the selected career', () => {
    const c = validCharacter({
      careerId: 'scientist',
      attributes: { strength: 3, agility: 3, wits: 5, empathy: 3 },
    })
    expect(validateAttributes(c, R)).toEqual([])
  })

  it('rejects non-integers', () => {
    expect(codes(validateAttributes(withAttrs({ agility: 2.5, empathy: 3.5 }), R))).toEqual([
      'attribute.notInteger',
      'attribute.notInteger',
    ])
  })
})

describe('validateSkills', () => {
  it('reports wrong total (9 and 11)', () => {
    const low = withSkills({ mobility: 0 })
    expect(remainingSkillPoints(low, R)).toBe(1)
    expect(validateSkills(low, R)).toEqual([
      { field: 'skills', message: 'skills.total', params: { total: 9, expected: 10 } },
    ])
    expect(codes(validateSkills(withSkills({ piloting: 1 }), R))).toEqual(['skills.total'])
  })

  it('allows 3 in a key skill but only 1 in a non-key skill', () => {
    expect(validateSkills(withSkills({ heavyMachinery: 3 }), R)).toEqual([])
    const c = withSkills({ heavyMachinery: 1, mobility: 3 })
    expect(validateSkills(c, R)).toEqual([
      { field: 'skills.mobility', message: 'skill.aboveMax', params: { max: 1 } },
    ])
  })

  it('rejects 4 in a key skill and negative values', () => {
    expect(codes(validateSkills(withSkills({ heavyMachinery: 4, mobility: 0 }), R))).toEqual([
      'skill.aboveMax',
    ])
    expect(
      codes(validateSkills(withSkills({ mobility: -1, piloting: 1, medicalAid: 1 }), R)),
    ).toEqual(['skill.belowMin'])
  })
})

describe('validateTalent', () => {
  it('requires exactly one talent from the career list', () => {
    expect(validateTalent(validCharacter({ talentId: 't2' }), R)).toEqual([])
    expect(codes(validateTalent(validCharacter({ talentId: '' }), R))).toEqual(['talent.required'])
    expect(codes(validateTalent(validCharacter({ talentId: 'zzz' }), R))).toEqual([
      'talent.unknown',
    ])
  })

  it('rejects a talent from another career', () => {
    expect(validateTalent(validCharacter({ talentId: 't3' }), R)).toEqual([
      { field: 'talentId', message: 'talent.notInCareer' },
    ])
  })
})

describe('validateCash', () => {
  it('accepts any non-negative whole amount, outside the career roll too', () => {
    for (const cash of [0, 300, 99999]) expect(validateCash(validCharacter({ cash }))).toEqual([])
  })

  it('rejects negative or fractional cash', () => {
    for (const cash of [-1, 2.5, Number.NaN])
      expect(validateCash(validCharacter({ cash }))).toEqual([
        { field: 'cash', message: 'cash.invalid' },
      ])
  })
})
