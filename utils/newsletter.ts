/**
 * Canonical quarter form is "2026-Q1" — sortable and used across the
 * newsletter UI. As a courtesy, we also normalize the human-friendly
 * "Q1 2026" form. Anything else passes through unchanged.
 */
export function formatQuarter(quarter?: string): string {
  if (!quarter) return ''
  const match = quarter.match(/^Q([1-4])\s+(\d{4})$/i)
  if (!match) return quarter
  const [, q, year] = match
  return `${year}-Q${q}`
}

export function formatIssueNumber(issueNumber: number): string {
  return `Issue #${String(issueNumber).padStart(2, '0')}`
}
