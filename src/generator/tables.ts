import type { CareerId, Lang, Sex } from '../domain/types'
import { EN_TABLES } from './tables-en'
import { PL_TABLES } from './tables-pl'

/**
 * Random tables for narrative fields. Career tables come from the rulebook career pages;
 * general tables are original entries. Polish entries may use `{masculine|feminine}` markers.
 */
export interface GeneralTables {
  firstNames: Record<Sex, string[]>
  lastNames: string[]
  appearance: string[]
  personalAgenda: string[]
  buddy: string[]
  rival: string[]
  signatureItem: string[]
}

export interface CareerTables {
  /** Full names, "First Last". */
  names: Record<Sex, string[]>
  appearance: string[]
  personalAgenda: string[]
  signatureItem: string[]
}

export interface LangTables {
  general: GeneralTables
  careers: Record<CareerId, CareerTables>
}

export const TABLES: Record<Lang, LangTables> = { en: EN_TABLES, pl: PL_TABLES }
