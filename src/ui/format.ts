import { RULES, findCareer } from '../domain/rules'
import type { Character, Lang } from '../domain/types'

export function careerLabel(c: Pick<Character, 'careerId'>, l: Lang): string | undefined {
  return findCareer(RULES, c.careerId)?.label[l]
}

export function cleanGear(gear: string[]): string[] {
  return gear.map((g) => g.trim()).filter((g) => g !== '')
}
