import { newId } from '../domain/id'
import { RULES, findCareer } from '../domain/rules'
import type { Attribute, Career, Character, Lang, Rules, Skill } from '../domain/types'
import { ATTRIBUTES, SKILLS } from '../domain/types'
import { attributeMax, skillMax, validateAttributes, validateSkills } from '../domain/validation'
import { mulberry32, pick, sample, weightedIndex, type Rng } from './rng'
import { TABLES, type RandomTables } from './tables'

/** Fields that can be randomized and locked independently. */
export type Section =
  | 'name'
  | 'careerId'
  | 'attributes'
  | 'skills'
  | 'talentId'
  | 'gear'
  | 'appearance'
  | 'personalAgenda'
  | 'buddy'
  | 'rival'
  | 'signatureItem'

export const SECTIONS: readonly Section[] = [
  'name',
  'careerId',
  'attributes',
  'skills',
  'talentId',
  'gear',
  'appearance',
  'personalAgenda',
  'buddy',
  'rival',
  'signatureItem',
]

/** Fields that depend on the career and should follow it when it is re-rolled. */
export const CAREER_DEPENDENT: readonly Section[] = ['attributes', 'skills', 'talentId', 'gear']

/** Weight of key attributes/skills relative to the others when distributing points. */
const KEY_WEIGHT = 4

export interface GenerateOptions {
  seed: number
  /** Fields present here are kept as-is. */
  locked?: Partial<Character>
  rules?: Rules
  lang?: Lang
  tables?: Record<Lang, RandomTables>
  /** ISO timestamp used for createdAt/updatedAt when not locked. */
  now?: string
}

export function generateCharacter(options: GenerateOptions): Character {
  const { seed, locked = {}, rules = RULES, lang = 'en', tables = TABLES } = options
  const rng = mulberry32(seed)
  const table = tables[lang]
  const now = options.now ?? new Date().toISOString()

  const career =
    locked.careerId !== undefined
      ? findCareer(rules, locked.careerId)
      : pickCareer(rng, rules, locked)
  const careerId = locked.careerId ?? career?.id ?? ''

  // Every generator below always consumes randomness, so locking one field does not shift others.
  const attributes = distributeAttributes(rng, rules, career)
  const skills = distributeSkills(rng, rules, career)
  const talentId = career && career.talents.length > 0 ? pick(rng, career.talents) : ''
  const gear = career
    ? sample(rng, career.gearOptions, rules.limits.gearCount).map((g) => g[lang])
    : []
  const name = `${pickOr(rng, table.firstNames)} ${pickOr(rng, table.lastNames)}`.trim()
  const appearance = pickOr(rng, table.appearance)
  const personalAgenda = pickOr(rng, table.personalAgenda)
  const buddy = pickOr(rng, table.buddy)
  const rival = pickOr(rng, table.rival)
  const signatureItem = pickOr(rng, table.signatureItem)

  const generated: Character = {
    id: newId(),
    schemaVersion: 1,
    name,
    careerId,
    attributes,
    skills,
    talentId,
    appearance,
    personalAgenda,
    buddy,
    rival,
    signatureItem,
    gear,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
  return { ...generated, ...definedOnly(locked) }
}

/**
 * Re-rolls only the given sections of an existing character; everything else stays.
 * Re-rolling the career also re-rolls the career-dependent sections unless they are in `keep`.
 */
export function rerollSections(
  base: Character,
  sections: readonly Section[],
  options: Omit<GenerateOptions, 'locked'> & { keep?: readonly Section[] },
): Character {
  const keep = new Set(options.keep ?? [])
  const reroll = new Set(sections.filter((s) => !keep.has(s)))
  if (reroll.has('careerId')) for (const s of CAREER_DEPENDENT) if (!keep.has(s)) reroll.add(s)
  const locked: Partial<Character> = { ...base }
  for (const s of reroll) delete locked[s]
  return generateCharacter({ ...options, locked })
}

/** Picks a career compatible with the locked attributes, skills and talent, if any. */
function pickCareer(rng: Rng, rules: Rules, locked: Partial<Character>): Career | undefined {
  if (rules.careers.length === 0) return undefined
  const compatible = rules.careers.filter((career) => {
    if (
      locked.talentId !== undefined &&
      locked.talentId !== '' &&
      !career.talents.includes(locked.talentId)
    )
      return false
    if (
      locked.attributes &&
      validateAttributes({ attributes: locked.attributes, careerId: career.id }, rules).length > 0
    )
      return false
    if (
      locked.skills &&
      validateSkills({ skills: locked.skills, careerId: career.id }, rules).length > 0
    )
      return false
    return true
  })
  return pick(rng, compatible.length > 0 ? compatible : rules.careers)
}

function distributeAttributes(
  rng: Rng,
  rules: Rules,
  career: Career | undefined,
): Record<Attribute, number> {
  const values = distribute(
    rng,
    ATTRIBUTES,
    rules.limits.attributeMin,
    rules.limits.attributeTotal,
    (a) => attributeMax(rules, career, a),
    (a) => career?.keyAttribute === a,
  )
  return values as Record<Attribute, number>
}

function distributeSkills(
  rng: Rng,
  rules: Rules,
  career: Career | undefined,
): Record<Skill, number> {
  const values = distribute(
    rng,
    SKILLS,
    rules.limits.skillMin,
    rules.limits.skillTotal,
    (s) => skillMax(rules, career, s),
    (s) => career?.keySkills.includes(s) ?? false,
  )
  return values as Record<Skill, number>
}

/** Starts every key at `min`, then hands out points one by one, favouring key entries. */
function distribute<K extends string>(
  rng: Rng,
  keys: readonly K[],
  min: number,
  total: number,
  max: (k: K) => number,
  isKey: (k: K) => boolean,
): Record<K, number> {
  const values = Object.fromEntries(keys.map((k) => [k, min])) as Record<K, number>
  let remaining = total - min * keys.length
  while (remaining > 0) {
    const weights = keys.map((k) => (values[k] < max(k) ? (isKey(k) ? KEY_WEIGHT : 1) : 0))
    if (weights.every((w) => w === 0)) break // limits cannot reach the total
    const key = keys[weightedIndex(rng, weights)] as K
    values[key] += 1
    remaining -= 1
  }
  return values
}

function pickOr(rng: Rng, items: readonly string[]): string {
  return items.length > 0 ? pick(rng, items) : ''
}

function definedOnly<T extends object>(obj: Partial<T>): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}
