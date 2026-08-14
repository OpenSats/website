import type { NextApiRequest } from 'next'

export const TURNSTILE_TOKEN_FIELD = 'cf-turnstile-response'

export const TURNSTILE_FAILURE_MESSAGE =
  'Bot verification failed. Please try again.'

interface SiteverifyResult {
  success?: boolean
  'error-codes'?: string[]
}

export function getClientIp(req: NextApiRequest): string | undefined {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || undefined
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || undefined
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp
  }
  return req.socket?.remoteAddress || undefined
}

export function getTurnstileToken(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const token = (body as Record<string, unknown>)[TURNSTILE_TOKEN_FIELD]
  return typeof token === 'string' && token.length > 0 ? token : undefined
}

/**
 * Canonical Cloudflare Turnstile siteverify.
 * Fail closed on network errors, non-2xx, bad JSON, or success !== true.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteip?: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET
  if (!secret || !token) return false

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    })
    if (remoteip) params.set('remoteip', remoteip)

    const response = await fetchImpl(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      }
    )
    if (!response.ok) return false

    const result = (await response.json()) as SiteverifyResult
    return result.success === true
  } catch {
    return false
  }
}

export async function assertTurnstile(
  req: NextApiRequest,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  return verifyTurnstileToken(
    getTurnstileToken(req.body),
    getClientIp(req),
    fetchImpl
  )
}
