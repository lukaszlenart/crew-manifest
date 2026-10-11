import { describe, expect, it } from 'vitest'
import { validCharacter } from '../domain/testing'
import { applyImport, backupFilename, parseBackup, serializeBackup } from './backup'
import { LocalStorageRepo, STORAGE_KEY } from './localStorageRepo'
import { MemoryStorage } from './memoryStorage'

const a = validCharacter({ id: 'a', name: 'Alpha' })
const b = validCharacter({ id: 'b', name: 'Bravo', notes: 'zażółć gęślą jaźń' })

describe('backupFilename', () => {
  it('uses the local date', () => {
    expect(backupFilename(new Date(2026, 0, 5, 23, 59))).toBe('crew-manifest-2026-01-05.json')
  })
})

describe('export → clear → import', () => {
  it('restores an identical state', async () => {
    const storage = new MemoryStorage()
    const repo = new LocalStorageRepo({ storage })
    await repo.save(a)
    await repo.save(b)
    const before = await repo.list()
    const rawBefore = storage.getItem(STORAGE_KEY)

    const file = serializeBackup(before, new Date('2026-03-03T10:00:00Z'))
    storage.clear()
    expect(await repo.list()).toEqual([])

    const parsed = parseBackup(file)
    if (!parsed.ok) throw new Error(parsed.error)
    expect(parsed.rejected).toEqual([])
    await repo.replaceAll(applyImport(await repo.list(), parsed.characters, 'replace'))

    expect(await repo.list()).toEqual(before)
    expect(storage.getItem(STORAGE_KEY)).toBe(rawBefore)
  })
})

describe('parseBackup', () => {
  it('rejects non-JSON and unknown formats', () => {
    expect(parseBackup('nope')).toEqual({ ok: false, error: 'invalidJson' })
    expect(parseBackup('{"foo":1}')).toEqual({ ok: false, error: 'invalidFormat' })
    expect(
      parseBackup(JSON.stringify({ app: 'crew-manifest', formatVersion: 99, characters: [] })),
    ).toEqual({ ok: false, error: 'unsupportedVersion' })
  })

  it('accepts a bare array', () => {
    const parsed = parseBackup(JSON.stringify([a]))
    expect(parsed).toEqual({ ok: true, characters: [a], rejected: [] })
  })

  it('reports rejected entries with index, name and reason', () => {
    const broken = { ...b, attributes: { strength: 'x' } }
    const parsed = parseBackup(serializeBackup([a, broken as never, 5 as never], new Date()))
    if (!parsed.ok) throw new Error('expected ok')
    expect(parsed.characters).toEqual([a])
    expect(parsed.rejected).toHaveLength(2)
    expect(parsed.rejected[0]).toMatchObject({ index: 1, name: 'Bravo' })
    expect(parsed.rejected[0]?.reason).toContain('attributes')
    expect(parsed.rejected[1]).toMatchObject({ index: 2, name: undefined })
  })
})

describe('applyImport', () => {
  const a2 = { ...a, name: 'Alpha v2' }
  const c = validCharacter({ id: 'c' })

  it('merges by id, overwriting existing entries', () => {
    expect(applyImport([a, b], [a2, c], 'merge')).toEqual([a2, b, c])
  })

  it('replaces everything', () => {
    expect(applyImport([a, b], [c], 'replace')).toEqual([c])
  })

  it('lets the last duplicate in the import win', () => {
    expect(applyImport([], [a, a2], 'replace')).toEqual([a2])
  })
})
