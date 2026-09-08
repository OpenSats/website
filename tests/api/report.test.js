/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'
process.env.TURNSTILE_SECRET = 'test-turnstile-secret'

jest.mock('@octokit/rest', () => {
  const createComment = jest.fn()
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: { issues: { createComment } },
    })),
    __createComment: createComment,
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

const { __createComment: createComment } = require('@octokit/rest')
const { sendReportConfirmationEmail } = require('../../pages/api/sendgrid.ts')
const { assertTurnstile } = require('@/utils/turnstile')
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

const validReport = {
  project_name: 'Test project',
  own_words: 'Worked on the thing',
  time_spent: '40 hours',
  next_quarter: 'More work',
  money_usage: 'Hosting',
  issue_number: 361,
  email: 'grantee@example.org',
  'cf-turnstile-response': 'test-token',
}

describe('/api/report', () => {
  beforeEach(() => {
    createComment.mockReset()
    createComment.mockResolvedValue({
      data: { id: 1, html_url: 'https://github.com/OpenSats/reports/issues/361#issuecomment-1' },
    })
    sendReportConfirmationEmail.mockReset()
    sendReportConfirmationEmail.mockResolvedValue(true)
    assertTurnstile.mockReset()
    assertTurnstile.mockResolvedValue(true)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates a comment when Turnstile verification succeeds', async () => {
    const response = responseMock()

    await handler({ method: 'POST', body: validReport }, response)

    expect(response.statusCode).toBe(200)
    expect(response.payload.success).toBe(true)
    expect(createComment).toHaveBeenCalled()
    expect(sendReportConfirmationEmail).toHaveBeenCalled()
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
