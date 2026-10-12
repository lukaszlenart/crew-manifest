import { describe, expect, it } from 'vitest'
import { RULES } from './rules'
import {
  filterSkills,
  groupSkills,
  skillFilterFromValue,
  skillFilterToValue,
  type SkillFilter,
} from './skillSearch'
import { SKILLS, type Rules, type Skill } from './types'

const plain = (en: string, pl: string) => ({ en, pl })

const skills = Object.fromEntries(
  SKILLS.map((s) => [
    s,
    { ...RULES.skills[s], description: plain('', ''), details: plain('', '') },
  ]),
) as Rules['skills']
skills.survival.details = plain(
  'Find shelter on a hostile planet.',
  'Szukasz schronienia, łapiąc oddech.',
)
skills.medicalAid.description = plain('Heal the Broken.', 'Leczysz Pokonanych.')
skills.comtech.details = plain('Hack (any) computer.', 'Łamiesz zabezpieczenia komputera.')

const [firstCareer, secondCareer] = RULES.careers
if (!firstCareer || !secondCareer) throw new Error('fixture needs two careers')

const rules: Rules = {
  ...RULES,
  skills,
  careers: [
    { ...firstCareer, id: 'kid', keySkills: ['mobility', 'comtech', 'stamina'] },
    { ...secondCareer, id: 'doc', keySkills: ['medicalAid', 'observation', 'stamina'] },
  ],
}

const all: SkillFilter = { kind: 'all' }
const search = (query: string, lang: 'en' | 'pl' = 'pl', filter: SkillFilter = all) =>
  filterSkills(rules, { query, filter }, lang)

describe('filterSkills', () => {
  it('returns every skill in rulebook order for an empty query', () => {
    expect(search('', 'en')).toEqual([...SKILLS])
    expect(search('   ', 'pl')).toEqual([...SKILLS])
  })

  it('ignores case and Polish diacritics, including ł', () => {
    expect(search('ciezki')).toEqual(['heavyMachinery'])
    expect(search('LAPIAC')).toEqual(['survival'])
    expect(search('łamiesz')).toEqual(['comtech'])
  })

  it('searches label, description and details in the current language only', () => {
    expect(search('piloting', 'en')).toEqual(['piloting'])
    expect(search('broken', 'en')).toEqual(['medicalAid'])
    expect(search('shelter', 'en')).toEqual(['survival'])
    expect(search('shelter', 'pl')).toEqual([])
  })

  it('requires every word and treats regex characters as text', () => {
    expect(search('walka wręcz')).toEqual(['closeCombat'])
    expect(search('walka zabojca')).toEqual([])
    expect(search('(any)', 'en')).toEqual(['comtech'])
    expect(() => search('[(*', 'en')).not.toThrow()
  })

  it('filters by the key skills of a career', () => {
    expect(search('', 'en', { kind: 'career', careerId: 'kid' })).toEqual([
      'stamina',
      'mobility',
      'comtech',
    ])
    expect(search('', 'en', { kind: 'career', careerId: 'nobody' })).toEqual([])
  })
})

describe('groupSkills', () => {
  it('groups by attribute in attribute order and omits empty groups', () => {
    const groups = groupSkills(rules, ['medicalAid', 'stamina', 'heavyMachinery'] as Skill[])
    expect(groups.map((g) => [g.attribute, g.skills])).toEqual([
      ['strength', ['heavyMachinery', 'stamina']],
      ['empathy', ['medicalAid']],
    ])
  })
})

describe('skill filter <select> values', () => {
  it('round-trips every filter', () => {
    const filters: SkillFilter[] = [{ kind: 'all' }, { kind: 'career', careerId: 'kid' }]
    for (const f of filters) expect(skillFilterFromValue(skillFilterToValue(f))).toEqual(f)
  })

  it('falls back to all for unknown values', () => {
    expect(skillFilterFromValue('bogus')).toEqual({ kind: 'all' })
    expect(skillFilterFromValue('career:')).toEqual({ kind: 'all' })
  })
})
