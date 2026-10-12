import { describe, expect, it } from 'vitest'
import { validCharacter } from '../domain/testing'
import type { Character } from '../domain/types'
import { parseCharacter } from './schema'

describe('parseCharacter', () => {
  it('accepts both sexes', () => {
    for (const sex of ['female', 'male'] as const) {
      const result = parseCharacter(validCharacter({ sex }))
      expect(result.ok).toBe(true)
    }
  })

  it('rejects a character without sex', () => {
    const withoutSex: Partial<Character> = validCharacter()
    delete withoutSex.sex
    const result = parseCharacter(withoutSex)
    expect(result).toEqual({ ok: false, error: expect.stringContaining('sex') })
  })

  it('rejects an unknown sex', () => {
    const result = parseCharacter({ ...validCharacter(), sex: 'other' })
    expect(result).toEqual({ ok: false, error: expect.stringContaining('sex') })
  })

  it('rejects a character without cash', () => {
    const withoutCash: Partial<Character> = validCharacter()
    delete withoutCash.cash
    const result = parseCharacter(withoutCash)
    expect(result).toEqual({ ok: false, error: expect.stringContaining('cash') })
  })

  it('round-trips an android', () => {
    const android = validCharacter({ kind: 'android', androidBonus: ['strength', 'wits'] })
    expect(parseCharacter(android)).toEqual({ ok: true, value: android })
  })

  it('rejects a character without kind', () => {
    const withoutKind: Partial<Character> = validCharacter()
    delete withoutKind.kind
    expect(parseCharacter(withoutKind)).toEqual({
      ok: false,
      error: expect.stringContaining('kind'),
    })
  })

  it('rejects an unknown bonus attribute', () => {
    const result = parseCharacter({ ...validCharacter(), androidBonus: ['luck'] })
    expect(result).toEqual({ ok: false, error: expect.stringContaining('androidBonus') })
  })
})
