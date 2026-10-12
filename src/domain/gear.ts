import { RULES_LIMITS } from './rules'
import type { GearItem, Lang, Localized } from './types'

const RELOADS: Localized = { en: 'reloads', pl: 'przeładowania' }

/** The text stored on a character for a gear item; firearms come with their starting reloads. */
export function gearItemText(item: GearItem, lang: Lang): string {
  const label = item.label[lang]
  return item.firearm ? `${label} (${RULES_LIMITS.startingReloads} ${RELOADS[lang]})` : label
}
