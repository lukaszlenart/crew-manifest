import { describe, expect, it } from 'vitest'
import { href, parseRoute } from './router'

describe('parseRoute', () => {
  it('parses known routes', () => {
    expect(parseRoute('')).toEqual({ name: 'list' })
    expect(parseRoute('#/')).toEqual({ name: 'list' })
    expect(parseRoute('#/new')).toEqual({ name: 'new' })
    expect(parseRoute('#/edit/abc')).toEqual({ name: 'edit', id: 'abc' })
    expect(parseRoute('#/sheet/abc')).toEqual({ name: 'sheet', id: 'abc' })
    expect(parseRoute('#/print/a,b')).toEqual({ name: 'print', ids: ['a', 'b'] })
  })

  it('parses the talents routes', () => {
    expect(parseRoute('#/talents')).toEqual({ name: 'talents' })
    expect(parseRoute('#/talents/dodge')).toEqual({ name: 'talents', id: 'dodge' })
    expect(parseRoute('#/talents/a%20b')).toEqual({ name: 'talents', id: 'a b' })
  })

  it('parses the skills routes and ignores an unknown skill', () => {
    expect(parseRoute('#/skills')).toEqual({ name: 'skills' })
    expect(parseRoute('#/skills/comtech')).toEqual({ name: 'skills', id: 'comtech' })
    expect(parseRoute('#/skills/bogus')).toEqual({ name: 'skills' })
  })

  it('falls back to the list', () => {
    expect(parseRoute('#/edit')).toEqual({ name: 'list' })
    expect(parseRoute('#/whatever')).toEqual({ name: 'list' })
  })

  it('falls back to the list for a malformed escape', () => {
    expect(parseRoute('#/talents/%')).toEqual({ name: 'list' })
    expect(parseRoute('#/edit/%E0')).toEqual({ name: 'list' })
  })

  it('round-trips hrefs', () => {
    expect(parseRoute(href.edit('x y'))).toEqual({ name: 'edit', id: 'x y' })
    expect(parseRoute(href.print(['a', 'b']))).toEqual({ name: 'print', ids: ['a', 'b'] })
  })

  it('round-trips talent hrefs', () => {
    expect(href.talents()).toBe('#/talents')
    expect(parseRoute(href.talents('x/y z'))).toEqual({ name: 'talents', id: 'x/y z' })
  })

  it('round-trips skill hrefs', () => {
    expect(href.skills()).toBe('#/skills')
    expect(parseRoute(href.skills('medicalAid'))).toEqual({ name: 'skills', id: 'medicalAid' })
  })
})
