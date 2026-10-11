import type { Character } from '../domain/types'

/** Persistence boundary. Async so that an IndexedDB implementation can drop in later. */
export interface CharacterRepository {
  list(): Promise<Character[]>
  get(id: string): Promise<Character | undefined>
  /** Inserts or updates by id; sets `updatedAt`. Returns the stored character. */
  save(character: Character): Promise<Character>
  delete(id: string): Promise<void>
  /** Copies a character under a new id. `name` overrides the copy's name. */
  duplicate(id: string, name?: string): Promise<Character | undefined>
  /** Replaces the whole collection (used by backup import). */
  replaceAll(characters: Character[]): Promise<void>
}

export class StorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'StorageError'
  }
}
