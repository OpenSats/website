/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'
process.env.TURNSTILE_SECRET = 'test-turnstile-secret'

jest.mock('@octokit/rest', () => {
  const createComment = jest.fn()
  const iterator = jest.fn()
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      paginate: { iterator },
      rest: { issues: { createComment, listForRepo: jest.fn() } },
    })),
    __createComment: createComment,
    __iterator: iterator,
  }
})

jest.mock('../../pages/api/sendgrid.ts', () => ({
  sendReportConfirmationEmail: jest.fn(),
}))

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return {
    ...actual,
    assertTurnstile: jest.fn(),
  }
})

const { __createComment: createComment, __iterator: iterator } = require(
  '@octokit/rest'
)
const { sendReportConfirmationEmail } = require('../../pages/api/sendgrid.ts')
const { assertTurnstile } = require('@/utils/turnstile')
const { ERROR_MESSAGES } = require('../../utils/constants.ts')
const handler = require('../../pages/api/report.ts').default

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

const matchingIssue = {
  title: '946366 - Cashu-TS and Cashu.me',
  body: null,
  number: 361,
  state: 'open',
}

const validReport = {
  project_name: 'Test project',
  own_words: 'Worked on the thing',
  time_spent: '40 hours',
  next_quarter: 'More work',
  money_usage: 'Hosting',
  grant_id: '946366',
  issue_number: 1,
  email: 'grantee@example.org',
  'cf-turnstile-response': 'test-token',
}

describe('/api/report', () => {
  beforeEach(() => {
    createComment.mockReset()
    createComment.mockResolvedValue({
      data: {
        id: 1,
        html_url:
          'https://github.com/OpenSats/reports/issues/361#issuecomment-1',
      },
    })
    iterator.mockReset()
    iterator.mockImplementation(() => pages([matchingIssue]))
    sendReportConfirmationEmail.mockReset()
    sendReportConfirmationEmail.mockResolvedValue(true)
    assertTurnstile.mockReset()
    assertTurnstile.mockResolvedValue(true)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates a comment on the issue resolved from grant_id', async () => {
    const response = responseMock()

    await handler({ method: 'POST', body: validReport }, response)

    expect(response.statusCode).toBe(200)
    expect(response.payload.success).toBe(true)
    expect(createComment).toHaveBeenCalledWith(
      expect.objectContaining({ issue_number: 361 })
    )
    expect(sendReportConfirmationEmail).toHaveBeenCalled()
  })

  it('ignores a client-supplied issue_number', async () => {
    const response = responseMock()

    await handler(
      { method: 'POST', body: { ...validReport, issue_number: 999 } },
      response
    )

    expect(response.statusCode).toBe(200)
    expect(createComment).toHaveBeenCalledWith(
      expect.objectContaining({ issue_number: 361 })
    )
  })

  it('rejects an unknown grant id without writing', async () => {
    iterator.mockImplementation(() => pages([]))
    const response = responseMock()

    await handler({ method: 'POST', body: validReport }, response)

    expect(response.statusCode).toBe(404)
    expect(response.payload).toEqual({
      success: false,
      error: ERROR_MESSAGES.GRANT_NOT_FOUND,
    })
    expect(createComment).not.toHaveBeenCalled()
    expect(sendReportConfirmationEmail).not.toHaveBeenCalled()
  })

  it('rejects a closed grant without writing', async () => {
    iterator.mockImplementation(() =>
      pages([{ ...matchingIssue, state: 'closed' }])
    )
    const response = responseMock()

    await handler({ method: 'POST', body: validReport }, response)

    expect(response.statusCode).toBe(409)
    expect(response.payload).toEqual({
      success: false,
      error: ERROR_MESSAGES.PAST_GRANT,
    })
    expect(createComment).not.toHaveBeenCalled()
  })

  it('rejects a missing or invalid grant id', async () => {
    const missing = responseMock()
    await handler(
      { method: 'POST', body: { ...validReport, grant_id: '' } },
      missing
    )
    expect(missing.statusCode).toBe(400)
    expect(missing.payload.error).toBe(ERROR_MESSAGES.GRANT_ID_REQUIRED)
    expect(createComment).not.toHaveBeenCalled()

    const invalid = responseMock()
    await handler(
      { method: 'POST', body: { ...validReport, grant_id: 'cashu' } },
      invalid
    )
    expect(invalid.statusCode).toBe(400)
    expect(invalid.payload.error).toBe(ERROR_MESSAGES.GRANT_ID_INVALID)
    expect(createComment).not.toHaveBeenCalled()
  })

  it('rejects requests that fail Turnstile verification', async () => {
    assertTurnstile.mockResolvedValue(false)
    const response = responseMock()

    await handler({ method: 'POST', body: validReport }, response)

    expect(response.statusCode).toBe(403)
    expect(response.payload.success).toBe(false)
    expect(response.payload.error).toBe(
      'Bot verification failed. Please try again.'
    )
    expect(createComment).not.toHaveBeenCalled()
    expect(sendReportConfirmationEmail).not.toHaveBeenCalled()
  })
})
