/** @jest-environment node */
/* eslint-env jest, node */

const { submitApplication } = require('./application-submission.ts')

describe('submitApplication', () => {
  const submission = { project_name: 'Test project' }

  it('creates the GitHub record before sending email', async () => {
    const postJSON = jest.fn().mockResolvedValue({ message: 'success' })

    await expect(submitApplication(submission, postJSON)).resolves.toEqual({
      github: true,
      email: true,
    })
    expect(postJSON.mock.calls.map((call) => call[0])).toEqual([
      '/api/github',
      '/api/sendgrid',
    ])
  })

  it('succeeds when GitHub is confirmed even if email fails', async () => {
    const postJSON = jest.fn(async (url) => ({
      message: url === '/api/github' ? 'success' : 'Email delivery failed',
    }))

    await expect(submitApplication(submission, postJSON)).resolves.toEqual({
      github: true,
      email: false,
    })
  })

  it('forces a retry when GitHub fails and does not email anyone', async () => {
    const postJSON = jest.fn(async (url) => {
      if (url === '/api/github') throw new Error('GitHub unavailable')
      return { message: 'success' }
    })

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'create your application record on GitHub'
    )
    expect(postJSON).toHaveBeenCalledTimes(1)
    expect(postJSON).toHaveBeenCalledWith('/api/github', submission)
  })

  it('forces a retry when GitHub returns a non-success response', async () => {
    const postJSON = jest.fn(async (url) => ({
      message:
        url === '/api/github' ? 'Application storage failed' : 'success',
    }))

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'It has not been marked as submitted'
    )
    expect(postJSON).toHaveBeenCalledTimes(1)
  })
})
