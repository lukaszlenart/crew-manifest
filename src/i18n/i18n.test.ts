import { describe, expect, it } from 'vitest'
import { en } from './en'
import { pl } from './pl'
import { detectLang, translate } from './index'

describe('i18n', () => {
  it('pl has exactly the keys of en', () => {
    expect(Object.keys(pl).sort()).toEqual(Object.keys(en).sort())
  })

  it('detects language from storage, then browser', () => {
    expect(detectLang('pl', 'en-US')).toBe('pl')
    expect(detectLang(null, 'pl-PL')).toBe('pl')
    expect(detectLang('xx', 'de-DE')).toBe('en')
    expect(detectLang(null, undefined)).toBe('en')
  })

  it('interpolates params', () => {
    expect(translate('en', 'list.count', { count: 3 })).toBe('Total: 3')
    expect(translate('pl', 'editor.pointsLeft', { count: -1 })).toBe('Pozostało punktów: -1')
    expect(translate('en', 'list.copyName')).toBe('{name} (copy)')
  })
})
