import { gearItemText } from '../domain/gear'
import { newId } from '../domain/id'
import { RULES, findCareer } from '../domain/rules'
import type { Attribute, Career, Character, Lang, Rules, Sex, Skill } from '../domain/types'
import { ATTRIBUTES, SEXES, SKILLS } from '../domain/types'
import { attributeMax, skillMax, validateAttributes, validateSkills } from '../domain/validation'
import { mulberry32, pick, sample, weightedIndex, type Rng } from './rng'
import { resolveGender } from './gender'
import { TABLES, type CareerTables, type GeneralTables, type LangTables } from './tables'

/** Fields that can be randomized and locked independently. */
export type Section =
  | 'name'
  | 'sex'
  | 'careerId'
  | 'attributes'
  | 'skills'
  | 'talentId'
  | 'gear'
  | 'cash'
  | 'appearance'
  | 'personalAgenda'
  | 'buddy'
  | 'rival'
  | 'signatureItem'

export const SECTIONS: readonly Section[] = [
  'name',
  'sex',
  'careerId',
  'attributes',
  'skills',
  'talentId',
  'gear',
  'cash',
  'appearance',
  'personalAgenda',
  'buddy',
  'rival',
  'signatureItem',
]

/** Fields that depend on the career and should follow it when it is re-rolled. */
export const CAREER_DEPENDENT: readonly Section[] = [
  'attributes',
  'skills',
  'talentId',
  'gear',
  'cash',
]

/** Fields that should follow the sex when it is re-rolled. */
export const SEX_DEPENDENT: readonly Section[] = ['name']

/** Weight of key attributes/skills relative to the others when distributing points. */
const KEY_WEIGHT = 4

export interface GenerateOptions {
  seed: number
  /** Fields present here are kept as-is. */
  locked?: Partial<Character>
  rules?: Rules
  lang?: Lang
  tables?: Record<Lang, LangTables>
  /** ISO timestamp used for createdAt/updatedAt when not locked. */
  now?: string
}

export function generateCharacter(options: GenerateOptions): Character {
  const { seed, locked = {}, rules = RULES, lang = 'en', tables = TABLES } = options
  const rng = mulberry32(seed)
  const rolledSex = pick(rng, SEXES)
  const sex = locked.sex ?? rolledSex
  const kind = locked.kind ?? 'human'
  const { general, careers } = tables[lang]
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
    ? sample(rng, career.gearOptions, rules.limits.gearCount).map((line) =>
        gearItemText(pick(rng, line), lang),
      )
    : []
  const cash = rollCash(rng, career)
  const careerTable: CareerTables | undefined = careers[careerId]
  const text = (fromGeneral: readonly string[], fromCareer: readonly string[] | undefined) =>
    resolveGender(pickMixed(rng, fromGeneral, fromCareer), sex)
  const name = resolveGender(pickName(rng, general, careerTable, sex), sex)
  const appearance = text(general.appearance, careerTable?.appearance)
  const personalAgenda = text(general.personalAgenda, careerTable?.personalAgenda)
  const buddy = text(general.buddy, undefined)
  const rival = text(general.rival, undefined)
  const rolledSignatureItem = text(general.signatureItem, careerTable?.signatureItem)
  const rolledBonus = sample(rng, ATTRIBUTES, rules.limits.androidBonusAttributes)
  const signatureItem = kind === 'android' ? '' : rolledSignatureItem
  const androidBonus = kind === 'android' ? rolledBonus : []

  const generated: Character = {
    id: newId(),
    schemaVersion: 1,
    name,
    sex,
    kind,
    androidBonus,
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
    cash,
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
  if (reroll.has('sex')) for (const s of SEX_DEPENDENT) if (!keep.has(s)) reroll.add(s)
  const locked: Partial<Character> = { ...base }
  for (const s of reroll) delete locked[s]
  if (reroll.has('attributes')) delete locked.androidBonus
  return generateCharacter({ ...options, locked })
}

/** Always rolls two dice so the amount of randomness used does not depend on the career. */
function rollCash(rng: Rng, career: Career | undefined): number {
  const rolls = [rollD6(rng), rollD6(rng)]
  if (!career) return 0
  const sum = rolls.slice(0, career.cash.dice).reduce((a, b) => a + b, 0)
  return sum * career.cash.multiplier
}

function rollD6(rng: Rng): number {
  return Math.floor(rng() * 6) + 1
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

function definedOnly<T extends object>(obj: Partial<T>): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}
