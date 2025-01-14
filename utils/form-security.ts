import { createHmac } from 'crypto'

const FORM_SECRET = process.env.FORM_SECRET || 'default-dev-secret-change-in-production'

// Minimum time (ms) that must pass before form submission (spam check)
const MIN_FORM_TIME = 10000 // 10 seconds

export interface FormToken {
  timestamp: number
  signature: string
}

/**
 * Generate a signed timestamp token for form spam protection
 */
export function generateFormToken(): FormToken {
  const timestamp = Date.now()
  const signature = createHmac('sha256', FORM_SECRET)
    .update(timestamp.toString())
    .digest('hex')

  return { timestamp, signature }
}

/**
 * Verify a form token's signature and check if enough time has passed
 */
export function verifyFormToken(timestamp: string | number, signature: string): {
  valid: boolean
  reason?: string
} {
  // Verify timestamp exists and is a number
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
  if (isNaN(ts) || ts <= 0) {
    return { valid: false, reason: 'Invalid timestamp' }
  }

  // Verify signature matches
  const expectedSignature = createHmac('sha256', FORM_SECRET)
    .update(ts.toString())
    .digest('hex')

  if (signature !== expectedSignature) {
    return { valid: false, reason: 'Invalid signature' }
  }

  // Check if enough time has passed
  const elapsed = Date.now() - ts
  if (elapsed < MIN_FORM_TIME) {
    return { valid: false, reason: 'Form submitted too quickly' }
  }

  // Token is valid
  return { valid: true }
}

/**
 * Check if form submission appears to be spam
 * Combines honeypot check with timestamp validation
 */
export function isSpamSubmission(body: {
  organization_website?: string
  formTimestamp?: string | number
  formSignature?: string
}): boolean {
  // Honeypot filled = bot
  if (body.organization_website) {
    console.log('Spam detected: honeypot filled')
    return true
  }

  // Check timestamp if provided
  if (body.formTimestamp && body.formSignature) {
    const verification = verifyFormToken(body.formTimestamp, body.formSignature)
    if (!verification.valid) {
      console.log(`Spam detected: ${verification.reason}`)
      return true
    }
  }

  return false
}
