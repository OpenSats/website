/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'
process.env.SENDGRID_API_KEY = 'SG.test'
process.env.SENDGRID_RECIPIENT = 'ops@opensats.org'
process.env.SENDGRID_VERIFIED_SENDER = 'reports@opensats.org'

jest.mock('@octokit/rest', () => {
  const createComment = jest.fn().mockResolvedValue({
    data: { html_url: 'https://github.com/OpenSats/reports/issues/1#comment-1' },
  })
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: { issues: { createComment } },
    })),
    __createComment: createComment,
  }
})

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: { setApiKey: jest.fn(), send: jest.fn().mockResolvedValue([{ statusCode: 202 }]) },
}))

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return { ...actual, assertTurnstile: jest.fn() }
})

const { __createComment: createComment } = require('@octokit/rest')
const sgMail = require('@sendgrid/mail').default
const { assertTurnstile } = require('@/utils/turnstile')
const handler = require('../../pages/api/report.ts').default

function responseMock() {
  const res = { statusCode: undefined, payload: undefined, headers: {} }
  res.status = (c) => ((res.statusCode = c), res)
  res.json = (p) => ((res.payload = p), res)
  res.setHeader = (k, v) => ((res.headers[k] = v), res)
  res.end = (p) => ((res.payload = p), res)
  return res
}

const validBody = {
  project_name: 'Test Project',
  own_words: 'progress',
  time_spent: 'a lot',
  next_quarter: 'more',
  money_usage: 'rent',
  issue_number: 1,
  email: 'grantee@example.com',
}

describe('/api/report Turnstile gate', () => {
  beforeEach(() => jest.clearAllMocks())

  test('rejects a request that fails bot verification with 403 and writes nothing', async () => {
    assertTurnstile.mockResolvedValue(false)
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: validBody }, res)

    expect(res.statusCode).toBe(403)
    expect(createComment).not.toHaveBeenCalled()
    expect(sgMail.send).not.toHaveBeenCalled()
  })

  test('rejects a non-POST method with 405 before verification', async () => {
    const res = responseMock()
    await handler({ method: 'GET', headers: {}, body: {} }, res)
    expect(res.statusCode).toBe(405)
  })

  test('proceeds for a verified request: comment created and confirmation email sent', async () => {
    assertTurnstile.mockResolvedValue(true)
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: validBody }, res)

    expect(res.statusCode).toBe(200)
    expect(createComment).toHaveBeenCalledTimes(1)
    expect(createComment.mock.calls[0][0]).toMatchObject({
      owner: 'OpenSats',
      repo: 'reports',
      issue_number: 1,
    })
    expect(sgMail.send).toHaveBeenCalledTimes(1)
    expect(sgMail.send.mock.calls[0][0].to).toBe('grantee@example.com')
  })
})
