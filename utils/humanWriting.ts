/** Pangram human-written percentage (0–100), recorded per article. */
export function qualifiesForHumanBadge(score?: number): boolean {
  return typeof score === 'number' && score >= 85 && score <= 100
}
