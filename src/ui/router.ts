import { signal } from '@preact/signals'
import { isSkill, type Skill } from '../domain/types'

export type Route =
  | { name: 'list' }
  | { name: 'new' }
  | { name: 'edit'; id: string }
  | { name: 'sheet'; id: string }
  | { name: 'print'; ids: string[] }
  | { name: 'talents'; id?: string }
  | { name: 'skills'; id?: Skill }

export function parseRoute(hash: string): Route {
  let parts: string[]
  try {
    parts = hash
      .replace(/^#\/?/, '')
      .split('/')
      .filter((p) => p !== '')
      .map(decodeURIComponent)
  } catch {
    return { name: 'list' }
  }
  const [head, arg] = parts
  if (head === 'new') return { name: 'new' }
  if (head === 'edit' && arg) return { name: 'edit', id: arg }
  if (head === 'sheet' && arg) return { name: 'sheet', id: arg }
  if (head === 'print' && arg)
    return { name: 'print', ids: arg.split(',').filter((id) => id !== '') }
  if (head === 'talents') return arg ? { name: 'talents', id: arg } : { name: 'talents' }
  if (head === 'skills')
    return arg && isSkill(arg) ? { name: 'skills', id: arg } : { name: 'skills' }
  return { name: 'list' }
}

export const href = {
  list: () => '#/',
  new: () => '#/new',
  edit: (id: string) => `#/edit/${encodeURIComponent(id)}`,
  sheet: (id: string) => `#/sheet/${encodeURIComponent(id)}`,
  print: (ids: string[]) => `#/print/${encodeURIComponent(ids.join(','))}`,
  talents: (id?: string) => (id ? `#/talents/${encodeURIComponent(id)}` : '#/talents'),
  skills: (id?: Skill) => (id ? `#/skills/${id}` : '#/skills'),
}

export const route = signal<Route>(parseRoute(globalThis.location?.hash ?? ''))

/** Call once before the first render. */
export function startRouter(): void {
  window.addEventListener('hashchange', () => {
    route.value = parseRoute(window.location.hash)
    window.scrollTo(0, 0)
  })
  route.value = parseRoute(window.location.hash)
}

export function navigate(hash: string, options: { replace?: boolean } = {}): void {
  if (options.replace) {
    history.replaceState(null, '', hash)
    route.value = parseRoute(hash)
  } else {
    window.location.hash = hash
  }
}
