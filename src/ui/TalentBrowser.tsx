import { useEffect, useMemo, useState } from 'preact/hooks'
import { RULES, careersOf } from '../domain/rules'
import {
  filterFromValue,
  filterTalents,
  filterToValue,
  groupTalents,
  type TalentFilter,
} from '../domain/talentSearch'
import type { Talent } from '../domain/types'
import { lang, useLocalize, useT } from '../i18n'

const ALL: TalentFilter = { kind: 'all' }

export function TalentBrowser({ id }: { id?: string }) {
  const t = useT()
  const loc = useLocalize()
  const l = lang.value
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TalentFilter>(ALL)

  useEffect(() => {
    if (id) document.getElementById(entryId(id))?.scrollIntoView({ block: 'start' })
  }, [id])

  const groups = useMemo(
    () => groupTalents(RULES, filterTalents(RULES, { query, filter }, l)),
    [query, filter, l],
  )
  const empty = groups.careers.length === 0 && groups.general.length === 0

  const entry = (talent: Talent) => (
    <details key={talent.id} id={entryId(talent.id)} class="talent" open={talent.id === id}>
      <summary>
        <strong>{loc(talent.label)}</strong>
        {careersOf(RULES, talent.id).map((c) => (
          <span key={c.id} class="badge">
            {loc(c.label)}
          </span>
        ))}
        <span class="muted small">{t('talents.page', { page: talent.page })}</span>
        <span class="small talent-summary">{loc(talent.description)}</span>
      </summary>
      <p>{loc(talent.details)}</p>
    </details>
  )

  return (
    <section class="talents">
      <div class="toolbar">
        <h2>{t('talents.title')}</h2>
      </div>
      <div class="filters">
        <input
          type="search"
          value={query}
          placeholder={t('talents.search')}
          aria-label={t('talents.search')}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
        <select
          value={filterToValue(filter)}
          aria-label={t('talents.filter')}
          onChange={(e) => setFilter(filterFromValue(e.currentTarget.value))}
        >
          <option value="all">{t('talents.filter.all')}</option>
          <option value="general">{t('talents.filter.general')}</option>
          {RULES.careers.map((c) => (
            <option key={c.id} value={filterToValue({ kind: 'career', careerId: c.id })}>
              {loc(c.label)}
            </option>
          ))}
        </select>
      </div>

      {empty && <p class="empty muted">{t('talents.empty')}</p>}

      {groups.careers.length > 0 && (
        <section class="panel">
          <h3>{t('talents.group.career')}</h3>
          {groups.careers.map((g) => (
            <div key={g.career.id} class="talent-group">
              <h4>{loc(g.career.label)}</h4>
              {g.talents.map(entry)}
            </div>
          ))}
        </section>
      )}

      {groups.general.length > 0 && (
        <section class="panel">
          <h3>{t('talents.group.general')}</h3>
          <p class="muted small">{t('talents.generalNote')}</p>
          {groups.general.map(entry)}
        </section>
      )}
    </section>
  )
}

function entryId(talentId: string): string {
  return `talent-${talentId}`
}
