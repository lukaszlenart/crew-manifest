import type { Sex } from '../domain/types'

/** One `{masculine|feminine}` marker, e.g. `pomogł{eś|aś}`. */
export const GENDER_MARKER = /\{([^{}|]*)\|([^{}|]*)\}/g

export function resolveGender(text: string, sex: Sex): string {
  return text.replace(GENDER_MARKER, (_, masculine: string, feminine: string) =>
    sex === 'male' ? masculine : feminine,
  )
}
