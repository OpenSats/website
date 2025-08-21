import * as sgMail from '@sendgrid/mail'

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER
const SENDER_NAME = process.env.SENDGRID_SENDER_NAME || 'OpenSats'
const RECEIPT_TEMPLATE_ID = 'd-7373b3667bea4b2eb1632319e90e1a92'
const NOTIFICATION_TEMPLATE_ID = 'd-962d8c981b6542cd916a662189bdce4e'
const SENDGRID_RECIPIENT_ACCOUNTING = process.env.SENDGRID_RECIPIENT_ACCOUNTING

// Helper function to format sender with name
function getSenderWithName(): string {
  if (!FROM_ADDRESS) return ''
  return `${SENDER_NAME} <${FROM_ADDRESS}>`
}

// Initialize SendGrid with API key
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

/**
 * Mask email address for privacy (e.g., john.doe@example.com -> j***@e***.com)
 */
export function maskEmail(email: string): string {
  if (!email || email === 'No email provided') return 'No email provided'

  const [localPart, domain] = email.split('@')
  if (!domain) return email

  const maskedLocal = localPart.charAt(0) + '***'
  const [domainName, tld] = domain.split('.')
  const maskedDomain = domainName.charAt(0) + '***'

  return `${maskedLocal}@${maskedDomain}.${tld}`
}

/**
 * Mask name for privacy (e.g., John Doe -> J*** D***)
 */
export function maskName(name: string): string {
  if (!name || name === 'Anonymous') return 'Anonymous'

  return name
    .split(' ')
    .map((word) => word.charAt(0) + '***')
    .join(' ')
}

/**
 * Send donation receipt email using SendGrid dynamic template
 */
export async function sendDonationReceipt(
  donorEmail: string,
  donorName: string,
  fundName: string,
  transactionId: string,
  amount?: string,
  currency?: string,
  paymentMethod: 'bitcoin' | 'fiat' = 'bitcoin'
): Promise<boolean> {
  if (!SENDGRID_API_KEY || !FROM_ADDRESS) {
    console.error('SendGrid not configured. Receipt not sent.')
    return false
  }

  try {
    const msg = {
      to: donorEmail,
      from: getSenderWithName(),
      templateId: RECEIPT_TEMPLATE_ID,
      dynamicTemplateData: {
        donor: {
          name: donorName,
        },
        donation: {
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          method: paymentMethod,
          currency: currency || 'USD',
          amount: amount || 'Unknown',
        },
        fund_name: fundName,
        invoice_id: transactionId,
        receipt_number: `RCP-${transactionId.slice(-8).toUpperCase()}`,
      },
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

    console.log(
      `📧 Receipt sent successfully to ${maskEmail(
        donorEmail
      )} in ${duration}ms`
    )
    return true
  } catch (error: unknown) {
    console.error('❌ Error sending donation receipt:', error)
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
    return false
  }
}

/**
 * Send donation notification email to admins using SendGrid dynamic template
 */
export async function sendDonationNotification(
  donorEmail: string,
  donorName: string,
  fundName: string,
  transactionId: string,
  amount?: string,
  currency?: string,
  paymentMethod: 'bitcoin' | 'fiat' = 'bitcoin'
): Promise<boolean> {
  if (!SENDGRID_API_KEY || !FROM_ADDRESS || !SENDGRID_RECIPIENT_ACCOUNTING) {
    console.error('SendGrid or accounting email not configured. Notification not sent.')
    return false
  }

  try {
    const msg = {
      to: SENDGRID_RECIPIENT_ACCOUNTING,
      from: getSenderWithName(),
      templateId: NOTIFICATION_TEMPLATE_ID,
      dynamicTemplateData: {
        method: paymentMethod,
        amount: amount || 'Unknown',
        currency: currency || 'USD',
        recipient: fundName,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
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

    console.log(
      `📧 Donation notification sent successfully to ${SENDGRID_RECIPIENT_ACCOUNTING} in ${duration}ms`
    )
    return true
  } catch (error: unknown) {
    console.error('❌ Error sending donation notification:', error)
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
    return false
  }
}
