export const GRANT_ID_PATTERN = /^\d{6,7}$/

export function normalizeGrantId(value: unknown): string {
  return String(value ?? '').trim()
}

export function isNumericGrantId(value: string): boolean {
  return GRANT_ID_PATTERN.test(value)
}

/** True when the grant id appears in the title as its own number, not a substring. */
export function titleMatchesGrantId(
  title: string | null | undefined,
  grantId: string
): boolean {
  if (!title || !isNumericGrantId(grantId)) return false
  return new RegExp(`(^|[^\\d])${grantId}([^\\d]|$)`).test(title)
}