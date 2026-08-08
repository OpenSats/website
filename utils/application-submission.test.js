/** @jest-environment node */
/* eslint-env jest, node */

const { submitApplication } = require('./application-submission.ts')

describe('submitApplication', () => {
  const submission = { project_name: 'Test project' }

  it('attempts both destinations and reports full delivery', async () => {
    const postJSON = jest.fn().mockResolvedValue({ message: 'success' })

    await expect(submitApplication(submission, postJSON)).resolves.toEqual({
      github: true,
      email: true,
    })
    expect(postJSON).toHaveBeenCalledTimes(2)
    expect(postJSON).toHaveBeenCalledWith('/api/github', submission)
    expect(postJSON).toHaveBeenCalledWith('/api/sendgrid', submission)
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

  it('forces a retry when GitHub fails even if email succeeds', async () => {
    const postJSON = jest.fn(async (url) => {
      if (url === '/api/github') throw new Error('GitHub unavailable')
      return { message: 'success' }
    })

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'create your application record on GitHub'
    )
  })

  it('forces a retry when GitHub returns a non-success response', async () => {
    const postJSON = jest.fn(async (url) => ({
      message:
        url === '/api/github' ? 'Application storage failed' : 'success',
    }))

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'It has not been marked as submitted'
    )
  })

  it('forces a retry when both destinations fail', async () => {
    const postJSON = jest.fn().mockRejectedValue(new Error('Network error'))

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'It has not been marked as submitted'
    )
  })
})
