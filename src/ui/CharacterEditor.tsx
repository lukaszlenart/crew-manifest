import { newId } from '../domain/id'
import type { ComponentChildren } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { emptyCharacter } from '../domain/character'
import { health } from '../domain/derived'
import { RULES, findCareer, findTalent } from '../domain/rules'
import type { Character } from '../domain/types'
import { ATTRIBUTES, SEXES, SKILLS } from '../domain/types'
import {
  attributeMax,
  issuesFor,
  remainingAttributePoints,
  remainingSkillPoints,
  skillMax,
  validateCharacter,
} from '../domain/validation'
import { SECTIONS, rerollSections, type Section } from '../generator/generate'
import { randomSeed } from '../generator/rng'
import { lang, useLocalize, useT } from '../i18n'
import { IssueList } from './components/IssueList'
import { SectionHeader } from './components/SectionHeader'
import { Stepper } from './components/Stepper'
import { cleanGear } from './format'
import { href, navigate } from './router'
import { useShortcuts } from './shortcuts'
import { characters, lastSaved, loaded, saveCharacter } from './store'

type TextSection = 'appearance' | 'personalAgenda' | 'buddy' | 'rival' | 'signatureItem'
const TEXT_SECTIONS: readonly TextSection[] = [
  'appearance',
  'personalAgenda',
  'buddy',
  'rival',
  'signatureItem',
]

export function CharacterEditor({ id }: { id?: string }) {
  const t = useT()
  if (id === undefined) {
    return (
      <EditorForm
        key="new"
        initial={emptyCharacter(RULES, newId(), new Date().toISOString())}
        isNew
      />
    )
  }
  if (!loaded.value) return <p>{t('common.loading')}</p>
  const existing = characters.value.find((c) => c.id === id)
  if (!existing) {
    return (
      <section class="panel">
        <p>{t('common.notFound')}</p>
        <a href={href.list()}>{t('common.back')}</a>
      </section>
    )
  }
  return <EditorForm key={id} initial={existing} isNew={false} />
}

