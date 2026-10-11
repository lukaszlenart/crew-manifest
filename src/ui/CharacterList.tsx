import { useMemo, useState } from 'preact/hooks'
import { RULES } from '../domain/rules'
import type { Character } from '../domain/types'
import { ATTRIBUTES } from '../domain/types'
import { validateCharacter } from '../domain/validation'
import { lang, useLocalize, useT } from '../i18n'
import { BackupControls } from './components/BackupControls'
import { attributeShort, careerLabel } from './format'
import { href, navigate } from './router'
import { useShortcuts } from './shortcuts'
import { characters, deleteCharacter, duplicateCharacter, loaded } from './store'

export function CharacterList() {
  const t = useT()
  const loc = useLocalize()
  const [query, setQuery] = useState('')
  const [careerFilter, setCareerFilter] = useState('')
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  useShortcuts({
    n: () => navigate(href.new()),
    '/': () => document.getElementById('search')?.focus(),
  })

  const all = characters.value
  const l = lang.value
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter((c) => careerFilter === '' || c.careerId === careerFilter)
      .filter(
        (c) =>
          q === '' ||
          c.name.toLowerCase().includes(q) ||
          (careerLabel(c, l) ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [all, query, careerFilter, l])

  if (!loaded.value) return <p>{t('common.loading')}</p>

  // Ignore selections of characters that no longer exist.
  const selectedIds = all.filter((c) => selected.has(c.id)).map((c) => c.id)
  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <section>
      <div class="toolbar">
        <h2>{t('list.title')}</h2>
        <span class="muted">{t('list.count', { count: all.length })}</span>
        <span class="spacer" />
        <BackupControls />
        {selectedIds.length > 0 && (
          <a class="button" href={href.print(selectedIds)}>
            🖶 {t('list.printSelected', { count: selectedIds.length })}
          </a>
        )}
        <a class="button primary" href={href.new()}>
          + {t('nav.new')}
        </a>
      </div>

      {all.length > 0 && (
        <div class="filters">
          <input
            id="search"
            type="search"
            value={query}
            placeholder={t('list.search')}
            aria-label={t('list.search')}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
          <select
            value={careerFilter}
            aria-label={t('list.filterCareer')}
            onChange={(e) => setCareerFilter(e.currentTarget.value)}
          >
            <option value="">{t('list.allCareers')}</option>
            {RULES.careers.map((c) => (
              <option key={c.id} value={c.id}>
                {loc(c.label)}
              </option>
            ))}
          </select>
        </div>
      )}

      {all.length === 0 ? (
        <div class="empty panel">
          <p>{t('list.empty')}</p>
          <a class="button primary" href={href.new()}>
            + {t('nav.new')}
          </a>
        </div>
      ) : filtered.length === 0 ? (
        <p class="empty muted">{t('list.noMatches')}</p>
      ) : (
        <ul class="cards">
          {filtered.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              selected={selected.has(c.id)}
              onToggle={() => toggle(c.id)}
            />
          ))}
        </ul>
      )}
      <p class="muted small shortcuts-hint">{t('shortcuts.list')}</p>
    </section>
  )
}

interface CardProps {
  character: Character
  selected: boolean
  onToggle: () => void
}

function CharacterCard({ character: c, selected, onToggle }: CardProps) {
  const t = useT()
  const l = lang.value
  const isDraft = validateCharacter(c, RULES).length > 0
  const name = c.name.trim() || t('character.unnamed')

  const onDelete = () => {
    if (window.confirm(t('list.confirmDelete', { name }))) void deleteCharacter(c.id)
  }

  return (
    <li class="card panel">
      <div class="card-head">
        <input
          type="checkbox"
          class="select"
          checked={selected}
          aria-label={t('list.select', { name })}
          onChange={onToggle}
        />
        <a class="card-name" href={href.sheet(c.id)}>
          {name}
        </a>
        {isDraft && <span class="badge draft">{t('list.draft')}</span>}
      </div>
      <div class="muted">{careerLabel(c, l) ?? t('character.noCareer')}</div>
      <div class="attr-line">
        {ATTRIBUTES.map((a) => (
          <span key={a}>
            {attributeShort(a, l)} <strong>{c.attributes[a]}</strong>
          </span>
        ))}
      </div>
      <div class="card-actions">
        <a class="button" href={href.sheet(c.id)}>
          {t('common.sheet')}
        </a>
        <a class="button" href={href.edit(c.id)}>
          {t('common.edit')}
        </a>
        <button
          type="button"
          onClick={() => void duplicateCharacter(c.id, t('list.copyName', { name }))}
        >
          {t('common.duplicate')}
        </button>
        <button type="button" class="danger" onClick={onDelete}>
          {t('common.delete')}
        </button>
      </div>
    </li>
  )
}
