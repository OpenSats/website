/** @jest-environment node */
/* eslint-env jest, node */

const {
  getClientIp,
  getTurnstileToken,
  verifyTurnstileToken,
  TURNSTILE_TOKEN_FIELD,
} = require('./turnstile.ts')

describe('turnstile helpers', () => {
  const originalSecret = process.env.TURNSTILE_SECRET

  beforeEach(() => {
    process.env.TURNSTILE_SECRET = 'test-secret'
  })

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.TURNSTILE_SECRET
    } else {
      process.env.TURNSTILE_SECRET = originalSecret
    }
  })

  it('reads the token field from the request body', () => {
    expect(getTurnstileToken({ [TURNSTILE_TOKEN_FIELD]: 'token-abc' })).toBe(
      'token-abc'
    )
    expect(getTurnstileToken({ [TURNSTILE_TOKEN_FIELD]: '' })).toBeUndefined()
    expect(getTurnstileToken({})).toBeUndefined()
  })

  it('prefers the first x-forwarded-for hop', () => {
    expect(
      getClientIp({
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
        socket: { remoteAddress: '127.0.0.1' },
      })
    ).toBe('1.2.3.4')
  })

  it('siteverifies successfully when Cloudflare returns success', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    await expect(
      verifyTurnstileToken('token', '1.2.3.4', fetchImpl)
    ).resolves.toBe(true)

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    )
    const body = fetchImpl.mock.calls[0][1].body
    expect(body.get('secret')).toBe('test-secret')
    expect(body.get('response')).toBe('token')
    expect(body.get('remoteip')).toBe('1.2.3.4')
  })

  it('fails closed when Cloudflare returns success false', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-response'],
      }),
    })

    await expect(
      verifyTurnstileToken('token', undefined, fetchImpl)
    ).resolves.toBe(false)
  })

  it('fails closed on network errors and missing secret or token', async () => {
    await expect(
      verifyTurnstileToken(
        'token',
        undefined,
        jest.fn().mockRejectedValue(new Error('net'))
      )
    ).resolves.toBe(false)

    await expect(verifyTurnstileToken(undefined)).resolves.toBe(false)

    delete process.env.TURNSTILE_SECRET
    await expect(verifyTurnstileToken('token')).resolves.toBe(false)
  })
})
