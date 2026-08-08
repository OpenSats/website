/** @jest-environment node */
/* eslint-env jest, node */

const { submitApplication } = require('./application-submission.ts')

describe('submitApplication', () => {
  const submission = { project_name: 'Test project' }

  function turnstileMock(tokens) {
    let index = 0
    return {
      waitForToken: jest.fn(
        async () => tokens[Math.min(index, tokens.length - 1)]
      ),
      reset: jest.fn(async () => {
        index += 1
        return tokens[Math.min(index, tokens.length - 1)]
      }),
    }
  }

  it('creates the GitHub record before sending email, with fresh tokens', async () => {
    const postJSON = jest.fn().mockResolvedValue({ message: 'success' })
    const turnstile = turnstileMock(['token-1', 'token-2'])

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).resolves.toEqual({
      github: true,
      email: true,
    })
    expect(postJSON.mock.calls.map((call) => call[0])).toEqual([
      '/api/github',
      '/api/sendgrid',
    ])
    expect(postJSON.mock.calls[0][1]['cf-turnstile-response']).toBe('token-1')
    expect(postJSON.mock.calls[1][1]['cf-turnstile-response']).toBe('token-2')
    expect(turnstile.reset).toHaveBeenCalledTimes(1)
  })

  it('succeeds when GitHub is confirmed even if email fails', async () => {
    const postJSON = jest.fn(async (url) => ({
      message: url === '/api/github' ? 'success' : 'Email delivery failed',
    }))
    const turnstile = turnstileMock(['token-1', 'token-2'])

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).resolves.toEqual({
      github: true,
      email: false,
    })
  })

  it('forces a retry when GitHub fails and does not email anyone', async () => {
    const postJSON = jest.fn(async (url) => {
      if (url === '/api/github') throw new Error('GitHub unavailable')
      return { message: 'success' }
    })
    const turnstile = turnstileMock(['token-1', 'token-2'])

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).rejects.toThrow('Please try again.')
    expect(postJSON).toHaveBeenCalledTimes(1)
    expect(postJSON).toHaveBeenCalledWith(
      '/api/github',
      expect.objectContaining({ 'cf-turnstile-response': 'token-1' })
    )
    expect(turnstile.reset).toHaveBeenCalled()
  })

  it('forces a retry when GitHub returns a non-success response', async () => {
    const postJSON = jest.fn(async (url) => ({
      message: url === '/api/github' ? 'Application storage failed' : 'success',
    }))
    const turnstile = turnstileMock(['token-1', 'token-2'])

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).rejects.toThrow('It has not been marked as submitted')
    expect(postJSON).toHaveBeenCalledTimes(1)
  })

  it('requires a turnstile token before submitting', async () => {
    const postJSON = jest.fn()
    const turnstile = {
      waitForToken: jest.fn(async () => ''),
      reset: jest.fn(),
    }

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).rejects.toThrow('bot verification')
    expect(postJSON).not.toHaveBeenCalled()
  })
})
