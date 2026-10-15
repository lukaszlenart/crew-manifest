import { signal } from '@preact/signals'
import type { Character } from '../domain/types'
import { LocalStorageRepo } from '../storage/localStorageRepo'
import type { CharacterRepository } from '../storage/repository'
import type { MessageKey } from '../i18n'

export const repo: CharacterRepository = new LocalStorageRepo()

export const characters = signal<Character[]>([])
export const loaded = signal(false)
/** Last storage error, shown as a banner. */
export const storageError = signal<MessageKey | null>(null)

export async function reload(): Promise<void> {
  characters.value = await repo.list()
  loaded.value = true
}

async function guarded<T>(action: () => Promise<T>): Promise<T | undefined> {
  try {
    const result = await action()
    storageError.value = null
    return result
  } catch (error) {
    console.error(error)
    storageError.value = 'storage.writeError'
    return undefined
  } finally {
    await reload()
  }
}

export const saveCharacter = (c: Character) => guarded(() => repo.save(c))
export const deleteCharacter = (id: string) => guarded(() => repo.delete(id))
export const duplicateCharacter = (id: string, name: string) =>
  guarded(() => repo.duplicate(id, name))
/** Backup payload from a `#/import/...` link, waiting for the import dialog. */
export const pendingImport = signal<string | null>(null)

export const replaceAllCharacters = (list: Character[]) => guarded(() => repo.replaceAll(list))

/** Status of the last editor save, so it survives the editor remount after `#/new` → `#/edit/:id`. */
export const lastSaved = signal<{ id: string; status: 'saved' | 'savedDraft' } | null>(null)
