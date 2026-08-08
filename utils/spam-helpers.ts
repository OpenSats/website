export function isSpamSubmission(body: {
  company_fax?: unknown
  formElapsedMs?: unknown
}): boolean {
  // This intentionally uses a field that is not plausible application data.
  // A real organization website must never be treated as a honeypot.
  if (String(body.company_fax ?? '').trim()) return true

  // Measure duration in one clock (the browser) instead of comparing a client
  // timestamp with the server clock, which can be skewed in either direction.
  const elapsed =
    typeof body.formElapsedMs === 'number' ||
    (typeof body.formElapsedMs === 'string' && body.formElapsedMs.trim())
      ? Number(body.formElapsedMs)
      : Number.NaN

  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 10000) return true

  return false
}
