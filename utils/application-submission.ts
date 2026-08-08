import { fetchPostJSON } from './api-helpers'

export interface ApplicationSubmissionData {
  [key: string]: unknown
  formElapsedMs?: number
}

interface DestinationResponse {
  message?: string
}

type PostJSON = (
  url: string,
  data: ApplicationSubmissionData
) => Promise<DestinationResponse>

export interface ApplicationDeliveryResult {
  github: boolean
  email: boolean
}

const SUBMISSION_ERROR =
  "We couldn't confirm that your application reached OpenSats. It has not been marked as submitted. Please try again or contact applications@opensats.org."

export async function submitApplication(
  data: ApplicationSubmissionData,
  postJSON: PostJSON = fetchPostJSON
): Promise<ApplicationDeliveryResult> {
  const destinations = ['/api/github', '/api/sendgrid'] as const
  const results = await Promise.allSettled(
    destinations.map(async (destination) => {
      const response = await postJSON(destination, data)
      return response.message === 'success'
    })
  )

  const [github, email] = results.map(
    (result) => result.status === 'fulfilled' && result.value
  )

  if (!github && !email) {
    throw new Error(SUBMISSION_ERROR)
  }

  return { github, email }
}
