import { describe, expect, it } from 'vitest'
import { RULES } from './rules'
import {
  filterFromValue,
  filterTalents,
  filterToValue,
  groupTalents,
  type TalentFilter,
} from './talentSearch'
import type { Rules, Talent } from './types'

function tal(id: string, en: string, pl: string, details = { en: '', pl: '' }): Talent {
  return { id, page: 78, label: { en, pl }, description: { en: '', pl: '' }, details }
}

const killer = tal('killer', 'Killer', 'Zabójca', {
  en: 'Swap the d66 dice on a critical injury.',
  pl: 'Zamieniasz kości k66 przy ranie ciężkiej.',
})
const dodge = tal('dodge', 'Dodge', 'Unik', {
  en: 'Roll Mobility, +2 is not involved.',
  pl: 'Rzucasz na Sprawność.',
})
const heavy = tal('heavyBlow', 'Heavy Blow', 'Silny cios', {
  en: '+2 to Close Combat (fast action).',
  pl: 'Modyfikator +2 do Walki Wręcz.',
})
const lungs = tal('deep', 'Deep Breather', 'Spokojny oddech', {
  en: 'Roll two fewer dice.',
  pl: 'Rzucasz dwiema kośćmi mniej, łapiąc oddech.',
})

const [firstCareer, secondCareer] = RULES.careers
if (!firstCareer || !secondCareer) throw new Error('fixture needs two careers')

const rules: Rules = {
  ...RULES,
  careers: [
    { ...firstCareer, id: 'kid', talents: ['dodge'] },
    { ...secondCareer, id: 'marine', talents: ['heavyBlow'] },
  ],
  talents: [killer, dodge, heavy, lungs],
}

const all: TalentFilter = { kind: 'all' }
const ids = (ts: Talent[]) => ts.map((t) => t.id)
const search = (query: string, lang: 'en' | 'pl' = 'pl', filter: TalentFilter = all) =>
  ids(filterTalents(rules, { query, filter }, lang))

describe('filterTalents', () => {
  it('returns everything sorted by the current-language label for an empty query', () => {
    expect(search('', 'en')).toEqual(['deep', 'dodge', 'heavyBlow', 'killer'])
    expect(search('   ', 'pl')).toEqual(['heavyBlow', 'deep', 'dodge', 'killer'])
  })

  it('ignores case and Polish diacritics, including ł', () => {
    expect(search('zabojca')).toEqual(['killer'])
    expect(search('ZABÓJCA')).toEqual(['killer'])
    expect(search('lapiac')).toEqual(['deep'])
    expect(search('ŁAPIĄC')).toEqual(['deep'])
  })

  it('searches label, description and details', () => {
    expect(search('k66')).toEqual(['killer'])
    expect(search('sprawność')).toEqual(['dodge'])
  })

  it('requires every word to match', () => {
    expect(search('walki +2')).toEqual(['heavyBlow'])
    expect(search('walki zabojca')).toEqual([])
  })

  it('treats regex characters and extra whitespace as plain text', () => {
    expect(search('  +2  ', 'en')).toEqual(['dodge', 'heavyBlow'])
    expect(search('(fast', 'en')).toEqual(['heavyBlow'])
    expect(() => search('[(*', 'en')).not.toThrow()
  })

  it('searches only the current language', () => {
    expect(search('killer', 'pl')).toEqual([])
    expect(search('zabojca', 'en')).toEqual([])
  })

  it('filters by career and general', () => {
    expect(search('', 'en', { kind: 'career', careerId: 'kid' })).toEqual(['dodge'])
    expect(search('', 'en', { kind: 'general' })).toEqual(['deep', 'killer'])
  })
})

describe('groupTalents', () => {
  it('groups by career in career order and keeps the rest as general', () => {
    const groups = groupTalents(rules, filterTalents(rules, { query: '', filter: all }, 'en'))
    expect(groups.careers.map((g) => [g.career.id, ids(g.talents)])).toEqual([
      ['kid', ['dodge']],
      ['marine', ['heavyBlow']],
    ])
    expect(ids(groups.general)).toEqual(['deep', 'killer'])
  })

  it('omits careers with no talents left', () => {
    const groups = groupTalents(rules, [killer])
    expect(groups.careers).toEqual([])
    expect(ids(groups.general)).toEqual(['killer'])
  })
})

describe('filter <select> values', () => {
  it('round-trips every filter', () => {
    const filters: TalentFilter[] = [
      { kind: 'all' },
      { kind: 'general' },
      { kind: 'career', careerId: 'kid' },
    ]
    for (const f of filters) expect(filterFromValue(filterToValue(f))).toEqual(f)
  })

  it('falls back to all for unknown values', () => {
    expect(filterFromValue('bogus')).toEqual({ kind: 'all' })
    expect(filterFromValue('career:')).toEqual({ kind: 'all' })
  })
})
