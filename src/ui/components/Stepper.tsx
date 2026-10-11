import { useT } from '../../i18n'

interface Props {
  id: string
  value: number
  min: number
  max: number
  invalid?: boolean
  onChange: (value: number) => void
}

/** Number input with −/+ buttons. Buttons respect min/max; typed values are validated elsewhere. */
export function Stepper({ id, value, min, max, invalid, onChange }: Props) {
  const t = useT()
  return (
    <span class={`stepper${invalid ? ' invalid' : ''}`}>
      <button
        type="button"
        aria-label={t('common.decrease')}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        aria-invalid={invalid}
        onInput={(e) => {
          const n = Number.parseInt(e.currentTarget.value, 10)
          if (!Number.isNaN(n)) onChange(n)
        }}
      />
      <button
        type="button"
        aria-label={t('common.increase')}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </span>
  )
}
