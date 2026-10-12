import type { Attribute, Character, Rules } from './types'
import { ATTRIBUTES } from './types'

type WithAttributes = Pick<Character, 'attributes' | 'kind' | 'androidBonus'>

/** Base attributes plus the android bonus. Derived, never stored. */
export function effectiveAttributes(c: WithAttributes, rules: Rules): Record<Attribute, number> {
  const bonus = (a: Attribute) =>
    c.kind === 'android' && c.androidBonus.includes(a) ? rules.limits.androidAttributeBonus : 0
  return Object.fromEntries(ATTRIBUTES.map((a) => [a, c.attributes[a] + bonus(a)])) as Record<
    Attribute,
    number
  >
}

/** Health equals effective Strength. Derived, never stored. */
export function health(c: WithAttributes, rules: Rules): number {
  return effectiveAttributes(c, rules).strength
}
