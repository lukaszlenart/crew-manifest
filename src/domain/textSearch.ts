export function matchesAllWords(query: string, text: string): boolean {
  const haystack = fold(text)
  return fold(query)
    .split(/\s+/)
    .filter((w) => w !== '')
    .every((w) => haystack.includes(w))
}

function fold(text: string): string {
  return text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '')
}
