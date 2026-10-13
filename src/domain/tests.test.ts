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

  it('has the core tests in book order', () => {
    expect(TESTS.filter((t) => t.group === 'core').map((t) => [t.id, t.page])).toEqual([
      ['supply', 34],
      ['survival', 99],
      ['panic', 104],
      ['stopPanic', 104],
    ])
  })

  it('gives the supply and panic rolls their tables and links panic both ways', () => {
    expect(findTest('supply')?.table).toBeDefined()
    expect(findTest('panic')?.table).toBeDefined()
    expect(findTest('panic')?.related).toContain('stopPanic')
    expect(findTest('stopPanic')?.related).toContain('panic')
  })

  it('has the four conditions in book order', () => {
    expect(TESTS.filter((t) => t.group === 'condition').map((t) => [t.id, t.page])).toEqual([
      ['starving', 106],
      ['dehydrated', 106],
      ['exhausted', 106],
      ['chilled', 107],
    ])
  })

  it('links supply to what running out causes, and conditions to the Survival roll', () => {
    expect(findTest('supply')?.related).toEqual(['starving', 'dehydrated', 'suffocation'])
    for (const id of ['starving', 'dehydrated', 'chilled']) {
      expect(findTest(id)?.related, id).toContain('survival')
    }
    expect(findTest('chilled')?.table).toBeDefined()
  })

  it('keeps the vacuum entry to vacuum only', () => {
    expect(findTest('vacuum')?.label.en).toBe('Vacuum')
    expect(findTest('vacuum')?.table).toBeUndefined()
  })

  it('has the hazards in book order, without explosions', () => {
    expect(TESTS.filter((t) => t.group === 'hazard').map((t) => [t.id, t.page])).toEqual([
      ['vacuum', 107],
      ['fall', 108],
      ['fire', 108],
      ['disease', 109],
      ['radiation', 110],
      ['drowning', 110],
      ['suffocation', 110],
    ])
  })

  it('links hazards that end in a Survival roll to it', () => {
    for (const id of ['fire', 'radiation', 'drowning', 'suffocation']) {
      expect(findTest(id)?.related, id).toContain('survival')
    }
    expect(findTest('radiation')?.table).toBeDefined()
  })

  it('cites printed pages inside the rulebook', () => {
    for (const t of TESTS) {
      expect(t.page, t.id).toBeGreaterThanOrEqual(1)
      expect(t.page, t.id).toBeLessThanOrEqual(396)
    }
  })

  it('states the panic-table spreads to witnesses and ranges as the book does', () => {
    const effect = (total: string) =>
      findTest('panic')?.table?.rows.find((r) => r[0]?.en === total)?.[1]
    expect(effect('14')?.en).toMatch(/see it roll for panic/)
    expect(effect('14')?.pl).toMatch(/testują panikę/)
    expect(effect('13')?.en).toMatch(/no attacks/)
    expect(effect('13')?.pl).toMatch(/nie atakujesz/)
    for (const total of ['7', '10', '11']) {
      expect(effect(total)?.en, total).toMatch(/at Short range/)
      expect(effect(total)?.pl, total).toMatch(/w bliskim zasięgu/)
    }
  })

  it('does not recognise unknown ids', () => {
    expect(isTestId('survival')).toBe(true)
    expect(isTestId('explosion')).toBe(false)
    expect(isTestId('')).toBe(false)
  })
})

describe('TEST_PRIMER', () => {
  it('covers the general test rules in book order', () => {
    expect(TEST_PRIMER.map((s) => [s.id, s.page])).toEqual([
      ['rolling', 58],
      ['pushing', 60],
      ['stressDice', 61],
      ['groupTests', 62],
      ['modifiers', 62],
      ['help', 63],
      ['opposedTests', 64],
    ])
  })

  it('keeps stress dice in a roll without the skill', () => {
    const rolling = TEST_PRIMER.find((s) => s.id === 'rolling')
    expect(rolling?.text.en).toMatch(/stress dice still apply/)
    expect(rolling?.text.pl).toMatch(/kości stresu nadal się liczą/)
  })

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
