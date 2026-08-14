/** @jest-environment node */
/* eslint-env jest, node */

process.env.SENDGRID_API_KEY = 'test-key'
process.env.SENDGRID_RECIPIENT = 'applications@opensats.test'
process.env.SENDGRID_CC = 'backup@opensats.test'
process.env.SENDGRID_VERIFIED_SENDER = 'sender@opensats.test'
process.env.TURNSTILE_SECRET = 'test-turnstile-secret'

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))

jest.mock('@/utils/turnstile', () => {
  const actual = jest.requireActual('@/utils/turnstile')
  return {
    ...actual,
    assertTurnstile: jest.fn(),
  }
})

const sgMail = require('@sendgrid/mail').default
const { assertTurnstile } = require('@/utils/turnstile')
const handler = require('../../pages/api/sendgrid.ts').default

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
  email: 'applicant@example.org',
  short_description: 'Description',
  'cf-turnstile-response': 'test-token',
}

describe('/api/sendgrid', () => {
  beforeEach(() => {
    sgMail.send.mockReset()
    assertTurnstile.mockReset()
    assertTurnstile.mockResolvedValue(true)
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'info').mockImplementation(() => undefined)
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('confirms success only after the internal copy is accepted', async () => {
    sgMail.send.mockResolvedValue([{}])
    const response = responseMock()

    await handler({ method: 'POST', body: validApplication }, response)

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({
      message: 'success',
      applicantConfirmationSent: true,
    })
    expect(sgMail.send).toHaveBeenCalledTimes(2)
    expect(sgMail.send.mock.calls[0][0].to).toBe('applications@opensats.test')
  })

  it('returns a failure when SendGrid does not accept the internal copy', async () => {
    jest.useFakeTimers()
    sgMail.send.mockImplementation((message) => {
      if (message.to === 'applications@opensats.test') {
        return Promise.reject(new Error('SendGrid unavailable'))
      }
      return Promise.resolve([{}])
    })
    const response = responseMock()

    const request = handler(
      { method: 'POST', body: validApplication },
      response
    )
    await jest.runAllTimersAsync()
    await request

    expect(response.statusCode).toBe(502)
    expect(response.payload.message).not.toBe('success')
  })

  it('still confirms internal receipt if the applicant email fails', async () => {
    jest.useFakeTimers()
    sgMail.send.mockImplementation((message) => {
      if (message.to === 'applicant@example.org') {
        return Promise.reject(new Error('Applicant address rejected'))
      }
      return Promise.resolve([{}])
    })
    const response = responseMock()

    const request = handler(
      { method: 'POST', body: validApplication },
      response
    )
    await jest.runAllTimersAsync()
    await request

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({
      message: 'success',
      applicantConfirmationSent: false,
    })
  })

  it('preserves RED internal and applicant subjects', async () => {
    sgMail.send.mockResolvedValue([{}])
    const response = responseMock()

    await handler(
      { method: 'POST', body: { ...validApplication, RED: true } },
      response
    )

    expect(response.statusCode).toBe(200)
    expect(sgMail.send.mock.calls[0][0].subject).toBe(
      'OpenSats RED: Application for Test project'
    )
    expect(sgMail.send.mock.calls[1][0].subject).toBe(
      'Your OpenSats RED Application'
    )
  })

  it('escapes applicant-controlled fields in the internal HTML email', async () => {
    sgMail.send.mockResolvedValue([{}])
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: {
          ...validApplication,
          short_description: '<script>alert(1)</script>',
        },
      },
      response
    )

    expect(response.statusCode).toBe(200)
    expect(sgMail.send.mock.calls[0][0].html).toContain(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    )
    expect(sgMail.send.mock.calls[0][0].html).not.toContain(
      '<script>alert(1)</script>'
    )
    expect(sgMail.send.mock.calls[0][0].html).not.toContain(
      'cf-turnstile-response'
    )
  })

  it('rejects requests that fail Turnstile verification', async () => {
    assertTurnstile.mockResolvedValue(false)
    const response = responseMock()

    await handler({ method: 'POST', body: validApplication }, response)

    expect(response.statusCode).toBe(403)
    expect(response.payload.message).not.toBe('success')
    expect(sgMail.send).not.toHaveBeenCalled()
  })
})


