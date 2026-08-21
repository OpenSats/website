/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'
process.env.SENDGRID_API_KEY = 'SG.test'
process.env.SENDGRID_RECIPIENT = 'ops@opensats.org'
process.env.SENDGRID_VERIFIED_SENDER = 'reports@opensats.org'

let mockIssues = []

jest.mock('@octokit/rest', () => {
  const createComment = jest.fn().mockResolvedValue({
    data: { html_url: 'https://github.com/OpenSats/reports/issues/1#comment-1' },
  })
  const iterator = jest.fn(() =>
    (async function* () {
      yield { data: mockIssues }
    })()
  )
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: { issues: { createComment, listForRepo: jest.fn() } },
      paginate: { iterator },
    })),
    __createComment: createComment,
    __iterator: iterator,
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

const { __createComment: createComment, __iterator: iterator } = require('@octokit/rest')
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
  grant_id: '654321',
  email: 'grantee@example.com',
}

const openGrantIssue = {
  title: 'Grant #654321: Test Project by Alice',
  body: '',
  number: 77,
  state: 'open',
}

describe('/api/report', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIssues = []
  })

  test('rejects a request that fails bot verification with 403 and writes nothing', async () => {
    assertTurnstile.mockResolvedValue(false)
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: validBody }, res)

    expect(res.statusCode).toBe(403)
    expect(iterator).not.toHaveBeenCalled()
    expect(createComment).not.toHaveBeenCalled()
    expect(sgMail.send).not.toHaveBeenCalled()
  })

  test('rejects a non-POST method with 405', async () => {
    const res = responseMock()
    await handler({ method: 'GET', headers: {}, body: {} }, res)
    expect(res.statusCode).toBe(405)
  })

  test('ignores a body-supplied issue_number and comments on the grant issue resolved server-side', async () => {
    assertTurnstile.mockResolvedValue(true)
    mockIssues = [openGrantIssue]
    const res = responseMock()
    await handler(
      { method: 'POST', headers: {}, body: { ...validBody, issue_number: 999999 } },
      res
    )

    expect(res.statusCode).toBe(200)
    expect(createComment).toHaveBeenCalledTimes(1)
    const gh = createComment.mock.calls[0][0]
    expect(gh.issue_number).toBe(77) // resolved from grant_id, not the body 999999
    expect(sgMail.send).toHaveBeenCalledTimes(1)
  })

  test('returns 404 when the grant id resolves to no issue (cannot target arbitrary issues)', async () => {
    assertTurnstile.mockResolvedValue(true)
    mockIssues = []
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: validBody }, res)

    expect(res.statusCode).toBe(404)
    expect(createComment).not.toHaveBeenCalled()
  })

  test('strips unsafe markup from the confirmation email HTML', async () => {
    assertTurnstile.mockResolvedValue(true)
    mockIssues = [openGrantIssue]
    const res = responseMock()
    await handler(
      {
        method: 'POST',
        headers: {},
        body: {
          ...validBody,
          own_words: 'hi <img src=x onerror=alert(1)> <script>alert(2)</script>',
        },
      },
      res
    )

    expect(res.statusCode).toBe(200)
    const html = sgMail.send.mock.calls[0][0].html
    expect(html).not.toMatch(/onerror/)
    expect(html).not.toMatch(/<script/)
  })
})
