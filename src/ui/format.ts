import { RULES, findCareer } from '../domain/rules'
import type { Attribute, Character, Lang } from '../domain/types'

/** Short attribute label derived from the localized name (e.g. "STR"). */
export function attributeShort(attr: Attribute, l: Lang): string {
  return RULES.attributes[attr].label[l].slice(0, 3).toUpperCase()
}

export function careerLabel(c: Pick<Character, 'careerId'>, l: Lang): string | undefined {
  return findCareer(RULES, c.careerId)?.label[l]
}

export function cleanGear(gear: string[]): string[] {
  return gear.map((g) => g.trim()).filter((g) => g !== '')
}
