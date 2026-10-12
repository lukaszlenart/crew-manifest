import { describe, expect, it } from 'vitest'
import { effectiveAttributes, health } from './derived'
import { TEST_RULES as R, validCharacter } from './testing'

const android = validCharacter({ kind: 'android', androidBonus: ['strength', 'wits'] })

describe('effectiveAttributes', () => {
  it('returns the base values for a human', () => {
    const c = validCharacter()
    expect(effectiveAttributes(c, R)).toEqual(c.attributes)
  })

  it('adds the android bonus to the chosen attributes', () => {
    expect(effectiveAttributes(android, R)).toEqual({
      strength: 8,
      agility: 3,
      wits: 6,
      empathy: 3,
    })
  })

  it('ignores a bonus left on a human', () => {
    const c = validCharacter({ androidBonus: ['strength'] })
    expect(effectiveAttributes(c, R)).toEqual(c.attributes)
  })
})

describe('health', () => {
  it('equals strength', () => {
    expect(health(validCharacter(), R)).toBe(5)
  })

  it('uses the android bonus to strength', () => {
    expect(health(android, R)).toBe(8)
  })
})
