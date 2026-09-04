/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_REPORTS_REPO = 'reports'

let mockIssues = []

jest.mock('@octokit/rest', () => {
  const iterator = jest.fn(() =>
    (async function* () {
      yield { data: mockIssues }
    })()
  )
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: { issues: { listForRepo: jest.fn() } },
      paginate: { iterator },
    })),
    __iterator: iterator,
  }
})

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return { ...actual, assertTurnstile: jest.fn() }
})

const { __iterator: iterator } = require('@octokit/rest')
const { assertTurnstile } = require('@/utils/turnstile')
const handler = require('../../pages/api/grant.ts').default

function responseMock() {
  const res = { statusCode: undefined, payload: undefined, headers: {} }
  res.status = (c) => ((res.statusCode = c), res)
  res.json = (p) => ((res.payload = p), res)
  res.setHeader = (k, v) => ((res.headers[k] = v), res)
  res.end = (p) => ((res.payload = p), res)
  return res
}

describe('/api/grant', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIssues = []
  })

  test('rejects a request that fails bot verification with 403 and queries no issues', async () => {
    assertTurnstile.mockResolvedValue(false)
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: { grant_id: '654321' } }, res)

    expect(res.statusCode).toBe(403)
    expect(iterator).not.toHaveBeenCalled()
  })

  test('rejects a non-numeric grant id with 400 and queries no issues', async () => {
    assertTurnstile.mockResolvedValue(true)
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: { grant_id: 'cashu' } }, res)

    expect(res.statusCode).toBe(400)
    expect(iterator).not.toHaveBeenCalled()
  })

  test('does not match a grant id that only appears in an issue body', async () => {
    assertTurnstile.mockResolvedValue(true)
    mockIssues = [
      { title: 'Some unrelated project', body: 'mentions 654321 in passing', number: 9, state: 'open' },
    ]
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: { grant_id: '654321' } }, res)

    expect(res.statusCode).toBe(404)
  })

  test('resolves a grant id matched as a whole token in the issue title', async () => {
    assertTurnstile.mockResolvedValue(true)
    mockIssues = [
      { title: 'Grant #654321: Test Project by Alice', body: '', number: 42, state: 'open' },
    ]
    const res = responseMock()
    await handler({ method: 'POST', headers: {}, body: { grant_id: '654321' } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.payload).toMatchObject({
      valid: true,
      project_name: 'Test Project',
      issue_number: 42,
    })
  })
})
