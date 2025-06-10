import { NextApiRequest, NextApiResponse } from 'next/types'
import sgMail from '@sendgrid/mail'
import { marked } from 'marked'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const TO_ADDRESS = process.env.SENDGRID_RECIPIENT
const CC_ADDRESS = process.env.SENDGRID_CC
const BCC_ADDRESS = process.env.SENDGRID_BCC
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER

// Initialize SendGrid with API key
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

/**
 * Send an email using SendGrid
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Validate required fields
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
    const msg = {
      to,
      from: from || FROM_ADDRESS,
      subject,
      text,
      html,
      ...(cc ? { cc } : {}),
      ...(bcc ? { bcc } : {}),
      trackingSettings: {
        clickTracking: {
          enable: false,
        },
        openTracking: {
          enable: false,
        },
        subscriptionTracking: {
          enable: false,
        },
      },
    }

    const startTime = Date.now()
    await sgMail.send(msg)
    const duration = Date.now() - startTime

    console.log(`Email sent successfully to ${to} in ${duration}ms`)
    return true
  } catch (error: unknown) {
    console.error('Error sending email:', error)
    if (typeof error === 'object' && error !== null && 'response' in error) {
      // @ts-ignore
      console.error('  Status code:', error.code)
      // @ts-ignore
      if (
        typeof error.response === 'object' &&
        error.response !== null &&
        'body' in error.response
      ) {
        console.error(
          '  Response body:',
          JSON.stringify(error.response.body, null, 2)
        )
      }
    }

    console.error('Email details:', {
      to,
      from: from || FROM_ADDRESS,
      subject,
      textLength: text?.length || 0,
      htmlLength: html?.length || 0,
      hasCc: !!cc,
      hasBcc: !!bcc,
    })

    return false
  }
}

/**
 * Send an email using SendGrid with retry logic
 */
async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries = 3,
  retryDelay = 1000
): Promise<boolean> {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const result = await sendEmail(options)
      if (result) return true

      attempts++
      if (attempts < maxRetries) {
        const delay = retryDelay * attempts
        console.log(
          `Email sending attempt ${attempts} failed, retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      attempts++
      if (attempts < maxRetries) {
        const delay = retryDelay * attempts
        console.error(
          `Email sending attempt ${attempts} failed with error, retrying in ${delay}ms:`,
          error
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`All ${maxRetries} email sending attempts failed:`, error)
        return false
      }
    }
  }

  console.error(`Failed to send email after ${maxRetries} attempts`)
  return false
}

/**
 * Send a confirmation email for a submitted report
 */
export async function sendReportConfirmationEmail(
  email: string,
  projectName: string,
  reportUrl: string,
  reportContent: string
): Promise<boolean> {
  // Convert markdown to HTML
  const htmlContent = marked(reportContent, {
    gfm: true,
    breaks: true,
  })

  const msg = {
    to: email,
    from: FROM_ADDRESS,
    bcc: BCC_ADDRESS,
    subject: `OpenSats Progress Report Submitted for ${projectName}`,
    text: `Thank you for submitting your progress report for ${projectName}!\n\nYour progress report has been successfully submitted to OpenSats. The OpenSats team will review your report and we will reach out if we have any questions.\n\nReport Content:\n${reportContent}\n\nIf you have any questions or need assistance, please reply to this email or contact support@opensats.org.\n\nBest Regards,\nThe OpenSats Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292e;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f97316;
            padding: 20px;
            text-align: center;
            color: white;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            border: 1px solid #e1e4e8;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #6a737d;
            text-align: center;
          }
          .report-content {
            background-color: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
          }
          .report-content h2 {
            margin-top: 0;
            color: #444;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Progress Report Submitted</h2>
        </div>
        <div class="content">
          <p>Thank you for submitting your progress report for <strong>${projectName}</strong>!</p>
          
          <p>Your progress report has been successfully submitted to OpenSats. The OpenSats team will review your report and we will reach out if we have any questions.</p>
          
          <div class="report-content">
            <h2>Your Report Content:</h2>
            ${htmlContent}
          </div>
          
          <p>If you have any questions or need assistance, please reply to this email or contact <a href="mailto:support@opensats.org">support@opensats.org</a>.</p>
          
          <p>Best Regards,<br>The OpenSats Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} OpenSats. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  }

  return sendEmailWithRetry(msg)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (!SENDGRID_API_KEY || !TO_ADDRESS || !FROM_ADDRESS) {
      throw new Error('Env misconfigured')
    }

    let body = ''

    for (const [key, value] of Object.entries(req.body)) {
      body += `<h3>${key}</h3><p>${value}</p>`
    }

    const thankYouMessage = `
Thank you for applying to OpenSats! 

We have received your application and will evaluate it soon.
This process can take 2-3 months, but in most cases it's faster.
Feel free to reach out to applications@opensats.org if you have any questions.

We will reach out again once we've made a decision. 
Thank you for your patience.
    `

    try {
      // Mail 'application received' to applicant
      const msg = {
        to: `${req.body.email}`, // Applicant
        from: FROM_ADDRESS, // Verified sender
        subject: `Your Application to OpenSats`,
        html: `${thankYouMessage}`,
        text: thankYouMessage,
      }

      await sendEmailWithRetry(msg)
      console.info('Application receipt sent')
    } catch (err) {
      console.error(err)
    } finally {
      // Mail application content to us
      try {
        const msg = {
          to: TO_ADDRESS, // OpenSats
          cc: CC_ADDRESS, // Processing & backup
          from: FROM_ADDRESS, // Verified sender
          subject: `OpenSats Application for ${req.body.project_name}`,
          html: `${body}`,
          text: body.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
        }

        await sendEmailWithRetry(msg)
        console.info('Application copy sent to OpenSats')
        res.status(200).json({ message: 'success' })
      } catch (err) {
        res
          .status(500)
          .json({ statusCode: 500, message: (err as Error).message })
      }
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
