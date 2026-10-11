import type { Character } from './types'

/** Health equals Strength. Derived, never stored. */
export function health(c: Pick<Character, 'attributes'>): number {
  return c.attributes.strength
}
