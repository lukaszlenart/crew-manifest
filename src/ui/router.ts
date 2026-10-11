import { signal } from '@preact/signals'

export type Route =
  | { name: 'list' }
  | { name: 'new' }
  | { name: 'edit'; id: string }
  | { name: 'sheet'; id: string }
  | { name: 'print'; ids: string[] }

export function parseRoute(hash: string): Route {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter((p) => p !== '')
    .map(decodeURIComponent)
  const [head, arg] = parts
  if (head === 'new') return { name: 'new' }
  if (head === 'edit' && arg) return { name: 'edit', id: arg }
  if (head === 'sheet' && arg) return { name: 'sheet', id: arg }
  if (head === 'print' && arg)
    return { name: 'print', ids: arg.split(',').filter((id) => id !== '') }
  return { name: 'list' }
}

export const href = {
  list: () => '#/',
  new: () => '#/new',
  edit: (id: string) => `#/edit/${encodeURIComponent(id)}`,
  sheet: (id: string) => `#/sheet/${encodeURIComponent(id)}`,
  print: (ids: string[]) => `#/print/${encodeURIComponent(ids.join(','))}`,
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
