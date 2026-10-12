import type { ComponentChildren } from 'preact'
import { effectiveAttributes, health } from '../domain/derived'
import { RULES, findCareer, findTalent } from '../domain/rules'
import type { Character } from '../domain/types'
import { ATTRIBUTES, SKILLS } from '../domain/types'
import { validateCharacter } from '../domain/validation'
import { useLocalize, useT } from '../i18n'
import { cleanGear } from './format'
import { href } from './router'
import { characters, loaded } from './store'

export function CharacterSheet({ id }: { id: string }) {
  const t = useT()
  if (!loaded.value) return <p>{t('common.loading')}</p>
  const c = characters.value.find((x) => x.id === id)
  if (!c) return <NotFound />
  return (
    <section>
      <div class="toolbar no-print">
        <a class="button" href={href.list()}>
          {t('common.back')}
        </a>
        <span class="spacer" />
        <a class="button" href={href.edit(c.id)}>
          {t('common.edit')}
        </a>
        <button type="button" class="primary" onClick={() => window.print()}>
          🖶 {t('common.print')}
        </button>
      </div>
      <SheetCard character={c} />
    </section>
  )
}

export function PrintView({ ids }: { ids: string[] }) {
  const t = useT()
  if (!loaded.value) return <p>{t('common.loading')}</p>
  const selected = ids
    .map((id) => characters.value.find((c) => c.id === id))
    .filter((c): c is Character => c !== undefined)
  if (selected.length === 0) return <NotFound />
  return (
    <section>
      <div class="toolbar no-print">
        <a class="button" href={href.list()}>
          {t('common.back')}
        </a>
        <span class="muted">{t('sheet.printCount', { count: selected.length })}</span>
        <span class="spacer" />
        <button type="button" class="primary" onClick={() => window.print()}>
          🖶 {t('common.print')}
        </button>
      </div>
      {selected.map((c) => (
        <SheetCard key={c.id} character={c} />
      ))}
    </section>
  )
}

function NotFound() {
  const t = useT()
  return (
    <section class="panel">
      <p>{t('common.notFound')}</p>
      <a href={href.list()}>{t('common.back')}</a>
    </section>
  )
}

export function SheetCard({ character: c }: { character: Character }) {
  const t = useT()
  const loc = useLocalize()
  const career = findCareer(RULES, c.careerId)
  const talent = findTalent(RULES, c.talentId)
  const isDraft = validateCharacter(c, RULES).length > 0
  const gear = cleanGear(c.gear)
  const isAndroid = c.kind === 'android'
  const attributes = effectiveAttributes(c, RULES)

  return (
    <article class="sheet panel">
      <header class="sheet-header">
        <div>
          <h2 class="sheet-name">{c.name.trim() || t('character.unnamed')}</h2>
          <div class="sheet-career">
            {career ? loc(career.label) : t('character.noCareer')} · {t(`sex.${c.sex}`)}
          </div>
        </div>
        {isDraft && <span class="badge draft">{t('list.draft')}</span>}
        {isAndroid && <span class="badge">{t('kind.android')}</span>}
        <div class="sheet-health">
          <span>{t('editor.health')}</span>
          <strong>{health(c, RULES)}</strong>
        </div>
      </header>

      <div class="sheet-stats">
        {ATTRIBUTES.map((a) => (
          <div class="sheet-attr" key={a}>
            <div class="sheet-attr-head">
              <span>
                {loc(RULES.attributes[a].label)}
                {career?.keyAttribute === a && <span class="key-mark">★</span>}
              </span>
              <strong>{attributes[a]}</strong>
            </div>
            <ul class="sheet-skills">
              {SKILLS.filter((s) => RULES.skills[s].attribute === a).map((s) => (
                <li key={s} class={c.skills[s] > 0 ? '' : 'zero'}>
                  <span>
                    {loc(RULES.skills[s].label)}
                    {career?.keySkills.includes(s) && <span class="key-mark">★</span>}
                  </span>
                  <strong>{c.skills[s]}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div class="sheet-grid">
        <SheetField label={t('section.talentId')}>
          {talent ? (
            <>
              <a href={href.talents(talent.id)}>
                <strong>{loc(talent.label)}</strong>
              </a>
              <div class="small">{loc(talent.description)}</div>
            </>
          ) : (
            '—'
          )}
        </SheetField>
        <SheetField label={t('section.gear')}>
          {gear.length > 0 ? (
            <ul class="plain">
              {gear.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          ) : (
            '—'
          )}
        </SheetField>
        <SheetField label={t('section.cash')}>{t('sheet.cash', { amount: c.cash })}</SheetField>
        {!isAndroid && (
          <SheetField label={t('section.signatureItem')}>{c.signatureItem || '—'}</SheetField>
        )}
        <SheetField label={t('section.personalAgenda')}>{c.personalAgenda || '—'}</SheetField>
        <SheetField label={t('section.buddy')}>{c.buddy || '—'}</SheetField>
        <SheetField label={t('section.rival')}>{c.rival || '—'}</SheetField>
        <SheetField label={t('section.appearance')} wide>
          {c.appearance || '—'}
        </SheetField>
        {isAndroid && (
          <SheetField label={t('sheet.androidRules')} wide>
            {t('sheet.androidRulesText')}
          </SheetField>
        )}
        {c.notes.trim() !== '' && (
          <SheetField label={t('section.notes')} wide>
            <div class="pre">{c.notes}</div>
          </SheetField>
        )}
      </div>
    </article>
  )
}

function SheetField({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ComponentChildren
}) {
  return (
    <div class={`sheet-field${wide ? ' wide' : ''}`}>
      <h3>{label}</h3>
      <div>{children}</div>
    </div>
  )
}
