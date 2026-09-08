/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'
process.env.TURNSTILE_SECRET = 'test-turnstile-secret'

jest.mock('@octokit/rest', () => {
  const iterator = jest.fn()
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      paginate: { iterator },
      rest: { issues: { listForRepo: jest.fn() } },
    })),
    __iterator: iterator,
  }
})

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return {
    ...actual,
    assertTurnstile: jest.fn(),
  }
})

const { Octokit, __iterator: iterator } = require('@octokit/rest')
const { assertTurnstile } = require('@/utils/turnstile')
const { ERROR_MESSAGES } = require('../../utils/constants.ts')
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

function pages(issues) {
  return (async function* () {
    yield { data: issues }
  })()
}

describe('/api/grant', () => {
  beforeEach(() => {
    assertTurnstile.mockReset()
    assertTurnstile.mockResolvedValue(true)
    iterator.mockReset()
    iterator.mockImplementation(() => pages([]))
    Octokit.mockClear()
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

  it('rejects non-numeric grant ids before searching', async () => {
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: { grant_id: 'cashu', 'cf-turnstile-response': 'test-token' },
      },
      response
    )

    expect(response.statusCode).toBe(400)
    expect(response.payload).toEqual({
      valid: false,
      error: ERROR_MESSAGES.GRANT_ID_INVALID,
    })
    expect(Octokit).not.toHaveBeenCalled()
  })

  it('rejects grant ids that are not 6 or 7 digits', async () => {
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: { grant_id: '12345', 'cf-turnstile-response': 'test-token' },
      },
      response
    )

    expect(response.statusCode).toBe(400)
    expect(Octokit).not.toHaveBeenCalled()
  })

  it('matches a numeric grant id as a whole token in the title', async () => {
    iterator.mockImplementation(() =>
      pages([
        {
          title: '946366 - Cashu-TS and Cashu.me',
          body: null,
          number: 361,
          state: 'open',
        },
      ])
    )
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: { grant_id: '946366', 'cf-turnstile-response': 'test-token' },
      },
      response
    )

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({
      valid: true,
      project_name: '946366 - Cashu-TS and Cashu.me',
      issue_number: 361,
    })
  })

  it('does not match an id that only appears in the issue body', async () => {
    iterator.mockImplementation(() =>
      pages([
        {
          title: 'Some other project',
          body: 'Mentions cashu and 946366 in the body',
          number: 361,
          state: 'open',
        },
      ])
    )
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: { grant_id: '946366', 'cf-turnstile-response': 'test-token' },
      },
      response
    )

    expect(response.statusCode).toBe(404)
    expect(response.payload).toEqual({
      valid: false,
      error: ERROR_MESSAGES.GRANT_NOT_FOUND,
    })
  })
})
