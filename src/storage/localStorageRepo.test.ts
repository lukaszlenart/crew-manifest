import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { validCharacter } from '../domain/testing'
import { CORRUPT_BACKUP_KEY, LocalStorageRepo, STORAGE_KEY } from './localStorageRepo'
import { MemoryStorage } from './memoryStorage'
import { StorageError } from './repository'

let storage: MemoryStorage
let logger: { warn: Mock<(...args: unknown[]) => void> }
let ids: number
let repo: LocalStorageRepo

beforeEach(() => {
  storage = new MemoryStorage()
  logger = { warn: vi.fn<(...args: unknown[]) => void>() }
  ids = 0
  repo = new LocalStorageRepo({
    storage,
    logger,
    now: () => '2026-02-02T00:00:00.000Z',
    newId: () => `new-${++ids}`,
  })
})

describe('LocalStorageRepo', () => {
  it('starts empty', async () => {
    expect(await repo.list()).toEqual([])
  })

  it('saves, lists, gets, updates and deletes', async () => {
    const c = validCharacter({ id: 'a' })
    const saved = await repo.save(c)
    expect(saved.updatedAt).toBe('2026-02-02T00:00:00.000Z')
    expect(await repo.list()).toEqual([saved])
    expect(await repo.get('a')).toEqual(saved)
    expect(await repo.get('missing')).toBeUndefined()

    await repo.save({ ...saved, name: 'Renamed' })
    expect((await repo.list()).map((x) => x.name)).toEqual(['Renamed'])

    await repo.delete('a')
    expect(await repo.list()).toEqual([])
  })

  it('persists across repository instances', async () => {
    await repo.save(validCharacter({ id: 'a' }))
    const other = new LocalStorageRepo({ storage, logger })
    expect((await other.list()).map((c) => c.id)).toEqual(['a'])
  })

  it('duplicates under a new id', async () => {
    await repo.save(validCharacter({ id: 'a', gear: ['knife'] }))
    const copy = await repo.duplicate('a', 'Copy')
    expect(copy).toMatchObject({ id: 'new-1', name: 'Copy', gear: ['knife'] })
    expect((await repo.list()).map((c) => c.id)).toEqual(['a', 'new-1'])
    expect(await repo.duplicate('missing')).toBeUndefined()
  })

  it('skips invalid entries with a warning and keeps them on write', async () => {
    const good = validCharacter({ id: 'good' })
    const bad = { id: 'bad', name: 42 }
    storage.setItem(STORAGE_KEY, JSON.stringify([good, bad, null]))

    expect(await repo.list()).toEqual([good])
    expect(logger.warn).toHaveBeenCalledTimes(2)

    await repo.save(validCharacter({ id: 'other' }))
    const raw = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]') as unknown[]
    expect(raw).toHaveLength(4)
    expect(raw).toContainEqual(bad)
  })

  it('survives non-JSON data and backs it up before overwriting', async () => {
    storage.setItem(STORAGE_KEY, '{not json')
    expect(await repo.list()).toEqual([])
    expect(logger.warn).toHaveBeenCalled()

    await repo.save(validCharacter({ id: 'a' }))
    expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBe('{not json')
    expect((await repo.list()).map((c) => c.id)).toEqual(['a'])
  })

  it('treats a non-array value as corrupt', async () => {
    storage.setItem(STORAGE_KEY, '{"a":1}')
    expect(await repo.list()).toEqual([])
  })

  it('does not throw when reading fails, but reports write failures', async () => {
    const broken = new MemoryStorage()
    broken.getItem = () => {
      throw new Error('denied')
    }
    broken.setItem = () => {
      throw new Error('quota')
    }
    const r = new LocalStorageRepo({ storage: broken, logger })
    expect(await r.list()).toEqual([])
    await expect(r.save(validCharacter())).rejects.toBeInstanceOf(StorageError)
  })

  it('reports missing storage on write', async () => {
    const r = new LocalStorageRepo({ storage: undefined, logger })
    expect(await r.list()).toEqual([])
    await expect(r.save(validCharacter())).rejects.toBeInstanceOf(StorageError)
  })

  it('replaces everything', async () => {
    await repo.save(validCharacter({ id: 'a' }))
    await repo.replaceAll([validCharacter({ id: 'b' })])
    expect((await repo.list()).map((c) => c.id)).toEqual(['b'])
  })
})
