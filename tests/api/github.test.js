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
  ack_sanctions: true,
  'cf-turnstile-response': 'test-token',
}

describe('/api/github', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-15T12:00:00Z'))
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
    jest.useRealTimers()
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

  it.each([{}, { LTS: true }, { RED: true }])(
    'includes work countries in the review issue and email payload for %j',
    async (track) => {
      const response = responseMock()
      const body = {
        ...validApplication,
        ...track,
        work_countries: 'Portugal, Germany',
      }

      await handler({ method: 'POST', body }, response)

      expect(response.statusCode).toBe(200)
      expect(createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining(
            'Country or countries of work: Portugal, Germany'
          ),
        })
      )
      expect(sendApplicationEmails).toHaveBeenCalledWith(body)
    }
  )

  describe.each([{}, { LTS: true }])(
    'sanctions acknowledgment for %j',
    (track) => {
      it.each([undefined, false, 'true', 'false', 1])(
        'rejects an unacknowledged or invalid value: %p',
        async (ack_sanctions) => {
          const response = responseMock()
          await handler(
            {
              method: 'POST',
              body: { ...validApplication, ...track, ack_sanctions },
            },
            response
          )
          expect(response.statusCode).toBe(400)
          expect(createIssue).not.toHaveBeenCalled()
          expect(sendApplicationEmails).not.toHaveBeenCalled()
        }
      )

      it('records an accepted acknowledgment', async () => {
        const response = responseMock()
        const body = { ...validApplication, ...track }
        await handler({ method: 'POST', body }, response)
        expect(response.statusCode).toBe(200)
        expect(createIssue).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.stringContaining(
              '**Sanctions / export-control:** Yes'
            ),
          })
        )
        expect(sendApplicationEmails).toHaveBeenCalledWith(body)
      })
    }
  )

  it('preserves the RED acknowledgment field', async () => {
    const response = responseMock()
    await handler(
      {
        method: 'POST',
        body: {
          ...validApplication,
          RED: true,
          ack_sanctions: undefined,
          red_ack_sanctions: true,
        },
      },
      response
    )
    expect(response.statusCode).toBe(200)
    expect(createIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining('- Sanctions / export-control: Yes'),
      })
    )
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
