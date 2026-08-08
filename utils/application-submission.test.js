/** @jest-environment node */
/* eslint-env jest, node */

const { submitApplication } = require('./application-submission.ts')

describe('submitApplication', () => {
  const submission = { project_name: 'Test project', formElapsedMs: 60000 }

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

  it('succeeds when GitHub fails but the internal email is confirmed', async () => {
    const postJSON = jest.fn(async (url) => {
      if (url === '/api/github') throw new Error('GitHub unavailable')
      return { message: 'success' }
    })

    await expect(submitApplication(submission, postJSON)).resolves.toEqual({
      github: false,
      email: true,
    })
  })

  it('succeeds when email fails but the GitHub record is confirmed', async () => {
    const postJSON = jest.fn(async (url) => ({
      message: url === '/api/github' ? 'success' : 'Email delivery failed',
    }))

    await expect(submitApplication(submission, postJSON)).resolves.toEqual({
      github: true,
      email: false,
    })
  })

  it('does not report success when neither destination confirms storage', async () => {
    const postJSON = jest
      .fn()
      .mockResolvedValue({ message: 'Delivery unavailable' })

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'It has not been marked as submitted'
    )
  })

  it('does not report success when both requests fail at the transport layer', async () => {
    const postJSON = jest.fn().mockRejectedValue(new Error('Network error'))

    await expect(submitApplication(submission, postJSON)).rejects.toThrow(
      'It has not been marked as submitted'
    )
  })
})
