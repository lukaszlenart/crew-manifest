export type Lang = 'en' | 'pl'

export const LANGS: readonly Lang[] = ['en', 'pl']

/** User-visible text from the rulebook, in every supported language. */
export type Localized = Record<Lang, string>

export type Sex = 'female' | 'male'

export const SEXES: readonly Sex[] = ['female', 'male']

export type Attribute = 'strength' | 'agility' | 'wits' | 'empathy'

export const ATTRIBUTES: readonly Attribute[] = ['strength', 'agility', 'wits', 'empathy']

export type Skill =
  | 'heavyMachinery'
  | 'stamina'
  | 'closeCombat' // Strength
  | 'mobility'
  | 'piloting'
  | 'rangedCombat' // Agility
  | 'observation'
  | 'survival'
  | 'comtech' // Wits
  | 'command'
  | 'manipulation'
  | 'medicalAid' // Empathy

export const SKILLS: readonly Skill[] = [
  'heavyMachinery',
  'stamina',
  'closeCombat',
  'mobility',
  'piloting',
  'rangedCombat',
  'observation',
  'survival',
  'comtech',
  'command',
  'manipulation',
  'medicalAid',
]

/**
 * Career and talent ids are plain strings so that stored characters survive edits of
 * `rules.ts`; an unknown id is reported by validation instead of breaking the app.
 */
export type CareerId = string
export type TalentId = string

export interface Career {
  id: CareerId
  label: Localized
  keyAttribute: Attribute
  keySkills: Skill[]
  talents: TalentId[]
  gearOptions: GearOption[]
  cash: CashRoll
}

/** Starting cash: `dice` × D6, times `multiplier` dollars. */
export interface CashRoll {
  dice: number
  multiplier: number
}

export interface GearItem {
  label: Localized
  firearm?: boolean
}

/** One rulebook gear line: the character takes one of the two items. */
export type GearOption = [GearItem, GearItem]

export interface Talent {
  id: TalentId
  label: Localized
  description: Localized
}

export interface RuleLimits {
  attributeTotal: number
  attributeMin: number
  attributeMax: number
  keyAttributeMax: number
  skillTotal: number
  skillMin: number
  keySkillMax: number
  otherSkillMax: number
  gearCount: number
  startingReloads: number
}

export interface Rules {
  limits: RuleLimits
  attributes: Record<Attribute, { label: Localized }>
  skills: Record<Skill, { attribute: Attribute; label: Localized }>
  careers: Career[]
  talents: Talent[]
}

export interface Character {
  id: string
  schemaVersion: 1
  name: string
  sex: Sex
  careerId: CareerId
  attributes: Record<Attribute, number>
  skills: Record<Skill, number>
  /** Empty string while no talent is chosen (draft). */
  talentId: TalentId
  appearance: string
  personalAgenda: string
  buddy: string
  rival: string
  signatureItem: string
  gear: string[]
  cash: number
  notes: string
  createdAt: string
  updatedAt: string
}