function EditorForm({ initial, isNew }: { initial: Character; isNew: boolean }) {
  const t = useT()
  const loc = useLocalize()
  const [draft, setDraft] = useState(initial)
  const [locked, setLocked] = useState<ReadonlySet<Section>>(new Set())
  const [status, setStatus] = useState(() =>
    lastSaved.value?.id === initial.id ? lastSaved.value.status : null,
  )
  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    lastSaved.value = null
  }, [])

  const issues = useMemo(() => validateCharacter(draft, RULES), [draft])
  const career = findCareer(RULES, draft.careerId)
  const talent = findTalent(RULES, draft.talentId)
  const attrLeft = remainingAttributePoints(draft, RULES)
  const skillLeft = remainingSkillPoints(draft, RULES)

  const touch = () => {
    setDirty(true)
    setStatus(null)
  }
  const update = (patch: Partial<Character>) => {
    setDraft((d) => ({ ...d, ...patch }))
    touch()
  }
  const randomize = (sections: readonly Section[]) => {
    setDraft((d) =>
      rerollSections(d, sections, { seed: randomSeed(), lang: lang.value, keep: [...locked] }),
    )
    touch()
  }
  const toggleLock = (s: Section) => {
    const next = new Set(locked)
    if (next.has(s)) next.delete(s)
    else next.add(s)
    setLocked(next)
  }
  const header = (s: Section, extra?: ComponentChildren) => (
    <SectionHeader
      title={t(`section.${s}`)}
      locked={locked.has(s)}
      onToggleLock={() => toggleLock(s)}
      onReroll={() => randomize([s])}
    >
      {extra}
    </SectionHeader>
  )

  const save = async () => {
    const toSave = { ...draft, gear: cleanGear(draft.gear) }
    const saved = await saveCharacter(toSave)
    if (!saved) return
    setDraft(saved)
    setDirty(false)
    const savedStatus = validateCharacter(saved, RULES).length > 0 ? 'savedDraft' : 'saved'
    lastSaved.value = { id: saved.id, status: savedStatus }
    setStatus(savedStatus)
    if (isNew) navigate(href.edit(saved.id), { replace: true })
  }

  useShortcuts({ r: () => randomize(SECTIONS), 'mod+s': () => void save() })

  return (
    <form
      class="editor"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <div class="toolbar">
        <h2>{isNew ? t('editor.newTitle') : t('editor.editTitle')}</h2>
        <span class="spacer" />
        <button type="button" title="R" onClick={() => randomize(SECTIONS)}>
          🎲 {t('editor.randomizeAll')}
        </button>
        <button type="submit" class="primary" title="Ctrl+S / ⌘S">
          {t('common.save')}
        </button>
        {!isNew && (
          <a class="button" href={href.sheet(draft.id)}>
            {t('common.sheet')}
          </a>
        )}
        <a class="button" href={href.list()}>
          {t('common.back')}
        </a>
      </div>

      <div class="status-line" aria-live="polite">
        {issues.length > 0 && <span class="badge draft">{t('editor.draftNotice')}</span>}
        {status && <span class="badge ok">{t(`editor.${status}`)}</span>}
        {dirty && !status && <span class="muted">{t('editor.unsaved')}</span>}
      </div>

      <div class="editor-grid">
        <section class="panel">
          {header('name')}
          <input
            id="field-name"
            class="wide"
            value={draft.name}
            placeholder={t('editor.namePlaceholder')}
            onInput={(e) => update({ name: e.currentTarget.value })}
          />
          <IssueList issues={issuesFor(issues, 'name')} />

          {header('sex')}
          <div class="radio-row" role="radiogroup" aria-label={t('section.sex')}>
            {SEXES.map((s) => (
              <label key={s}>
                <input
                  type="radio"
                  name="sex"
                  value={s}
                  checked={draft.sex === s}
                  onChange={() => update({ sex: s })}
                />{' '}
                {t(`sex.${s}`)}
              </label>
            ))}
          </div>

          {header('careerId')}
          <select
            value={draft.careerId}
            onChange={(e) => update({ careerId: e.currentTarget.value })}
          >
            <option value="">{t('editor.chooseCareer')}</option>
            {RULES.careers.map((c) => (
              <option key={c.id} value={c.id}>
                {loc(c.label)}
              </option>
            ))}
          </select>
          <IssueList issues={issuesFor(issues, 'careerId')} />

          {header('talentId')}
          <select
            value={draft.talentId}
            onChange={(e) => update({ talentId: e.currentTarget.value })}
          >
            <option value="">{t('editor.chooseTalent')}</option>
            {(career?.talents ?? []).map((tid) => {
              const tal = findTalent(RULES, tid)
              return (
                <option key={tid} value={tid}>
                  {tal ? loc(tal.label) : tid}
                </option>
              )
            })}
            {draft.talentId !== '' && !career?.talents.includes(draft.talentId) && (
              <option value={draft.talentId}>{talent ? loc(talent.label) : draft.talentId}</option>
            )}
          </select>
          {talent && <p class="muted small">{loc(talent.description)}</p>}
          <IssueList issues={issuesFor(issues, 'talentId')} />
        </section>

        <section class="panel">
          {header(
            'attributes',
            <PointsLeft left={attrLeft} label={t('editor.pointsLeft', { count: attrLeft })} />,
          )}
          <table class="stats">
            <tbody>
              {ATTRIBUTES.map((a) => {
                const field = `attributes.${a}`
                const fieldIssues = issuesFor(issues, field)
                return (
                  <tr key={a}>
                    <th scope="row">
                      <label for={`attr-${a}`}>
                        {loc(RULES.attributes[a].label)}
                        {career?.keyAttribute === a && <KeyMark />}
                      </label>
                    </th>
                    <td>
                      <Stepper
                        id={`attr-${a}`}
                        value={draft.attributes[a]}
                        min={RULES.limits.attributeMin}
                        max={attributeMax(RULES, career, a)}
                        invalid={fieldIssues.length > 0}
                        onChange={(v) => update({ attributes: { ...draft.attributes, [a]: v } })}
                      />
                      <IssueList issues={fieldIssues} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p class="muted small">
            {t('editor.health')}: <strong>{health(draft)}</strong>
          </p>
          <IssueList issues={issuesFor(issues, 'attributes')} />
        </section>

        <section class="panel">
          {header(
            'skills',
            <PointsLeft left={skillLeft} label={t('editor.pointsLeft', { count: skillLeft })} />,
          )}
          <div class="skill-groups">
            {ATTRIBUTES.map((a) => (
              <table class="stats" key={a}>
                <caption>{loc(RULES.attributes[a].label)}</caption>
                <tbody>
                  {SKILLS.filter((s) => RULES.skills[s].attribute === a).map((s) => {
                    const fieldIssues = issuesFor(issues, `skills.${s}`)
                    return (
                      <tr key={s}>
                        <th scope="row">
                          <label for={`skill-${s}`}>
                            {loc(RULES.skills[s].label)}
                            {career?.keySkills.includes(s) && <KeyMark />}
                          </label>
                        </th>
                        <td>
                          <Stepper
                            id={`skill-${s}`}
                            value={draft.skills[s]}
                            min={RULES.limits.skillMin}
                            max={skillMax(RULES, career, s)}
                            invalid={fieldIssues.length > 0}
                            onChange={(v) => update({ skills: { ...draft.skills, [s]: v } })}
                          />
                          <IssueList issues={fieldIssues} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ))}
          </div>
          <IssueList issues={issuesFor(issues, 'skills')} />
        </section>

        <section class="panel">
          {header('gear')}
          <textarea
            rows={4}
            value={draft.gear.join('\n')}
            placeholder={t('editor.gearPlaceholder')}
            onInput={(e) => update({ gear: e.currentTarget.value.split('\n') })}
          />
          {career && career.gearOptions.length > 0 && (
            <div class="chips">
              <span class="muted small">{t('editor.gearOptions')}</span>
              {career.gearOptions.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  class="chip"
                  onClick={() => update({ gear: [...cleanGear(draft.gear), loc(g)] })}
                >
                  + {loc(g)}
                </button>
              ))}
            </div>
          )}
        </section>

        <section class="panel">
          {TEXT_SECTIONS.map((s) => (
            <div key={s}>
              {header(s)}
              <textarea
                rows={2}
                value={draft[s]}
                onInput={(e) => update({ [s]: e.currentTarget.value })}
              />
            </div>
          ))}
          <h3>
            <label for="field-notes">{t('section.notes')}</label>
          </h3>
          <textarea
            id="field-notes"
            rows={4}
            value={draft.notes}
            onInput={(e) => update({ notes: e.currentTarget.value })}
          />
        </section>
      </div>
      <p class="muted small shortcuts-hint">{t('shortcuts.editor')}</p>
    </form>
  )
}

function PointsLeft({ left, label }: { left: number; label: string }) {
  const cls = left === 0 ? 'ok' : left > 0 ? 'under' : 'over'
  return <span class={`badge points ${cls}`}>{label}</span>
}

function KeyMark() {
  const t = useT()
  return (
    <span class="key-mark" title={t('editor.key')} aria-label={t('editor.key')}>
      ★
    </span>
  )
}
