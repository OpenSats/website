/** @jest-environment node */
/* eslint-env jest, node */

const { submitApplication } = require('./application-submission.ts')

describe('submitApplication', () => {
  const submission = { project_name: 'Test project' }

  function turnstileMock(token) {
    return {
      waitForToken: jest.fn(async () => token),
      reset: jest.fn(),
    }
  }

  it('creates the GitHub record with a Turnstile token', async () => {
    const postJSON = jest.fn().mockResolvedValue({ message: 'success' })
    const turnstile = turnstileMock('token-1')

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).resolves.toEqual({
      github: true,
    })
    expect(postJSON).toHaveBeenCalledTimes(1)
    expect(postJSON).toHaveBeenCalledWith(
      '/api/github',
      expect.objectContaining({ 'cf-turnstile-response': 'token-1' })
    )
  })

  it('forces a retry when GitHub fails', async () => {
    const postJSON = jest.fn(async () => {
      throw new Error('GitHub unavailable')
    })
    const turnstile = turnstileMock('token-1')

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).rejects.toThrow('Please try again.')
    expect(postJSON).toHaveBeenCalledTimes(1)
    expect(turnstile.reset).toHaveBeenCalled()
  })

  it('forces a retry when GitHub returns a non-success response', async () => {
    const postJSON = jest.fn().mockResolvedValue({
      message: 'Application storage failed',
    })
    const turnstile = turnstileMock('token-1')

    await expect(
      submitApplication(submission, postJSON, turnstile)
    ).rejects.toThrow('It has not been marked as submitted')
    expect(postJSON).toHaveBeenCalledTimes(1)
  })

  it('retries only email after a confirmed GitHub create, using a fresh token', async () => {
    const state = {}
    const postJSON = jest
      .fn()
      .mockResolvedValueOnce({
        message: 'Application email delivery failed',
        githubCreated: true,
      })
      .mockResolvedValueOnce({ message: 'Application email delivery failed' })
      .mockResolvedValueOnce({ message: 'success' })
    const turnstile = turnstileMock('token-1')

    await expect(
      submitApplication(submission, postJSON, turnstile, state)
    ).rejects.toThrow("couldn't deliver your full application")
    expect(turnstile.reset).toHaveBeenCalledTimes(1)

    turnstile.waitForToken.mockResolvedValue('token-2')
    await expect(
      submitApplication(submission, postJSON, turnstile, state)
    ).rejects.toThrow("couldn't deliver your full application")
    expect(turnstile.reset).toHaveBeenCalledTimes(2)

    turnstile.waitForToken.mockResolvedValue('token-3')
    await expect(
      submitApplication(submission, postJSON, turnstile, state)
    ).resolves.toEqual({ github: true })
    expect(postJSON.mock.calls).toEqual([
      ['/api/github', { ...submission, 'cf-turnstile-response': 'token-1' }],
      ['/api/sendgrid', { ...submission, 'cf-turnstile-response': 'token-2' }],
      ['/api/sendgrid', { ...submission, 'cf-turnstile-response': 'token-3' }],
    ])
  })

  it('ignores token changes when matching a partial submission for retry', async () => {
    const state = {}
    const postJSON = jest
      .fn()
      .mockResolvedValueOnce({
        message: 'Application email delivery failed',
        githubCreated: true,
      })
      .mockResolvedValueOnce({ message: 'success' })
    const first = { ...submission, 'cf-turnstile-response': 'token-1' }
    const retry = { ...submission, 'cf-turnstile-response': 'token-2' }

    await expect(
      submitApplication(first, postJSON, undefined, state)
    ).rejects.toThrow()
    await expect(
      submitApplication(retry, postJSON, undefined, state)
    ).resolves.toEqual({ github: true })

    expect(postJSON).toHaveBeenLastCalledWith('/api/sendgrid', retry)
    expect(first['cf-turnstile-response']).toBe('token-1')
  })

  it('creates a new issue if the applicant changes the payload after partial delivery', async () => {
    const state = {}
    const postJSON = jest
      .fn()
      .mockResolvedValueOnce({
        message: 'Application email delivery failed',
        githubCreated: true,
      })
      .mockResolvedValueOnce({ message: 'success' })
    const turnstile = turnstileMock('token-1')
    await expect(
      submitApplication(submission, postJSON, turnstile, state)
    ).rejects.toThrow()

    const edited = { ...submission, project_name: 'Updated project' }
    await expect(
      submitApplication(edited, postJSON, turnstile, state)
    ).resolves.toEqual({ github: true })
    expect(postJSON.mock.calls.map(([url]) => url)).toEqual([
      '/api/github',
      '/api/github',
    ])
  })

  it('does not skip GitHub on retry without confirmation that the issue exists', async () => {
    const state = {}
    const postJSON = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ message: 'success' })
    const turnstile = turnstileMock('token-1')
    await expect(
      submitApplication(submission, postJSON, turnstile, state)
    ).rejects.toThrow()
    await expect(
      submitApplication(submission, postJSON, turnstile, state)
    ).resolves.toEqual({ github: true })
    expect(postJSON.mock.calls.map(([url]) => url)).toEqual([
      '/api/github',
      '/api/github',
    ])
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
