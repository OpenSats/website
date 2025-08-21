import { NextApiRequest } from 'next/types'
import * as sgMail from '@sendgrid/mail'
import Stripe from 'stripe'

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
})

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

// Stripe webhook event types
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: Stripe.Checkout.Session
  }
}

/**
 * Mask email address for privacy (e.g., john.doe@example.com -> j***@e***.com)
 */
function maskEmail(email: string): string {
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
function maskName(name: string): string {
  if (!name || name === 'Anonymous') return 'Anonymous'

  return name
    .split(' ')
    .map((word) => word.charAt(0) + '***')
    .join(' ')
}

/**
 * Helper function to get raw body from request
 */
export function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })
}

/**
 * Send donation receipt email using SendGrid dynamic template
 */
export async function sendDonationReceipt(
  donorEmail: string,
  donorName: string,
  fundName: string,
  sessionId: string,
  amount?: string,
  currency?: string
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
          method: 'credit_card',
          currency: currency || 'USD',
          amount: amount || 'Unknown',
        },
        fund_name: fundName,
        invoice_id: sessionId,
        receipt_number: `RCP-${sessionId.slice(-8).toUpperCase()}`,
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
  sessionId: string,
  amount?: string,
  currency?: string
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
        method: 'credit_card',
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

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhookSignature(
  body: Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret)
    console.log('🔍 Stripe signature verification: ✅ valid')
    return event
  } catch (error) {
    console.error('❌ Stripe signature verification failed:', error)
    throw error
  }
}

/**
 * Format amount from cents to dollars
 */
function formatAmountFromCents(amount: number, currency: string): string {
  if (currency.toLowerCase() === 'usd') {
    return (amount / 100).toFixed(2)
  }
  return amount.toString()
}

/**
 * Process Stripe webhook event and send donation receipt
 */
export async function processStripeWebhook(
  event: Stripe.Event
): Promise<void> {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    const donorName = session.metadata?.donor_name || 'Anonymous'
    const donorEmail = session.metadata?.donor_email || 'No email provided'
    const fundName = session.metadata?.recipient_campaign || 'General Fund'
    const sessionId = session.id

    // Extract payment amount from the session
    const lineItems = session.line_items?.data
    const paymentAmount = lineItems && lineItems.length > 0 
      ? formatAmountFromCents(lineItems[0].amount_total || 0, session.currency || 'usd')
      : 'Unknown'
    const paymentCurrency = session.currency?.toUpperCase() || 'USD'

    console.log('🎉 Stripe Checkout Session Completed!')
    console.log('📧 Donor Email:', maskEmail(donorEmail))
    console.log('👤 Donor Name:', maskName(donorName))
    console.log('💰 Fund:', fundName)
    console.log('🆔 Session ID:', sessionId)
    console.log('💸 Amount:', paymentAmount, paymentCurrency)
    console.log('⏰ Timestamp:', new Date(event.created * 1000).toISOString())

    // Send donation receipt via SendGrid
    if (donorEmail && donorEmail !== 'No email provided') {
      console.log('📧 Sending donation receipt...')
      const receiptSent = await sendDonationReceipt(
        donorEmail,
        donorName,
        fundName,
        sessionId,
        paymentAmount,
        paymentCurrency
      )

      if (receiptSent) {
        console.log('✅ Donation receipt sent successfully!')
      } else {
        console.log('❌ Failed to send donation receipt')
      }
    } else {
      console.log('⚠️  No valid email address, skipping receipt')
    }

    // Send donation notification to admins
    console.log('📧 Sending donation notification to admins...')
    const notificationSent = await sendDonationNotification(
      donorEmail,
      donorName,
      fundName,
      sessionId,
      paymentAmount,
      paymentCurrency
    )

    if (notificationSent) {
      console.log('✅ Donation notification sent successfully!')
    } else {
      console.log('❌ Failed to send donation notification')
    }
  }
}
