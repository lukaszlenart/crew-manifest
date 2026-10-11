import { useRef, useState } from 'preact/hooks'
import type { Character } from '../../domain/types'
import {
  applyImport,
  backupFilename,
  parseBackup,
  serializeBackup,
  type ImportMode,
  type RejectedEntry,
} from '../../storage/backup'
import { useT } from '../../i18n'
import { characters, replaceAllCharacters } from '../store'

type State =
  | { step: 'idle' }
  | {
      step: 'error'
      message: 'backup.invalidJson' | 'backup.invalidFormat' | 'backup.unsupportedVersion'
    }
  | { step: 'choose'; characters: Character[]; rejected: RejectedEntry[] }
  | { step: 'done'; loaded: number; rejected: RejectedEntry[]; mode: ImportMode }

export function BackupControls() {
  const t = useT()
  const fileInput = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<State>({ step: 'idle' })

  const exportAll = () => {
    const now = new Date()
    const blob = new Blob([serializeBackup(characters.value, now)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backupFilename(now)
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const parsed = parseBackup(await file.text())
    if (fileInput.current) fileInput.current.value = ''
    if (!parsed.ok) setState({ step: 'error', message: `backup.${parsed.error}` })
    else setState({ step: 'choose', characters: parsed.characters, rejected: parsed.rejected })
  }

  const runImport = async (mode: ImportMode) => {
    if (state.step !== 'choose') return
    if (mode === 'replace' && !window.confirm(t('backup.confirmReplace'))) return
    await replaceAllCharacters(applyImport(characters.value, state.characters, mode))
    setState({ step: 'done', loaded: state.characters.length, rejected: state.rejected, mode })
  }

  return (
    <>
      <button type="button" onClick={exportAll} disabled={characters.value.length === 0}>
        ⭳ {t('backup.export')}
      </button>
      <button type="button" onClick={() => fileInput.current?.click()}>
        ⭱ {t('backup.import')}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => void onFile(e.currentTarget.files?.[0])}
      />
      {state.step !== 'idle' && (
        <div class="backup-dialog panel" role="dialog" aria-live="polite">
          {state.step === 'error' && <p class="issues">{t(state.message)}</p>}
          {state.step === 'choose' && (
            <>
              <p>
                {t('backup.found', {
                  count: state.characters.length,
                  rejected: state.rejected.length,
                })}
              </p>
              <RejectedList rejected={state.rejected} />
              <div class="toolbar">
                <button
                  type="button"
                  class="primary"
                  disabled={state.characters.length === 0}
                  onClick={() => void runImport('merge')}
                >
                  {t('backup.merge')}
                </button>
                <button
                  type="button"
                  class="danger"
                  disabled={state.characters.length === 0}
                  onClick={() => void runImport('replace')}
                >
                  {t('backup.replace')}
                </button>
              </div>
              <p class="muted small">{t('backup.modeHelp')}</p>
            </>
          )}
          {state.step === 'done' && (
            <>
              <p>{t('backup.report', { loaded: state.loaded, rejected: state.rejected.length })}</p>
              <RejectedList rejected={state.rejected} />
            </>
          )}
          <button type="button" onClick={() => setState({ step: 'idle' })}>
            {state.step === 'choose' ? t('backup.cancel') : t('backup.close')}
          </button>
        </div>
      )}
    </>
  )
}

function RejectedList({ rejected }: { rejected: RejectedEntry[] }) {
  const t = useT()
  if (rejected.length === 0) return null
  return (
    <details open={rejected.length <= 5}>
      <summary>{t('backup.rejectedTitle', { count: rejected.length })}</summary>
      <ul class="issues">
        {rejected.map((r) => (
          <li key={r.index}>
            {t('backup.rejectedItem', {
              index: r.index + 1,
              name: r.name ?? t('character.unnamed'),
              reason: r.reason,
            })}
          </li>
        ))}
      </ul>
    </details>
  )
}
