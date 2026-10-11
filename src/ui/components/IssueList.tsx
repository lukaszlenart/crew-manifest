import type { ValidationIssue } from '../../domain/validation'
import { useT, type TFunction } from '../../i18n'

export function issueText(t: TFunction, issue: ValidationIssue): string {
  return t(`validation.${issue.message}`, issue.params)
}

export function IssueList({ issues }: { issues: ValidationIssue[] }) {
  const t = useT()
  if (issues.length === 0) return null
  return (
    <ul class="issues" role="alert">
      {issues.map((issue, i) => (
        <li key={i}>{issueText(t, issue)}</li>
      ))}
    </ul>
  )
}
