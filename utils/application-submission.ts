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
  resetAndWaitForToken: () => Promise<string>
}

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
  // Tokens are single-use: verify one for GitHub, then reset and verify
  // another for SendGrid so siteverify does not reject timeout-or-duplicate.
  const githubToken = turnstile
    ? await turnstile.waitForToken()
    : String(data[TURNSTILE_TOKEN_FIELD] || '')

  if (!githubToken) {
    throw new Error('Please complete the bot verification challenge.')
  }

  const github = await postSucceeded(
    postJSON,
    '/api/github',
    withTurnstileToken(data, githubToken)
  )
  if (!github) {
    turnstile?.reset()
    throw new Error(SUBMISSION_ERROR)
  }

  const emailToken = turnstile
    ? await turnstile.resetAndWaitForToken()
    : String(data[TURNSTILE_TOKEN_FIELD] || '')

  const email = await postSucceeded(
    postJSON,
    '/api/sendgrid',
    withTurnstileToken(data, emailToken)
  )
  return { github, email }
}
