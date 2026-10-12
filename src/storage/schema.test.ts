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
})
