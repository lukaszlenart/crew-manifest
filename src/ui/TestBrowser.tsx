import { useEffect, useMemo, useState } from 'preact/hooks'
import {
  TESTS,
  TEST_PRIMER,
  findTest,
  type TestEntry,
  type TestId,
  type TestTable,
} from '../domain/tests'
import { filterTests, groupTests } from '../domain/testSearch'
import { lang, useLocalize, useT } from '../i18n'
import { href } from './router'

export function TestBrowser({ id }: { id?: TestId }) {
  const t = useT()
  const loc = useLocalize()
  const l = lang.value
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (id) document.getElementById(entryId(id))?.scrollIntoView({ block: 'start' })
  }, [id])

  const groups = useMemo(() => groupTests(filterTests(TESTS, query, l)), [query, l])

  const entry = (test: TestEntry) => (
    <details key={test.id} id={entryId(test.id)} class="test" open={test.id === id}>
      <summary>
        <strong>{loc(test.label)}</strong>
        <span class="muted small">{t('talents.page', { page: test.page })}</span>
        <span class="small talent-summary">{loc(test.summary)}</span>
      </summary>
      <dl>
        <dt>{t('tests.roll')}</dt>
        <dd>
          {loc(test.roll.pool)} · {t(test.roll.canPush ? 'tests.push.yes' : 'tests.push.no')} ·{' '}
          {t(test.roll.stressDice ? 'tests.stress.yes' : 'tests.stress.no')}
        </dd>
        <dt>{t('tests.when')}</dt>
        <dd>{loc(test.when)}</dd>
        <dt>{t('tests.outcome')}</dt>
        <dd>{loc(test.outcome)}</dd>
      </dl>
      {test.table && <TableView table={test.table} />}
      {test.related.length > 0 && (
        <p class="test-related small">
          {t('tests.related')}
          {test.related.map((rid) => {
            const target = findTest(rid)
            return target ? (
              <a key={rid} href={href.tests(rid)}>
                {loc(target.label)}
              </a>
            ) : null
          })}
        </p>
      )}
    </details>
  )

  return (
    <section class="tests">
      <div class="toolbar">
        <h2>{t('tests.title')}</h2>
      </div>
      <div class="filters">
        <input
          type="search"
          value={query}
          placeholder={t('tests.search')}
          aria-label={t('tests.search')}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
      </div>

      <details class="panel primer">
        <summary>{t('tests.primer')}</summary>
        {TEST_PRIMER.map((s) => (
          <section key={s.id}>
            <h4>
              {loc(s.label)} <span class="muted small">{t('talents.page', { page: s.page })}</span>
            </h4>
            <p>{loc(s.text)}</p>
          </section>
        ))}
      </details>

      {groups.length === 0 && <p class="empty muted">{t('tests.empty')}</p>}

      {groups.map((g) => (
        <section key={g.group} class="panel">
          <h3>{t(g.group === 'core' ? 'tests.group.core' : 'tests.group.hazard')}</h3>
          {g.tests.map(entry)}
        </section>
      ))}
    </section>
  )
}

function TableView({ table }: { table: TestTable }) {
  const loc = useLocalize()
  return (
    <div class="test-table">
      <table>
        <caption>{loc(table.caption)}</caption>
        <thead>
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} scope="col">
                {loc(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{loc(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function entryId(id: TestId): string {
  return `test-${id}`
}
