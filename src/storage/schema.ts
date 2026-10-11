import { z } from 'zod'
import type { Character } from '../domain/types'

export const CURRENT_SCHEMA_VERSION = 1

const int = z.number().int()

export const CharacterSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  name: z.string(),
  careerId: z.string(),
  attributes: z.object({ strength: int, agility: int, wits: int, empathy: int }),
  skills: z.object({
    heavyMachinery: int,
    stamina: int,
    closeCombat: int,
    mobility: int,
    piloting: int,
    rangedCombat: int,
    observation: int,
    survival: int,
    comtech: int,
    command: int,
    manipulation: int,
    medicalAid: int,
  }),
  talentId: z.string(),
  appearance: z.string(),
  personalAgenda: z.string(),
  buddy: z.string(),
  rival: z.string(),
  signatureItem: z.string(),
  gear: z.array(z.string()),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Compile-time check that the schema and the domain type agree in both directions.
type Parsed = z.infer<typeof CharacterSchema>
const _toDomain = (p: Parsed): Character => p
const _fromDomain = (c: Character): Parsed => c
void _toDomain
void _fromDomain

/**
 * Upgrades raw stored data to the current schema version. No-op while only version 1 exists;
 * add a step per version here (e.g. `if (v === 1) raw = fromV1(raw)`).
 */
export function migrate(raw: unknown): unknown {
  return raw
}

const MAX_REPORTED_ISSUES = 3

export type ParseResult = { ok: true; value: Character } | { ok: false; error: string }

export function parseCharacter(raw: unknown): ParseResult {
  const result = CharacterSchema.safeParse(migrate(raw))
  if (result.success) return { ok: true, value: result.data }
  const issues = result.error.issues.map((i) =>
    i.path.length > 0 ? `${i.path.join('.')}: ${i.message}` : i.message,
  )
  const shown = issues.slice(0, MAX_REPORTED_ISSUES).join('; ')
  const more = issues.length - MAX_REPORTED_ISSUES
  return { ok: false, error: more > 0 ? `${shown}; … (+${more})` : shown }
}
