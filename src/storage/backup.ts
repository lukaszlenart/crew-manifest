import { z } from 'zod'
import type { Character } from '../domain/types'
import { parseCharacter } from './schema'

export const BACKUP_APP = 'crew-manifest'
export const BACKUP_FORMAT_VERSION = 1

export interface BackupFile {
  app: typeof BACKUP_APP
  formatVersion: typeof BACKUP_FORMAT_VERSION
  exportedAt: string
  characters: Character[]
}

const EnvelopeSchema = z.object({
  app: z.literal(BACKUP_APP),
  formatVersion: z.number().int(),
  characters: z.array(z.unknown()),
})

export type ImportMode = 'merge' | 'replace'

export interface RejectedEntry {
  index: number
  name?: string
  reason: string
}

export type ParsedBackup =
  | { ok: true; characters: Character[]; rejected: RejectedEntry[] }
  | { ok: false; error: 'invalidJson' | 'invalidFormat' | 'unsupportedVersion' }

/** `crew-manifest-YYYY-MM-DD.json`, using the local date. */
export function backupFilename(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `crew-manifest-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}

export function serializeBackup(characters: Character[], now: Date): string {
  const file: BackupFile = {
    app: BACKUP_APP,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: now.toISOString(),
    characters,
  }
  return JSON.stringify(file, null, 2)
}

/** Accepts a backup file or a bare array of characters; validates every entry separately. */
export function parseBackup(text: string): ParsedBackup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'invalidJson' }
  }

  let entries: unknown[]
  if (Array.isArray(data)) entries = data
  else {
    const envelope = EnvelopeSchema.safeParse(data)
    if (!envelope.success) return { ok: false, error: 'invalidFormat' }
    if (envelope.data.formatVersion > BACKUP_FORMAT_VERSION)
      return { ok: false, error: 'unsupportedVersion' }
    entries = envelope.data.characters
  }

  const characters: Character[] = []
  const rejected: RejectedEntry[] = []
  entries.forEach((entry, index) => {
    const result = parseCharacter(entry)
    if (result.ok) characters.push(result.value)
    else rejected.push({ index, name: nameOf(entry), reason: result.error })
  })
  return { ok: true, characters, rejected }
}

/**
 * merge: imported characters overwrite existing ones with the same id, new ones are appended.
 * replace: the result is exactly the imported characters.
 * Within the import, a later entry with a repeated id wins.
 */
export function applyImport(
  existing: Character[],
  imported: Character[],
  mode: ImportMode,
): Character[] {
  const byId = new Map<string, Character>()
  if (mode === 'merge') for (const c of existing) byId.set(c.id, c)
  for (const c of imported) byId.set(c.id, c)
  return [...byId.values()]
}

function nameOf(entry: unknown): string | undefined {
  if (typeof entry === 'object' && entry !== null && 'name' in entry) {
    const name = (entry as { name: unknown }).name
    if (typeof name === 'string' && name.trim() !== '') return name
  }
  return undefined
}
