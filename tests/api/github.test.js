/** @jest-environment node */
/* eslint-env jest, node */

process.env.GH_ACCESS_TOKEN = 'test-token'
process.env.GH_ORG = 'test-org'
process.env.GH_APP_REPO = 'applications'

const mockCreateIssue = jest.fn()

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(() => ({
    rest: {
      issues: {
        create: mockCreateIssue,
      },
    },
  })),
}))

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
  your_name: 'Test applicant',
  main_focus: 'nostr',
  short_description: 'Description',
  potential_impact: 'Impact',
  timelines: 'Timeline',
  proposed_budget: '$10,000',
  free_open_source: true,
  are_you_lead: true,
  formElapsedMs: 60000,
}

describe('/api/github', () => {
  beforeEach(() => {
    mockCreateIssue.mockReset()
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('stores submissions containing a legitimate organization website', async () => {
    mockCreateIssue.mockResolvedValue({
      data: { number: 42, html_url: 'https://github.test/issues/42' },
    })
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: {
          ...validApplication,
          organization_website: 'https://example.org',
        },
      },
      response
    )

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({
      message: 'success',
      issueNumber: 42,
      issueUrl: 'https://github.test/issues/42',
    })
    expect(mockCreateIssue).toHaveBeenCalledTimes(1)
  })

  it('never disguises a rejected honeypot submission as success', async () => {
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: { ...validApplication, company_fax: '555-5555' },
      },
      response
    )

    expect(response.statusCode).toBe(422)
    expect(response.payload.message).not.toBe('success')
    expect(mockCreateIssue).not.toHaveBeenCalled()
  })

  it('never disguises a GitHub API failure as success', async () => {
    mockCreateIssue.mockRejectedValue(new Error('GitHub unavailable'))
    const response = responseMock()

    await handler({ method: 'POST', body: validApplication }, response)

    expect(response.statusCode).toBe(502)
    expect(response.payload.message).not.toBe('success')
  })

  it('preserves RED issue routing and labels', async () => {
    mockCreateIssue.mockResolvedValue({
      data: { number: 43, html_url: 'https://github.test/issues/43' },
    })
    const response = responseMock()

    await handler(
      {
        method: 'POST',
        body: {
          ...validApplication,
          RED: true,
          main_focus: undefined,
          prior_work: 'Prior research',
        },
      },
      response
    )

    expect(response.statusCode).toBe(200)
    expect(mockCreateIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        repo: 'applications',
        title: 'RED: Test project by Test applicant',
        labels: ['RED'],
        body: expect.stringContaining('### Research'),
      })
    )
  })
})
