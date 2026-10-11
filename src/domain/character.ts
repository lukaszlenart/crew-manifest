import type { Character, Rules } from './types'
import { ATTRIBUTES, SKILLS } from './types'

/** A blank character: no career, attributes at their minimum, no skills. */
export function emptyCharacter(rules: Rules, id: string, now: string): Character {
  return {
    id,
    schemaVersion: 1,
    name: '',
    careerId: '',
    attributes: Object.fromEntries(
      ATTRIBUTES.map((a) => [a, rules.limits.attributeMin]),
    ) as Character['attributes'],
    skills: Object.fromEntries(
      SKILLS.map((s) => [s, rules.limits.skillMin]),
    ) as Character['skills'],
    talentId: '',
    appearance: '',
    personalAgenda: '',
    buddy: '',
    rival: '',
    signatureItem: '',
    gear: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}
