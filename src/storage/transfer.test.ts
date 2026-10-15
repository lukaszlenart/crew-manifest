import { describe, expect, it } from 'vitest'
import { decodeTransfer, encodeTransfer, parseTransfer } from './transfer'

describe('transfer encoding', () => {
  it('round-trips text with non-ASCII characters', () => {
    const text = '{"name":"Żółć — Ripley 🚀"}'
    expect(decodeTransfer(encodeTransfer(text))).toBe(text)
  })

  it('produces a URL-safe payload without padding', () => {
    expect(encodeTransfer('??>>~~ ')).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('returns null for a payload that is not base64url', () => {
    expect(decodeTransfer('not base64!')).toBeNull()
  })

  it('returns null for bytes that are not UTF-8', () => {
    expect(decodeTransfer('_w')).toBeNull()
  })
})

describe('parseTransfer', () => {
  it('parses a backup carried in the payload', () => {
    const backup = JSON.stringify({ app: 'crew-manifest', formatVersion: 1, characters: [{}] })
    const parsed = parseTransfer(encodeTransfer(backup))
    expect(parsed.ok && parsed.rejected).toHaveLength(1)
  })

  it('reports a payload that cannot be decoded as an invalid format', () => {
    expect(parseTransfer('not base64!')).toEqual({ ok: false, error: 'invalidFormat' })
  })
})
