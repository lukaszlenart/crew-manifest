import type { ComponentChildren } from 'preact'
import { useT } from '../../i18n'

interface Props {
  title: string
  locked: boolean
  onToggleLock: () => void
  onReroll: () => void
  children?: ComponentChildren
}

export function SectionHeader({ title, locked, onToggleLock, onReroll, children }: Props) {
  const t = useT()
  return (
    <div class="section-header">
      <h3>{title}</h3>
      {children}
      <span class="section-actions">
        <button
          type="button"
          class={`icon-button lock${locked ? ' active' : ''}`}
          aria-pressed={locked}
          title={locked ? t('common.unlock') : t('common.lock')}
          aria-label={`${locked ? t('common.unlock') : t('common.lock')}: ${title}`}
          onClick={onToggleLock}
        >
          {locked ? '🔒' : '🔓'}
        </button>
        <button
          type="button"
          class="icon-button"
          disabled={locked}
          title={t('common.reroll')}
          aria-label={`${t('common.reroll')}: ${title}`}
          onClick={onReroll}
        >
          🎲
        </button>
      </span>
    </div>
  )
}
