import { describe, expect, it } from 'vitest'
import { TESTS, TEST_GROUPS, TEST_PRIMER, findTest, isTestId, localizedFieldsOf } from './tests'
import { LANGS, type Localized } from './types'

function expectText(field: Localized, context: string) {
  for (const l of LANGS) expect(field[l].trim(), `${context} (${l})`).not.toBe('')
}

describe('TESTS', () => {
  it('has unique ids', () => {
    expect(new Set(TESTS.map((t) => t.id)).size).toBe(TESTS.length)
  })

  it('links only to other known tests', () => {
    for (const t of TESTS) {
      for (const r of t.related) {
        expect(r, t.id).not.toBe(t.id)
        expect(isTestId(r), `${t.id} → ${r}`).toBe(true)
      }
    }
  })

  it('has text in every language', () => {
    for (const t of TESTS) for (const f of localizedFieldsOf(t)) expectText(f, t.id)
  })

  it('keeps summaries to one short line', () => {
    for (const t of TESTS)
      for (const l of LANGS) expect(t.summary[l].length, t.id).toBeLessThanOrEqual(140)
  })

  it('has tables with a cell for every column', () => {
    for (const t of TESTS) {
      if (!t.table) continue
      expect(t.table.columns.length, t.id).toBeGreaterThanOrEqual(2)
      expect(t.table.rows.length, t.id).toBeGreaterThan(0)
      for (const row of t.table.rows) expect(row.length, t.id).toBe(t.table.columns.length)
    }
  })

  it('lists each group in book order', () => {
    for (const group of TEST_GROUPS) {
      const pages = TESTS.filter((t) => t.group === group).map((t) => t.page)
      expect(pages).toEqual([...pages].sort((a, b) => a - b))
    }
  })

  it('treats the Survival roll as an unpushable Stamina roll without stress dice', () => {
    const survival = findTest('survival')
    expect(survival?.group).toBe('core')
    expect(survival?.page).toBe(99)
    expect(survival?.roll.canPush).toBe(false)
    expect(survival?.roll.stressDice).toBe(false)
  })

  it('does not recognise unknown ids', () => {
    expect(isTestId('survival')).toBe(true)
    expect(isTestId('explosion')).toBe(false)
    expect(isTestId('')).toBe(false)
  })
})

describe('TEST_PRIMER', () => {
  it('has unique ids, text in every language and pages from the test chapter', () => {
    expect(new Set(TEST_PRIMER.map((s) => s.id)).size).toBe(TEST_PRIMER.length)
    for (const s of TEST_PRIMER) {
      expectText(s.label, s.id)
      expectText(s.text, s.id)
      expect(s.page, s.id).toBeGreaterThanOrEqual(58)
      expect(s.page, s.id).toBeLessThanOrEqual(64)
    }
  })
})
