/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'OpenSats'
process.env.GH_APP_REPO = 'applications'
process.env.TURNSTILE_SECRET = 'test-turnstile-secret'

jest.mock('@octokit/rest', () => {
  const create = jest.fn()
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: { issues: { create } },
    })),
    __create: create,
  }
})

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return {
    ...actual,
    assertTurnstile: jest.fn(),
  }
})

jest.mock('@/utils/application-emails', () => ({
  sendApplicationEmails: jest.fn(),
}))

const { __create: createIssue } = require('@octokit/rest')
const { assertTurnstile } = require('@/utils/turnstile')
const { sendApplicationEmails } = require('@/utils/application-emails')
const handler = require('../../pages/api/github.ts').default

function responseMock() {
  return {
    statusCode: undefined,
    payload: undefined,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
    setHeader(name, value) {
      this.headers[name] = value
    },
    end(payload) {
      this.payload = payload
      return this
    },
  }
}

const validApplication = {
  project_name: 'Test project',
  your_name: 'Applicant',
  short_description: 'Description',
  potential_impact: 'Impact',
  proposed_budget: '1 BTC',
  main_focus: 'nostr',
  'cf-turnstile-response': 'test-token',
}

describe('/api/github', () => {
  beforeEach(() => {
    createIssue.mockReset()
    createIssue.mockResolvedValue({ data: { number: 1 } })
    assertTurnstile.mockReset()
    assertTurnstile.mockResolvedValue(true)
    sendApplicationEmails.mockReset()
    sendApplicationEmails.mockResolvedValue({
      internalSent: true,
      applicantSent: true,
    })
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates an issue when Turnstile verification succeeds', async () => {
    const response = responseMock()

    await handler({ method: 'POST', body: validApplication }, response)

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({ message: 'success' })
    expect(createIssue).toHaveBeenCalled()
    expect(sendApplicationEmails).toHaveBeenCalledWith(validApplication)
  })

  it('still succeeds when application emails fail after issue create', async () => {
    sendApplicationEmails.mockRejectedValue(new Error('SendGrid down'))
    const response = responseMock()

    await handler({ method: 'POST', body: validApplication }, response)

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({ message: 'success' })
    expect(createIssue).toHaveBeenCalled()
  })

  it('rejects requests that fail Turnstile verification', async () => {
    assertTurnstile.mockResolvedValue(false)
    const response = responseMock()

    await handler({ method: 'POST', body: validApplication }, response)

    expect(response.statusCode).toBe(403)
    expect(response.payload.message).not.toBe('success')
    expect(createIssue).not.toHaveBeenCalled()
    expect(sendApplicationEmails).not.toHaveBeenCalled()
  })
})
