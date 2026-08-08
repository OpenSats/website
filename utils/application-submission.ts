import { fetchPostJSON } from './api-helpers'

export interface ApplicationSubmissionData {
  [key: string]: unknown
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

export const SUBMISSION_ERROR =
  "We couldn't create your application record on GitHub. It has not been marked as submitted. Please try again."

export const SUBMISSION_CONTACT =
  'If this keeps happening, email applications@opensats.org.'

/** Show the contact line after this many failed submit attempts. */
export const SUBMISSION_CONTACT_AFTER_FAILURES = 3

async function postSucceeded(
  postJSON: PostJSON,
  url: string,
  data: ApplicationSubmissionData
): Promise<boolean> {
  try {
    const response = await postJSON(url, data)
    return response.message === 'success'
  } catch {
    return false
  }
}

export async function submitApplication(
  data: ApplicationSubmissionData,
  postJSON: PostJSON = fetchPostJSON
): Promise<ApplicationDeliveryResult> {
  // GitHub first: only email after the issue exists, so retries do not
  // re-send the applicant receipt or internal copy on a failed create.
  const github = await postSucceeded(postJSON, '/api/github', data)
  if (!github) {
    throw new Error(SUBMISSION_ERROR)
  }

  const email = await postSucceeded(postJSON, '/api/sendgrid', data)
  return { github, email }
}
