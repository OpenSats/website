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
