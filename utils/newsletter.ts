export function formatIssueNumber(issueNumber: number): string {
  return `Issue #${String(issueNumber).padStart(2, '0')}`
}
