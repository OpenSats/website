import { NextApiRequest } from 'next/types'
import Stripe from 'stripe'
import {
  maskEmail,
  maskName,
  sendDonationReceipt,
  sendDonationNotification,
} from './email-helpers'

// Stripe configuration
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  // @ts-ignore stripe-version-202-08-27
  apiVersion: '2020-08-27',
})

// Stripe webhook event types
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: Stripe.Checkout.Session
  }
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
 * Map zaprite campaign ID to readable fund name for admin notifications
 */
function getFundNameForAdmin(zapriteId: string): string {
  const fundMapping: Record<string, string> = {
    'lZo1wcsJ0SQb58XfGC4e': 'Operations Budget',
    '32WbND8heqmY5wYYnIpa': 'General Fund',
    'OoYtzNjilW1NRtDsxLAj': 'The Nostr Fund',
  }
  
  return fundMapping[zapriteId] || 'General Fund'
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
    const zapriteId = session.metadata?.recipient_campaign
    const fundName = zapriteId || 'General Fund'
    const sessionId = session.id

    // Extract payment amount from the session
    const paymentAmount = session.amount_total 
      ? formatAmountFromCents(session.amount_total, session.currency || 'usd')
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
        paymentCurrency,
        'fiat'
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
    const adminFundName = zapriteId ? getFundNameForAdmin(zapriteId) : 'General Fund'
    const notificationSent = await sendDonationNotification(
      donorEmail,
      donorName,
      adminFundName,
      sessionId,
      paymentAmount,
      paymentCurrency,
      'fiat'
    )

    if (notificationSent) {
      console.log('✅ Donation notification sent successfully!')
    } else {
      console.log('❌ Failed to send donation notification')
    }
  }
}
