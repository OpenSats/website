/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'
process.env.TURNSTILE_SECRET = 'test-turnstile-secret'

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    paginate: { iterator: jest.fn() },
    rest: { issues: { listForRepo: jest.fn() } },
  })),
}))

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return {
    ...actual,
    assertTurnstile: jest.fn(),
  }
})

const { assertTurnstile } = require('@/utils/turnstile')
const handler = require('../../pages/api/grant.ts').default

function responseMock() {
  return {
    statusCode: undefined,
    payload: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
}

describe('/api/grant', () => {
  beforeEach(() => {
    assertTurnstile.mockReset()
    assertTurnstile.mockResolvedValue(true)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('rejects requests that fail Turnstile verification', async () => {
    assertTurnstile.mockResolvedValue(false)
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: {
          grant_id: '123456',
          'cf-turnstile-response': 'test-token',
        },
      },
      response
    )

    expect(response.statusCode).toBe(403)
    expect(response.payload.valid).toBe(false)
    expect(response.payload.error).toBe(
      'Bot verification failed. Please try again.'
    )
  })
})
