/**
 * Convert a human-friendly quarter label like "Q1 2026" into the
 * sortable, prominent form "2026-Q1" used across the newsletter UI.
 * Falls back to the original string if the input doesn't match.
 */
export function formatQuarter(quarter?: string): string {
  if (!quarter) return ''
  const match = quarter.match(/Q([1-4])\s+(\d{4})/i)
  if (!match) return quarter
  const [, q, year] = match
  return `${year}-Q${q}`
}

export function formatIssueNumber(issueNumber: number): string {
  return `Issue #${String(issueNumber).padStart(2, '0')}`
}
