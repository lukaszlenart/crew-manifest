import { useEffect, useMemo, useState } from 'preact/hooks'
import { RULES, careersWithKeySkill } from '../domain/rules'
import {
  filterSkills,
  groupSkills,
  skillFilterFromValue,
  skillFilterToValue,
  type SkillFilter,
} from '../domain/skillSearch'
import type { Skill } from '../domain/types'
import { lang, useLocalize, useT } from '../i18n'

const ALL: SkillFilter = { kind: 'all' }

export function SkillBrowser({ id }: { id?: Skill }) {
  const t = useT()
  const loc = useLocalize()
  const l = lang.value
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SkillFilter>(ALL)

  useEffect(() => {
    if (id) document.getElementById(entryId(id))?.scrollIntoView({ block: 'start' })
  }, [id])

  const groups = useMemo(
    () => groupSkills(RULES, filterSkills(RULES, { query, filter }, l)),
    [query, filter, l],
  )

  const entry = (skill: Skill) => {
    const info = RULES.skills[skill]
    const careers = careersWithKeySkill(RULES, skill)
    return (
      <details key={skill} id={entryId(skill)} class="skill" open={skill === id}>
        <summary>
          <strong>{loc(info.label)}</strong>
          {careers.length > 0 && <span class="muted small">{t('skills.keyFor')}</span>}
          {careers.map((c) => (
            <span key={c.id} class="badge">
              {loc(c.label)}
            </span>
          ))}
          <span class="muted small">{t('talents.page', { page: info.page })}</span>
          <span class="small talent-summary">{loc(info.description)}</span>
        </summary>
        <p>{loc(info.details)}</p>
      </details>
    )
  }

  return (
    <section class="skills">
      <div class="toolbar">
        <h2>{t('skills.title')}</h2>
      </div>
      <div class="filters">
        <input
          type="search"
          value={query}
          placeholder={t('skills.search')}
          aria-label={t('skills.search')}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
        <select
          value={skillFilterToValue(filter)}
          aria-label={t('skills.filter')}
          onChange={(e) => setFilter(skillFilterFromValue(e.currentTarget.value))}
        >
          <option value="all">{t('skills.filter.all')}</option>
          {RULES.careers.map((c) => (
            <option key={c.id} value={skillFilterToValue({ kind: 'career', careerId: c.id })}>
              {t('skills.filter.career', { career: loc(c.label) })}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 && <p class="empty muted">{t('skills.empty')}</p>}

      {groups.map((g) => (
        <section key={g.attribute} class="panel">
          <h3>{loc(RULES.attributes[g.attribute].label)}</h3>
          {g.skills.map(entry)}
        </section>
      ))}
    </section>
  )
}

function entryId(skill: Skill): string {
  return `skill-${skill}`
}
