import { describe, expect, it } from 'vitest'
import type { TestEntry } from './tests'
import { filterTests, groupTests } from './testSearch'

const text = (en: string, pl: string) => ({ en, pl })
const blank = text('', '')

function entry(id: string, group: TestEntry['group'], extra: Partial<TestEntry> = {}): TestEntry {
  return {
    id,
    group,
    page: 1,
    label: text(id, id),
    summary: blank,
    roll: { pool: blank, canPush: true, stressDice: true },
    when: blank,
    outcome: blank,
    related: [],
    ...extra,
  }
}

const fixture: TestEntry[] = [
  entry('supply', 'core', { summary: text('Air runs out.', 'Kończy się powietrze.') }),
  entry('panic', 'core', {
    roll: {
      pool: text('D6 + Stress Level', 'K6 + poziom stresu'),
      canPush: false,
      stressDice: false,
    },
  }),
  entry('radiation', 'hazard', {
    table: {
      caption: text('Radiation levels', 'Poziomy promieniowania'),
      columns: [text('Level', 'Poziom'), text('Rads', 'Rady')],
      rows: [[text('Weak', 'Słabe'), text('1 per shift', '1 na wachtę')]],
    },
  }),
  entry('fall', 'hazard', { outcome: text('Damage (+2) halved', 'Obrażenia (+2) dzielone') }),
]

const ids = (tests: TestEntry[]) => tests.map((t) => t.id)
const search = (query: string, lang: 'en' | 'pl' = 'pl') => ids(filterTests(fixture, query, lang))

describe('filterTests', () => {
  it('returns everything in input order for an empty or blank query', () => {
    expect(search('')).toEqual(['supply', 'panic', 'radiation', 'fall'])
    expect(search('   ')).toEqual(['supply', 'panic', 'radiation', 'fall'])
  })

  it('ignores case and Polish diacritics, including ł', () => {
    expect(search('POWIETRZE')).toEqual(['supply'])
    expect(search('konczy')).toEqual(['supply'])
    expect(search('slabe')).toEqual(['radiation'])
  })

  it('searches the roll pool, outcome and table cells', () => {
    expect(search('stresu')).toEqual(['panic'])
    expect(search('wachte')).toEqual(['radiation'])
    expect(search('dzielone')).toEqual(['fall'])
    expect(search('rads', 'en')).toEqual(['radiation'])
  })

  it('requires every word and searches the current language only', () => {
    expect(search('poziomy promieniowania')).toEqual(['radiation'])
    expect(search('poziomy powietrze')).toEqual([])
    expect(search('shift', 'pl')).toEqual([])
    expect(search('shift', 'en')).toEqual(['radiation'])
  })

  it('treats regex characters and extra spaces as plain text', () => {
    expect(search('(+2)')).toEqual(['fall'])
    expect(search('  k6   +  ')).toEqual(['panic'])
  })
})

describe('groupTests', () => {
  it('puts core before hazards, keeps order and drops empty groups', () => {
    expect(groupTests(fixture).map((g) => [g.group, ids(g.tests)])).toEqual([
      ['core', ['supply', 'panic']],
      ['hazard', ['radiation', 'fall']],
    ])
    expect(groupTests(fixture.slice(2)).map((g) => g.group)).toEqual(['hazard'])
    expect(groupTests([])).toEqual([])
  })

  it('orders groups core, conditions, hazards', () => {
    const mixed = [entry('h', 'hazard'), entry('c', 'condition'), entry('k', 'core')]
    expect(groupTests(mixed).map((g) => g.group)).toEqual(['core', 'condition', 'hazard'])
  })
})
