import { describe, expect, it } from 'vitest'
import { RULES } from '../domain/rules'
import { LANGS, SEXES } from '../domain/types'
import { resolveGender } from './gender'
import { TABLES, type LangTables } from './tables'

function allEntries(t: LangTables): string[] {
  const g = t.general
  const careers = Object.values(t.careers).flatMap((c) => [
    ...c.names.female,
    ...c.names.male,
    ...c.appearance,
    ...c.personalAgenda,
    ...c.signatureItem,
  ])
  return [
    ...g.firstNames.female,
    ...g.firstNames.male,
    ...g.lastNames,
    ...g.appearance,
    ...g.personalAgenda,
    ...g.buddy,
    ...g.rival,
    ...g.signatureItem,
    ...careers,
  ]
}

describe('TABLES', () => {
  for (const lang of LANGS) {
    it(`has a non-empty table for every career (${lang})`, () => {
      for (const career of RULES.careers) {
        const c = TABLES[lang].careers[career.id]
        expect(c, career.id).toBeDefined()
        for (const list of [
          c?.names.female,
          c?.names.male,
          c?.appearance,
          c?.personalAgenda,
          c?.signatureItem,
        ]) {
          expect(list?.length, career.id).toBeGreaterThan(0)
        }
      }
    })

    it(`has the general pool sizes from the spec (${lang})`, () => {
      const g = TABLES[lang].general
      expect(g.firstNames.female.length).toBeGreaterThanOrEqual(15)
      expect(g.firstNames.male.length).toBeGreaterThanOrEqual(15)
      expect(g.lastNames.length).toBeGreaterThanOrEqual(20)
      for (const list of [g.appearance, g.personalAgenda, g.buddy, g.rival, g.signatureItem]) {
        expect(list.length).toBeGreaterThanOrEqual(10)
      }
    })

    it(`resolves every entry cleanly for both sexes (${lang})`, () => {
      for (const entry of allEntries(TABLES[lang])) {
        for (const sex of SEXES) {
          expect(resolveGender(entry, sex), entry).not.toMatch(/[{}|]/)
          expect(resolveGender(entry, sex).trim(), entry).not.toBe('')
        }
      }
    })
  }
})
