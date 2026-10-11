import { newId } from '../domain/id'
import type { Character } from '../domain/types'
import { StorageError, type CharacterRepository } from './repository'
import { parseCharacter } from './schema'

export const STORAGE_KEY = 'crew-manifest/characters'
export const CORRUPT_BACKUP_KEY = 'crew-manifest/characters.corrupt'

type Logger = Pick<Console, 'warn'>

export interface LocalStorageRepoOptions {
  storage?: Storage | undefined
  now?: () => string
  newId?: () => string
  logger?: Logger
}

interface Snapshot {
  characters: Character[]
  /** Entries that failed validation; kept verbatim on write so no data is silently lost. */
  invalid: unknown[]
  /** Raw value that was not parseable JSON at all. */
  corruptRaw?: string
}

export class LocalStorageRepo implements CharacterRepository {
  private readonly storage: Storage | undefined
  private readonly now: () => string
  private readonly newId: () => string
  private readonly logger: Logger

  constructor(options: LocalStorageRepoOptions = {}) {
    this.storage = 'storage' in options ? options.storage : safeLocalStorage()
    this.now = options.now ?? (() => new Date().toISOString())
    this.newId = options.newId ?? (() => newId())
    this.logger = options.logger ?? console
  }

  async list(): Promise<Character[]> {
    return this.read().characters
  }

  async get(id: string): Promise<Character | undefined> {
    return this.read().characters.find((c) => c.id === id)
  }

  async save(character: Character): Promise<Character> {
    const snapshot = this.read()
    const stored = { ...character, updatedAt: this.now() }
    const index = snapshot.characters.findIndex((c) => c.id === stored.id)
    if (index >= 0) snapshot.characters[index] = stored
    else snapshot.characters.push(stored)
    this.write(snapshot)
    return stored
  }

  async delete(id: string): Promise<void> {
    const snapshot = this.read()
    snapshot.characters = snapshot.characters.filter((c) => c.id !== id)
    this.write(snapshot)
  }

  async duplicate(id: string, name?: string): Promise<Character | undefined> {
    const snapshot = this.read()
    const source = snapshot.characters.find((c) => c.id === id)
    if (!source) return undefined
    const now = this.now()
    const copy: Character = {
      ...structuredClone(source),
      id: this.newId(),
      name: name ?? source.name,
      createdAt: now,
      updatedAt: now,
    }
    snapshot.characters.push(copy)
    this.write(snapshot)
    return copy
  }

  async replaceAll(characters: Character[]): Promise<void> {
    this.write({ characters: [...characters], invalid: [] })
  }

  private read(): Snapshot {
    let raw: string | null
    try {
      raw = this.storage?.getItem(STORAGE_KEY) ?? null
    } catch (error) {
      this.logger.warn('crew-manifest: cannot read localStorage', error)
      return { characters: [], invalid: [] }
    }
    if (raw === null) return { characters: [], invalid: [] }

    let data: unknown
    try {
      data = JSON.parse(raw)
    } catch (error) {
      this.logger.warn('crew-manifest: stored characters are not valid JSON', error)
      return { characters: [], invalid: [], corruptRaw: raw }
    }
    if (!Array.isArray(data)) {
      this.logger.warn('crew-manifest: stored characters are not an array')
      return { characters: [], invalid: [], corruptRaw: raw }
    }

    const snapshot: Snapshot = { characters: [], invalid: [] }
    data.forEach((entry: unknown, index) => {
      const result = parseCharacter(entry)
      if (result.ok) snapshot.characters.push(result.value)
      else {
        this.logger.warn(`crew-manifest: skipping invalid character #${index}: ${result.error}`)
        snapshot.invalid.push(entry)
      }
    })
    return snapshot
  }

  private write(snapshot: Snapshot): void {
    if (!this.storage) throw new StorageError('localStorage is not available')
    try {
      if (snapshot.corruptRaw !== undefined) {
        // Keep a copy of unreadable data before overwriting it.
        this.storage.setItem(CORRUPT_BACKUP_KEY, snapshot.corruptRaw)
      }
      this.storage.setItem(
        STORAGE_KEY,
        JSON.stringify([...snapshot.characters, ...snapshot.invalid]),
      )
    } catch (error) {
      throw new StorageError('Cannot write to localStorage', { cause: error })
    }
  }
}

function safeLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}
