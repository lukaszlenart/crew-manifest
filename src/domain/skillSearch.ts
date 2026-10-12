import { matchesAllWords } from './textSearch'
import {
  ATTRIBUTES,
  SKILLS,
  type Attribute,
  type CareerId,
  type Lang,
  type Rules,
  type Skill,
} from './types'

export type SkillFilter = { kind: 'all' } | { kind: 'career'; careerId: CareerId }

export function filterSkills(
  rules: Rules,
  options: { query: string; filter: SkillFilter },
  lang: Lang,
): Skill[] {
  const { filter } = options
  const career =
    filter.kind === 'career' ? rules.careers.find((c) => c.id === filter.careerId) : undefined
  return SKILLS.filter(
    (s) => filter.kind === 'all' || (career?.keySkills.includes(s) ?? false),
  ).filter((s) => {
    const { label, description, details } = rules.skills[s]
    return matchesAllWords(options.query, [label[lang], description[lang], details[lang]].join(' '))
  })
}

export function groupSkills(
  rules: Rules,
  skills: Skill[],
): { attribute: Attribute; skills: Skill[] }[] {
  return ATTRIBUTES.map((attribute) => ({
    attribute,
    skills: SKILLS.filter((s) => skills.includes(s) && rules.skills[s].attribute === attribute),
  })).filter((g) => g.skills.length > 0)
}

export function skillFilterToValue(filter: SkillFilter): string {
  return filter.kind === 'career' ? `career:${filter.careerId}` : filter.kind
}

export function skillFilterFromValue(value: string): SkillFilter {
  if (value.startsWith('career:') && value.length > 'career:'.length)
    return { kind: 'career', careerId: value.slice('career:'.length) }
  return { kind: 'all' }
}
