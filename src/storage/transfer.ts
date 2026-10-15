import { parseBackup, type ParsedBackup } from './backup'

/**
 * Backup text carried in a URL fragment (`#/import/<payload>`) as base64url of its UTF-8 bytes.
 * The migration page on the old address (uit-soft.github.io) encodes the same way.
 */
export function encodeTransfer(text: string): string {
  let binary = ''
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeTransfer(payload: string): string | null {
  if (!/^[A-Za-z0-9_-]*$/.test(payload)) return null
  try {
    const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

export function parseTransfer(payload: string): ParsedBackup {
  const text = decodeTransfer(payload)
  return text === null ? { ok: false, error: 'invalidFormat' } : parseBackup(text)
}
