import type { Localized } from './types'

export type TestId = string

export type TestGroup = 'core' | 'hazard'

export const TEST_GROUPS: readonly TestGroup[] = ['core', 'hazard']

export interface TestRoll {
  pool: Localized
  canPush: boolean
  stressDice: boolean
}

export interface TestTable {
  caption: Localized
  columns: Localized[]
  rows: Localized[][]
}

export interface TestEntry {
  id: TestId
  group: TestGroup
  label: Localized
  summary: Localized
  roll: TestRoll
  when: Localized
  outcome: Localized
  table?: TestTable
  related: TestId[]
  /** Printed rulebook page. */
  page: number
}

export interface PrimerSection {
  id: string
  label: Localized
  text: Localized
  page: number
}

/** Each group in book order. */
export const TESTS: readonly TestEntry[] = [
  {
    id: 'survival',
    group: 'core',
    page: 99,
    label: { en: 'Survival roll', pl: 'Test Przeżycia' },
    summary: {
      en: 'A Stamina roll that decides whether a dying character lives a little longer.',
      pl: 'Test Kondycji, który rozstrzyga, czy umierająca postać przeżyje jeszcze chwilę.',
    },
    roll: {
      pool: { en: 'Strength + Stamina', pl: 'Siła + Kondycja' },
      canPush: false,
      stressDice: false,
    },
    when: {
      en: 'When the time limit of a fatal critical injury runs out, and whenever a hazard calls for it while you are Broken.',
      pl: 'Gdy minie czas śmiertelnej rany ciężkiej oraz zawsze, gdy zagrożenie tego wymaga, a postać jest Pokonana.',
    },
    outcome: {
      en: 'Failure: the character dies. Success: they hold on, but roll again when the same time passes. First aid (a Medical Aid roll) given before a failed roll can save them.',
      pl: 'Porażka: postać umiera. Sukces: trzyma się, ale po upływie tego samego czasu rzuca ponownie. Pierwsza pomoc (test Pomocy Medycznej) udzielona przed nieudanym testem może ją ocalić.',
    },
    related: [],
  },
]

/** Book order. */
export const TEST_PRIMER: readonly PrimerSection[] = []

export function findTest(id: string): TestEntry | undefined {
  return TESTS.find((t) => t.id === id)
}

export function isTestId(id: string): boolean {
  return findTest(id) !== undefined
}

export function localizedFieldsOf(test: TestEntry): Localized[] {
  const fields = [test.label, test.summary, test.roll.pool, test.when, test.outcome]
  if (test.table) fields.push(test.table.caption, ...test.table.columns, ...test.table.rows.flat())
  return fields
}
