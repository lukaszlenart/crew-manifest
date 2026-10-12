import { describe, expect, it } from 'vitest'
import { resolveGender } from './gender'

describe('resolveGender', () => {
  it('picks the masculine form for male and the feminine form for female', () => {
    expect(resolveGender('pomogł{eś|aś}', 'male')).toBe('pomogłeś')
    expect(resolveGender('pomogł{eś|aś}', 'female')).toBe('pomogłaś')
  })

  it('resolves several markers in one string', () => {
    const text = 'Niechlujn{y|a} i rozczochran{y|a}'
    expect(resolveGender(text, 'female')).toBe('Niechlujna i rozczochrana')
  })

  it('allows whole words and an empty form', () => {
    expect(resolveGender('{wziąłeś|wzięłaś}', 'female')).toBe('wzięłaś')
    expect(resolveGender('ok{|!}', 'male')).toBe('ok')
  })

  it('leaves text without markers unchanged', () => {
    expect(resolveGender('Plain text', 'female')).toBe('Plain text')
  })

  it('leaves malformed markers unchanged', () => {
    expect(resolveGender('{a|b', 'male')).toBe('{a|b')
    expect(resolveGender('{a|b|c}', 'male')).toBe('{a|b|c}')
  })
})
