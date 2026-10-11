import type { Career, Rules, Skill, Talent } from './types'

/**
 * Character creation limits. Keep every number here so it is easy to correct.
 */
export const RULES_LIMITS = {
  attributeTotal: 14,
  attributeMin: 2,
  attributeMax: 4,
  keyAttributeMax: 5,
  skillTotal: 10,
  skillMin: 0,
  keySkillMax: 3,
  otherSkillMax: 1,
  // TODO: uzupełnić z podręcznika (number of gear items picked at creation)
  gearCount: 2,
} as const satisfies Rules['limits']

const ATTRIBUTES: Rules['attributes'] = {
  // TODO: uzupełnić z podręcznika (names as printed in the EN and PL editions)
  strength: { label: { en: 'Strength', pl: 'Siła' } },
  agility: { label: { en: 'Agility', pl: 'Zręczność' } },
  wits: { label: { en: 'Wits', pl: 'Spryt' } },
  empathy: { label: { en: 'Empathy', pl: 'Empatia' } },
}

// TODO: uzupełnić z podręcznika (PL skill names as printed in the Polish edition)
const SKILLS: Rules['skills'] = {
  heavyMachinery: {
    attribute: 'strength',
    label: { en: 'Heavy Machinery', pl: 'TODO: heavyMachinery' },
  },
  stamina: { attribute: 'strength', label: { en: 'Stamina', pl: 'TODO: stamina' } },
  closeCombat: { attribute: 'strength', label: { en: 'Close Combat', pl: 'TODO: closeCombat' } },
  mobility: { attribute: 'agility', label: { en: 'Mobility', pl: 'TODO: mobility' } },
  piloting: { attribute: 'agility', label: { en: 'Piloting', pl: 'TODO: piloting' } },
  rangedCombat: { attribute: 'agility', label: { en: 'Ranged Combat', pl: 'TODO: rangedCombat' } },
  observation: { attribute: 'wits', label: { en: 'Observation', pl: 'TODO: observation' } },
  survival: { attribute: 'wits', label: { en: 'Survival', pl: 'TODO: survival' } },
  comtech: { attribute: 'wits', label: { en: 'Comtech', pl: 'TODO: comtech' } },
  command: { attribute: 'empathy', label: { en: 'Command', pl: 'TODO: command' } },
  manipulation: { attribute: 'empathy', label: { en: 'Manipulation', pl: 'TODO: manipulation' } },
  medicalAid: { attribute: 'empathy', label: { en: 'Medical Aid', pl: 'TODO: medicalAid' } },
}

// TODO: uzupełnić z podręcznika — talents (names and short descriptions, EN and PL).
const TALENTS: Talent[] = [
  placeholderTalent('talent1'),
  placeholderTalent('talent2'),
  placeholderTalent('talent3'),
  placeholderTalent('talent4'),
  placeholderTalent('talent5'),
  placeholderTalent('talent6'),
]

// TODO: uzupełnić z podręcznika — careers: names, key attribute, key skills, talents, gear options.
// The entries below are structural placeholders only; they are NOT rulebook data.
const CAREERS: Career[] = [
  placeholderCareer(
    'career1',
    'strength',
    ['heavyMachinery', 'stamina', 'closeCombat'],
    ['talent1', 'talent2'],
  ),
  placeholderCareer(
    'career2',
    'agility',
    ['mobility', 'piloting', 'rangedCombat'],
    ['talent3', 'talent4'],
  ),
  placeholderCareer(
    'career3',
    'wits',
    ['observation', 'survival', 'comtech'],
    ['talent5', 'talent6'],
  ),
]

export const RULES: Rules = {
  limits: RULES_LIMITS,
  attributes: ATTRIBUTES,
  skills: SKILLS,
  careers: CAREERS,
  talents: TALENTS,
}

export function findCareer(rules: Rules, id: string): Career | undefined {
  return rules.careers.find((c) => c.id === id)
}

export function findTalent(rules: Rules, id: string): Talent | undefined {
  return rules.talents.find((t) => t.id === id)
}

function placeholderTalent(id: string): Talent {
  return {
    id,
    label: { en: `TODO: ${id}`, pl: `TODO: ${id}` },
    description: { en: 'TODO', pl: 'TODO' },
  }
}

function placeholderCareer(
  id: string,
  keyAttribute: Career['keyAttribute'],
  keySkills: Skill[],
  talents: string[],
): Career {
  return {
    id,
    label: { en: `TODO: ${id}`, pl: `TODO: ${id}` },
    keyAttribute,
    keySkills,
    talents,
    gearOptions: [
      { en: `TODO: ${id} gear 1`, pl: `TODO: ${id} sprzęt 1` },
      { en: `TODO: ${id} gear 2`, pl: `TODO: ${id} sprzęt 2` },
      { en: `TODO: ${id} gear 3`, pl: `TODO: ${id} sprzęt 3` },
    ],
  }
}
