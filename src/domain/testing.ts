import { RULES } from './rules'
import type { Career, Character, GearOption, Rules, Talent } from './types'

const loc = (s: string) => ({ en: s, pl: s })
const talent = (id: string): Talent => ({
  id,
  label: loc(id),
  description: loc(id),
  details: loc(id),
  page: 74,
})
const item = (s: string) => ({ label: loc(s) })
const gear: GearOption[] = [
  [item('g1a'), item('g1b')],
  [item('g2a'), item('g2b')],
  [item('g3a'), item('g3b')],
]

/** Fixed rules for tests, independent of the (GM-edited) data in `rules.ts`. */
export const TEST_RULES: Rules = {
  ...RULES,
  careers: [
    {
      id: 'roughneck',
      label: loc('roughneck'),
      keyAttribute: 'strength',
      keySkills: ['heavyMachinery', 'stamina', 'closeCombat'],
      talents: ['t1', 't2'],
      gearOptions: gear,
      cash: { dice: 1, multiplier: 100 },
    },
    {
      id: 'scientist',
      label: loc('scientist'),
      keyAttribute: 'wits',
      keySkills: ['observation', 'survival', 'comtech'],
      talents: ['t3'],
      gearOptions: gear,
      cash: { dice: 1, multiplier: 100 },
    },
  ],
  talents: [talent('t1'), talent('t2'), talent('t3')],
}

/** A valid character for the first career of TEST_RULES. */
export function validCharacter(overrides: Partial<Character> = {}): Character {
  const career = TEST_RULES.careers[0] as Career
  return {
    id: 'test-id',
    schemaVersion: 1,
    name: 'Ellen',
    sex: 'female',
    kind: 'human',
    androidBonus: [],
    careerId: career.id,
    attributes: { strength: 5, agility: 3, wits: 3, empathy: 3 },
    skills: {
      heavyMachinery: 3,
      stamina: 3,
      closeCombat: 3,
      mobility: 1,
      piloting: 0,
      rangedCombat: 0,
      observation: 0,
      survival: 0,
      comtech: 0,
      command: 0,
      manipulation: 0,
      medicalAid: 0,
    },
    talentId: 't1',
    appearance: '',
    personalAgenda: '',
    buddy: '',
    rival: '',
    signatureItem: '',
    gear: [],
    cash: 300,
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
