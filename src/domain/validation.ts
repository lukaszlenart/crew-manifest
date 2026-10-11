import { findCareer, findTalent } from './rules'
import type { Attribute, Career, Character, Rules, Skill } from './types'
import { ATTRIBUTES, SKILLS } from './types'

export type IssueCode =
  | 'name.required'
  | 'career.unknown'
  | 'attribute.notInteger'
  | 'attribute.belowMin'
  | 'attribute.aboveMax'
  | 'attributes.total'
  | 'skill.notInteger'
  | 'skill.belowMin'
  | 'skill.aboveMax'
  | 'skills.total'
  | 'talent.required'
  | 'talent.unknown'
  | 'talent.notInCareer'

/**
 * `message` is a stable code; the UI translates it (`validation.<code>`) using `params`.
 * `field` is a path such as `attributes`, `attributes.strength`, `skills.comtech`, `talentId`.
 */
export interface ValidationIssue {
  field: string
  message: IssueCode
  params?: Record<string, number | string>
}

export function attributeMax(rules: Rules, career: Career | undefined, attr: Attribute): number {
  return career?.keyAttribute === attr ? rules.limits.keyAttributeMax : rules.limits.attributeMax
}

export function skillMax(rules: Rules, career: Career | undefined, skill: Skill): number {
  return career?.keySkills.includes(skill) ? rules.limits.keySkillMax : rules.limits.otherSkillMax
}

export function attributeSum(c: Pick<Character, 'attributes'>): number {
  return ATTRIBUTES.reduce((sum, a) => sum + c.attributes[a], 0)
}

export function skillSum(c: Pick<Character, 'skills'>): number {
  return SKILLS.reduce((sum, s) => sum + c.skills[s], 0)
}

export function remainingAttributePoints(c: Pick<Character, 'attributes'>, rules: Rules): number {
  return rules.limits.attributeTotal - attributeSum(c)
}

export function remainingSkillPoints(c: Pick<Character, 'skills'>, rules: Rules): number {
  return rules.limits.skillTotal - skillSum(c)
}

export function validateName(c: Pick<Character, 'name'>): ValidationIssue[] {
  return c.name.trim() === '' ? [{ field: 'name', message: 'name.required' }] : []
}

export function validateCareer(c: Pick<Character, 'careerId'>, rules: Rules): ValidationIssue[] {
  return findCareer(rules, c.careerId)
    ? []
    : [{ field: 'careerId', message: 'career.unknown', params: { id: c.careerId } }]
}

export function validateAttributes(
  c: Pick<Character, 'attributes' | 'careerId'>,
  rules: Rules,
): ValidationIssue[] {
  const career = findCareer(rules, c.careerId)
  const issues: ValidationIssue[] = []
  for (const attr of ATTRIBUTES) {
    const value = c.attributes[attr]
    const field = `attributes.${attr}`
    const max = attributeMax(rules, career, attr)
    if (!Number.isInteger(value)) issues.push({ field, message: 'attribute.notInteger' })
    else if (value < rules.limits.attributeMin)
      issues.push({
        field,
        message: 'attribute.belowMin',
        params: { min: rules.limits.attributeMin },
      })
    else if (value > max) issues.push({ field, message: 'attribute.aboveMax', params: { max } })
  }
  const total = attributeSum(c)
  if (total !== rules.limits.attributeTotal) {
    issues.push({
      field: 'attributes',
      message: 'attributes.total',
      params: { total, expected: rules.limits.attributeTotal },
    })
  }
  return issues
}

export function validateSkills(
  c: Pick<Character, 'skills' | 'careerId'>,
  rules: Rules,
): ValidationIssue[] {
  const career = findCareer(rules, c.careerId)
  const issues: ValidationIssue[] = []
  for (const skill of SKILLS) {
    const value = c.skills[skill]
    const field = `skills.${skill}`
    const max = skillMax(rules, career, skill)
    if (!Number.isInteger(value)) issues.push({ field, message: 'skill.notInteger' })
    else if (value < rules.limits.skillMin)
      issues.push({ field, message: 'skill.belowMin', params: { min: rules.limits.skillMin } })
    else if (value > max) issues.push({ field, message: 'skill.aboveMax', params: { max } })
  }
  const total = skillSum(c)
  if (total !== rules.limits.skillTotal) {
    issues.push({
      field: 'skills',
      message: 'skills.total',
      params: { total, expected: rules.limits.skillTotal },
    })
  }
  return issues
}

export function validateTalent(
  c: Pick<Character, 'talentId' | 'careerId'>,
  rules: Rules,
): ValidationIssue[] {
  if (c.talentId === '') return [{ field: 'talentId', message: 'talent.required' }]
  if (!findTalent(rules, c.talentId))
    return [{ field: 'talentId', message: 'talent.unknown', params: { id: c.talentId } }]
  const career = findCareer(rules, c.careerId)
  if (career && !career.talents.includes(c.talentId))
    return [{ field: 'talentId', message: 'talent.notInCareer' }]
  return []
}

export function validateCharacter(c: Character, rules: Rules): ValidationIssue[] {
  return [
    ...validateName(c),
    ...validateCareer(c, rules),
    ...validateAttributes(c, rules),
    ...validateSkills(c, rules),
    ...validateTalent(c, rules),
  ]
}

export function issuesFor(issues: ValidationIssue[], field: string): ValidationIssue[] {
  return issues.filter((i) => i.field === field)
}
