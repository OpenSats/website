import sgMail from '@sendgrid/mail'
import { TURNSTILE_TOKEN_FIELD } from './turnstile'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const TO_ADDRESS = process.env.SENDGRID_RECIPIENT
const CC_ADDRESS = process.env.SENDGRID_CC
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
  cc?: string
  bcc?: string
  from?: string
}

export interface ApplicationEmailResult {
  internalSent: boolean
  applicantSent: boolean
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!options.to || !options.subject || !options.text || !options.html) {
    console.error('Missing required email fields:', {
      to: !!options.to,
      subject: !!options.subject,
      text: !!options.text,
      html: !!options.html,
    })
    return false
  }

  if (!SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured. Email not sent.')
    return false
  }

  const { to, subject, text, html, cc, bcc, from } = options

  try {
    await sgMail.send({
      to,
      from: from || FROM_ADDRESS,
      subject,
      text,
      html,
      ...(cc ? { cc } : {}),
      ...(bcc ? { bcc } : {}),
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false },
        subscriptionTracking: { enable: false },
      },
    })
    return true
  } catch (error: unknown) {
    console.error('Error sending email:', error)
    return false
  }
}

async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries = 3,
  retryDelay = 1000
): Promise<boolean> {
  for (let attempts = 0; attempts < maxRetries; attempts++) {
    try {
      if (await sendEmail(options)) return true
    } catch (error) {
      console.error(`Email sending attempt ${attempts + 1} failed:`, error)
    }
    if (attempts + 1 < maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * (attempts + 1))
      )
    }
  }
  return false
}

/**
 * Internal OpenSats copy + applicant thank-you for a grant application.
 * Internal copy is required for a full email success; applicant is best-effort.
 */
export async function sendApplicationEmails(
  body: Record<string, unknown>
): Promise<ApplicationEmailResult> {
  if (!SENDGRID_API_KEY || !TO_ADDRESS || !FROM_ADDRESS) {
    console.error('SendGrid env misconfigured; application emails not sent.')
    return { internalSent: false, applicantSent: false }
  }

  const htmlBody = Object.entries(body)
    .filter(([key]) => key !== TURNSTILE_TOKEN_FIELD)
    .map(
      ([key, value]) => `<h3>${escapeHtml(key)}</h3><p>${escapeHtml(value)}</p>`
    )
    .join('')

  const thankYouMessage = body.RED
    ? `
Thanks for your RED application. We've received it and are fast-tracking review. We'll follow up as soon as we can. Questions: red@opensats.org
    `
    : `
Thank you for applying to OpenSats! 

We have received your application and will evaluate it soon.
This process can take 2-3 months, but in most cases it's faster.
Feel free to reach out to applications@opensats.org if you have any questions.

We will reach out again once we've made a decision. 
Thank you for your patience.
    `

  const [internalSent, applicantSent] = await Promise.all([
    sendEmailWithRetry({
      to: TO_ADDRESS,
      cc: CC_ADDRESS,
      from: FROM_ADDRESS,
      subject: body.RED
        ? `OpenSats RED: Application for ${body.project_name}`
        : `OpenSats Application for ${body.project_name}`,
      html: htmlBody,
      text: htmlBody.replace(/<[^>]*>/g, ''),
    }),
    sendEmailWithRetry({
      to: `${body.email}`,
      from: FROM_ADDRESS,
      subject: body.RED
        ? `Your OpenSats RED Application`
        : `Your Application to OpenSats`,
      html: thankYouMessage,
      text: thankYouMessage,
    }),
  ])

  if (!internalSent) {
    console.error('Application copy was not accepted by SendGrid')
  } else {
    console.info('Application copy sent to OpenSats')
  }

  if (!applicantSent) {
    console.warn('Application stored, but applicant confirmation was not sent')
  } else {
    console.info('Application receipt sent')
  }

  return { internalSent, applicantSent }
}
