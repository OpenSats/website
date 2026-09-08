import { ERROR_MESSAGES } from './constants'

export const GRANT_ID_PATTERN = /^\d{6,7}$/

export function normalizeGrantId(value: unknown): string {
  return String(value ?? '').trim()
}

export function isNumericGrantId(value: string): boolean {
  return GRANT_ID_PATTERN.test(value)
}

export function parseGrantIdInput(
  value: unknown
): { ok: true; grantId: string } | { ok: false; error: string } {
  const grantId = normalizeGrantId(value)
  if (!grantId) {
    return { ok: false, error: ERROR_MESSAGES.GRANT_ID_REQUIRED }
  }
  if (!isNumericGrantId(grantId)) {
    return { ok: false, error: ERROR_MESSAGES.GRANT_ID_INVALID }
  }
  return { ok: true, grantId }
}

export function projectNameFromTitle(title: string): string {
  return title.replace(/^Grant #\d+:\s*/, '').replace(/\s+by\s+.*$/, '')
}

/** True when the grant id appears in the title as its own number, not a substring. */
export function titleMatchesGrantId(
  title: string | null | undefined,
  grantId: string
): boolean {
  if (!title || !isNumericGrantId(grantId)) return false
  return new RegExp(`(^|[^\\d])${grantId}([^\\d]|$)`).test(title)
}