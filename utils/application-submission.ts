import { fetchPostJSON } from './api-helpers'
import { TURNSTILE_TOKEN_FIELD } from './turnstile'

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

export interface TurnstileControls {
  waitForToken: () => Promise<string>
  reset: () => void
}

export interface ApplicationDeliveryResult {
  github: boolean
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

function withTurnstileToken(
  data: ApplicationSubmissionData,
  token: string
): ApplicationSubmissionData {
  return { ...data, [TURNSTILE_TOKEN_FIELD]: token }
}

export async function submitApplication(
  data: ApplicationSubmissionData,
  postJSON: PostJSON = fetchPostJSON,
  turnstile?: TurnstileControls
): Promise<ApplicationDeliveryResult> {
  const token = turnstile
    ? await turnstile.waitForToken()
    : typeof data[TURNSTILE_TOKEN_FIELD] === 'string'
      ? (data[TURNSTILE_TOKEN_FIELD] as string)
      : ''

  if (!token) {
    throw new Error('Please complete the bot verification challenge.')
  }

  // One Turnstile token: /api/github verifies and creates the issue, then
  // sends application emails server-side (best-effort).
  const github = await postSucceeded(
    postJSON,
    '/api/github',
    withTurnstileToken(data, token)
  )
  if (!github) {
    turnstile?.reset()
    throw new Error(SUBMISSION_ERROR)
  }

  return { github: true }
}
