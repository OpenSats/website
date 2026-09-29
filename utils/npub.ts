import { bech32 } from 'bech32'

export const NPUB_ERROR = 'Enter a valid npub.'

export function validateNpub(value: unknown): true | string {
  if (value === undefined) return true
  if (typeof value !== 'string') return NPUB_ERROR
  if (!value.trim()) return true

  try {
    const { prefix, words } = bech32.decode(value.trim())
    return (
      (prefix === 'npub' && bech32.fromWords(words).length === 32) || NPUB_ERROR
    )
  } catch {
    return NPUB_ERROR
  }
}
