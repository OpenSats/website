import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'
import sgMail from '@sendgrid/mail'
import { isSpamSubmission } from '@/utils/form-security'
import { saveFormDataToCookie, clearFormDataCookie } from '@/utils/form-cookies'
import * as EmailValidator from 'email-validator'

const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN
const GH_ORG = process.env.GH_ORG
const GH_APP_REPO = process.env.GH_APP_REPO
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const TO_ADDRESS = process.env.SENDGRID_RECIPIENT
const CC_ADDRESS = process.env.SENDGRID_CC
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

const octokit = new Octokit({ auth: GH_ACCESS_TOKEN })

/**
 * Validate required form fields
 */
function validateFormData(body: Record<string, any>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required fields
  const requiredFields = [
    'main_focus',
    'project_name',
    'short_description',
    'potential_impact',
    'license',
    'duration',
    'timelines',
    'commitment',
    'proposed_budget',
    'your_name',
    'email',
    'references',
  ]

  for (const field of requiredFields) {
    if (
      !body[field] ||
      (typeof body[field] === 'string' && !body[field].trim())
    ) {
      errors.push(`${field} is required`)
    }
  }

  // Email validation
  if (body.email && !EmailValidator.validate(body.email)) {
    errors.push('Invalid email address')
  }

  // FOSS checkbox validation
  if (!body.free_open_source) {
    errors.push('Project must be free and open-source')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Detect if request is JSON or form submission
 */
function isJsonRequest(req: NextApiRequest): boolean {
  const contentType = req.headers['content-type'] || ''
  const acceptsJson = req.headers['accept']?.includes('application/json')

  return (
    contentType.includes('application/json') ||
    acceptsJson ||
    !!req.body._jsEnabled
  )
}

/**
 * Submit application to GitHub
 */
async function submitToGitHub(
  formData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!GH_ACCESS_TOKEN || !GH_ORG || !GH_APP_REPO) {
    return { success: false, error: 'GitHub configuration missing' }
  }

  try {
    const issueTitle = `${formData.project_name} by ${formData.your_name}`

    const issueBody = `
### Description

${formData.short_description}

### Potential Impact

${formData.potential_impact}

### Timeline & Milestones

${formData.duration ? `Grant duration: ${formData.duration}` : ''}
${formData.commitment ? `Time commitment: ${formData.commitment}` : ''}

${formData.timelines}

### Proposed Budget

${formData.proposed_budget}

**Prior funding:** ${formData.has_received_funding ? 'Yes' : 'No'}

${formData.what_funding || ''}

### References & Prior Contributions

${formData.references}

${formData.bios || 'No prior contributions.'}

**Years of dev experience:** ${formData.years_experience || '0'}

### Anything Else

${formData.anything_else || 'No.'}

---

${formData.website ? `Website: ${formData.website}` : ''}
${formData.license ? `License: ${formData.license}` : ''}
${formData.github ? formData.github : ''}
${formData.personal_github ? formData.personal_github : ''}
${
  formData.other_contact
    ? `Other contact details: ${formData.other_contact}`
    : ''
}
`

    const mainFocus = `${formData.main_focus}`.toLowerCase()
    const issueLabels = [mainFocus]

    if (mainFocus === 'layer1' || mainFocus === 'layer2') {
      issueLabels.push('bitcoin')
    }

    let appRepo = GH_APP_REPO
    if (mainFocus === 'nostr') appRepo = `${GH_APP_REPO}-nostr`
    if (mainFocus === 'layer1') appRepo = `${GH_APP_REPO}-layer1`
    if (mainFocus === 'layer2') appRepo = `${GH_APP_REPO}-layer2`
    if (mainFocus === 'core') appRepo = `${GH_APP_REPO}-core`
    if (mainFocus === 'ecash') appRepo = `${GH_APP_REPO}-ecash`

    formData.has_received_funding && issueLabels.push('prior funding')
    !formData.free_open_source && issueLabels.push('not FLOSS')
    !formData.are_you_lead && issueLabels.push('surrogate')

    await octokit.rest.issues.create({
      owner: GH_ORG,
      repo: appRepo,
      title: issueTitle,
      body: issueBody,
      labels: issueLabels,
    })

    return { success: true }
  } catch (error) {
    console.error('GitHub submission error:', error)
    return { success: false, error: 'Failed to create GitHub issue' }
  }
}

/**
 * Send emails via SendGrid
 */
async function sendEmails(
  formData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!SENDGRID_API_KEY || !TO_ADDRESS || !FROM_ADDRESS) {
    return { success: false, error: 'SendGrid configuration missing' }
  }

  try {
    let body = ''
    for (const [key, value] of Object.entries(formData)) {
      if (
        !key.startsWith('form') &&
        !key.startsWith('_') &&
        key !== 'organization_website'
      ) {
        body += `<h3>${key}</h3><p>${value}</p>`
      }
    }

    const thankYouMessage = `
Thank you for applying to OpenSats!

We have received your application and will evaluate it soon.
This process can take 2-3 months, but in most cases it's faster.
Feel free to reach out to applications@opensats.org if you have any questions.

We will reach out again once we've made a decision.
Thank you for your patience.
`

    // Send confirmation to applicant
    await sgMail.send({
      to: formData.email,
      from: FROM_ADDRESS,
      subject: 'Your Application to OpenSats',
      html: `<pre>${thankYouMessage}</pre>`,
      text: thankYouMessage,
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false },
        subscriptionTracking: { enable: false },
      },
    })

    // Send application to OpenSats
    await sgMail.send({
      to: TO_ADDRESS,
      cc: CC_ADDRESS,
      from: FROM_ADDRESS,
      subject: `OpenSats Application for ${formData.project_name}`,
      html: body,
      text: body.replace(/<[^>]*>/g, ''),
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false },
        subscriptionTracking: { enable: false },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error: 'Failed to send emails' }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const isJson = isJsonRequest(req)

  // Spam check - silently accept but don't process
  if (isSpamSubmission(req.body)) {
    console.log('Spam submission detected')
    if (isJson) {
      return res.status(200).json({ message: 'success' })
    } else {
      return res.redirect(302, '/submitted')
    }
  }

  // Validate form data
  const validation = validateFormData(req.body)
  if (!validation.valid) {
    console.log('Validation errors:', validation.errors)

    if (isJson) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      })
    } else {
      // Save form data to cookie for re-population
      saveFormDataToCookie(res, req.body)
      const errorMessage = encodeURIComponent(validation.errors.join(', '))
      return res.redirect(
        302,
        `/apply/grant?error=validation&message=${errorMessage}`
      )
    }
  }

  // Submit to GitHub
  const githubResult = await submitToGitHub(req.body)
  if (!githubResult.success) {
    console.error('GitHub submission failed:', githubResult.error)
    // Continue anyway - email is more important
  }

  // Send emails
  const emailResult = await sendEmails(req.body)
  if (!emailResult.success) {
    console.error('Email sending failed:', emailResult.error)

    if (isJson) {
      return res.status(500).json({
        message: 'Failed to send application',
        error: emailResult.error,
      })
    } else {
      saveFormDataToCookie(res, req.body)
      return res.redirect(302, '/apply/grant?error=server')
    }
  }

  // Success!
  console.log('Application submitted successfully')

  if (isJson) {
    return res.status(200).json({ message: 'success' })
  } else {
    // Clear form data cookie on success
    clearFormDataCookie(res)
    return res.redirect(302, '/submitted')
  }
}
