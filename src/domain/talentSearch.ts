import { careersOf } from './rules'
import { matchesAllWords } from './textSearch'
import type { Career, CareerId, Lang, Rules, Talent } from './types'

export type TalentFilter =
  { kind: 'all' } | { kind: 'general' } | { kind: 'career'; careerId: CareerId }

export function filterTalents(
  rules: Rules,
  options: { query: string; filter: TalentFilter },
  lang: Lang,
): Talent[] {
  return rules.talents
    .filter((t) => matchesFilter(rules, t, options.filter))
    .filter((t) =>
      matchesAllWords(
        options.query,
        [t.label[lang], t.description[lang], t.details[lang]].join(' '),
      ),
    )
    .sort((a, b) => a.label[lang].localeCompare(b.label[lang], lang))
}

export function groupTalents(
  rules: Rules,
  talents: Talent[],
): { careers: { career: Career; talents: Talent[] }[]; general: Talent[] } {
  const careers = rules.careers
    .map((career) => ({ career, talents: talents.filter((t) => career.talents.includes(t.id)) }))
    .filter((g) => g.talents.length > 0)
  const general = talents.filter((t) => careersOf(rules, t.id).length === 0)
  return { careers, general }
}

export function filterToValue(filter: TalentFilter): string {
  return filter.kind === 'career' ? `career:${filter.careerId}` : filter.kind
}

export function filterFromValue(value: string): TalentFilter {
  if (value === 'general') return { kind: 'general' }
  if (value.startsWith('career:') && value.length > 'career:'.length)
    return { kind: 'career', careerId: value.slice('career:'.length) }
  return { kind: 'all' }
}

function matchesFilter(rules: Rules, talent: Talent, filter: TalentFilter): boolean {
  if (filter.kind === 'all') return true
  const careers = careersOf(rules, talent.id)
  if (filter.kind === 'general') return careers.length === 0
  return careers.some((c) => c.id === filter.careerId)
}
