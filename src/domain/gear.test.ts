import { describe, expect, it } from 'vitest'
import { gearItemText } from './gear'

describe('gearItemText', () => {
  it('returns the label of a non-firearm', () => {
    const item = { label: { en: 'Flashlight', pl: 'Latarka' } }
    expect(gearItemText(item, 'en')).toBe('Flashlight')
    expect(gearItemText(item, 'pl')).toBe('Latarka')
  })

  it('adds the starting reloads to a firearm', () => {
    const item = { label: { en: 'M41A Pulse Rifle', pl: 'Karabin impulsowy M41A' }, firearm: true }
    expect(gearItemText(item, 'en')).toBe('M41A Pulse Rifle (2 reloads)')
    expect(gearItemText(item, 'pl')).toBe('Karabin impulsowy M41A (2 przeładowania)')
  })
})
