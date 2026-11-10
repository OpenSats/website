import { fetchPostJSON } from './api-helpers'
import { TURNSTILE_TOKEN_FIELD } from './turnstile'

export interface ApplicationSubmissionData {
  [key: string]: unknown
}

interface DestinationResponse {
  message?: string
  githubCreated?: boolean
}

type PostJSON = (
  url: string,
  data: ApplicationSubmissionData
) => Promise<DestinationResponse>

export interface TurnstileControls {
  waitForToken: () => Promise<string>
  reset: () => void
}

// Kept by the mounted form. Only reuse an issue for the exact same payload.
export interface ApplicationSubmissionState {
  githubPayload?: string
}

export interface ApplicationDeliveryResult {
  github: boolean
}

export const SUBMISSION_ERROR =
  "We couldn't create your application record on GitHub. It has not been marked as submitted. Please try again."

export const SUBMISSION_EMAIL_ERROR =
  "We couldn't deliver your full application to OpenSats. It has not been marked as submitted. Please try again."

export const SUBMISSION_CONTACT =
  'If this keeps happening, email applications@opensats.org.'

/** Show the contact line after this many failed submit attempts. */
export const SUBMISSION_CONTACT_AFTER_FAILURES = 3

function withTurnstileToken(
  data: ApplicationSubmissionData,
  token: string
): ApplicationSubmissionData {
  return { ...data, [TURNSTILE_TOKEN_FIELD]: token }
}

export async function submitApplication(
  data: ApplicationSubmissionData,
  postJSON: PostJSON = fetchPostJSON,
  turnstile?: TurnstileControls,
  state: ApplicationSubmissionState = {}
): Promise<ApplicationDeliveryResult> {
  const token = turnstile
    ? await turnstile.waitForToken()
    : typeof data[TURNSTILE_TOKEN_FIELD] === 'string'
    ? (data[TURNSTILE_TOKEN_FIELD] as string)
    : ''

  if (!token) {
    throw new Error('Please complete the bot verification challenge.')
  }

  const application = { ...data }
  delete application[TURNSTILE_TOKEN_FIELD]
  const payload = JSON.stringify(application)
  const retryEmailOnly = state.githubPayload === payload

  try {
    const response = await postJSON(
      retryEmailOnly ? '/api/sendgrid' : '/api/github',
      withTurnstileToken(application, token)
    )
    if (!retryEmailOnly && response.githubCreated === true) {
      state.githubPayload = payload
    }
    if (response.message !== 'success') {
      throw new Error('Application delivery failed')
    }
    state.githubPayload = payload
    return { github: true }
  } catch {
    turnstile?.reset()
    throw new Error(
      state.githubPayload === payload
        ? SUBMISSION_EMAIL_ERROR
        : SUBMISSION_ERROR
    )
  }
}
