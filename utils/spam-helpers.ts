export function isSpamSubmission(body: {
  honeypot?: string
  formLoadedAt?: number
}): boolean {
  // Honeypot filled = bot
  if (body.honeypot) return true

  // Form submitted in under 10 seconds = bot
  if (body.formLoadedAt) {
    const elapsed = Date.now() - body.formLoadedAt
    if (elapsed < 10000) return true
  }

  return false
}
