import { TEST_GROUPS, localizedFieldsOf, type TestEntry, type TestGroup } from './tests'
import { matchesAllWords } from './textSearch'
import type { Lang } from './types'

export function filterTests(tests: readonly TestEntry[], query: string, lang: Lang): TestEntry[] {
  return tests.filter((t) =>
    matchesAllWords(
      query,
      localizedFieldsOf(t)
        .map((f) => f[lang])
        .join(' '),
    ),
  )
}

export function groupTests(
  tests: readonly TestEntry[],
): { group: TestGroup; tests: TestEntry[] }[] {
  return TEST_GROUPS.map((group) => ({
    group,
    tests: tests.filter((t) => t.group === group),
  })).filter((g) => g.tests.length > 0)
}
