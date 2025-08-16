import { NextApiRequest, NextApiResponse } from 'next/types'
import crypto from 'crypto'
import sgMail from '@sendgrid/mail'

// Configure Next.js to parse the body as raw bytes for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// BTCPay Server webhook secret from environment variables
const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER
const RECEIPT_TEMPLATE_ID = 'd-7373b3667bea4b2eb1632319e90e1a92'

// Initialize SendGrid with API key
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
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

// Helper function to get raw body from request
function getRawBody(req: NextApiRequest): Promise<Buffer> {
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
async function sendDonationReceipt(
  donorEmail: string,
  donorName: string,
  fundName: string,
  invoiceId: string,
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
      from: FROM_ADDRESS,
      templateId: RECEIPT_TEMPLATE_ID,
      dynamicTemplateData: {
        donor: {
          name: donorName,
          // company: undefined (not used)
        },
        donation: {
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }), // e.g., "August 14, 2025"
          method: 'bitcoin',
          currency: currency || 'BTC',
          amount: amount || 'Unknown',
        },
        // Additional data for reference
        fund_name: fundName,
        invoice_id: invoiceId,
        receipt_number: `RCP-${invoiceId.slice(-8).toUpperCase()}`, // Generate receipt number from invoice ID
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

// BTCPay Server webhook event types
interface BTCPayWebhookEvent {
  deliveryId: string
  webhookId: string
  originalDeliveryId: string
  isRedelivery: boolean
  type: string
  timestamp: number
  storeId: string
  invoiceId: string
  payment?: {
    value: string
    network: string
    method: string
    destination: string
    rate: number
    paymentMethodFee: string
    totalPaid: string
    due: string
    amount: string
    networkFee: string
    payments: Array<{
      id: string
      receivedDate: number
      value: string
      fee: string
      networkFee: string
      paymentMethod: string
      paymentMethodFee: string
      rate: number
      destination: string
      network: string
    }>
  }
  metadata?: {
    orderId?: string
    fund_name?: string
    buyerName?: string
    buyerEmail?: string
    posData?: {
      orderId?: string
      zaprite_campaign?: string
      fund_name?: string
      buyerName?: string
      buyerEmail?: string
    }
    zaprite_campaign?: string
    recipient_uuid?: string
  }
}

/**
 * Verify BTCPay Server webhook signature
 */
function verifyWebhookSignature(
  body: Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    // BTCPay Server sends signature in format: "sha256=hash"
    const signatureHash = signature.replace('sha256=', '')

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    // Log signature verification result
    console.log(
      '🔍 Signature verification:',
      signatureHash === expectedSignature ? '✅ valid' : '❌ invalid'
    )

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the raw body bytes for signature verification
    const rawBody = await getRawBody(req)

    // Get the webhook signature from headers
    const signature = req.headers['btcpay-sig'] as string

    // Log basic webhook info for monitoring
    console.log(
      '📨 BTCPay webhook received with signature:',
      signature ? 'present' : 'missing'
    )

    if (!signature) {
      console.error('Missing BTCPay signature header')
      return res.status(400).json({ error: 'Missing signature' })
    }

    if (!WEBHOOK_SECRET) {
      console.error('BTCPay webhook secret not configured')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    // Verify the webhook signature using raw body bytes
    if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Parse the JSON body manually since we disabled the body parser
    const event: BTCPayWebhookEvent = JSON.parse(rawBody.toString('utf8'))

    // Log the webhook event for debugging
    console.log('BTCPay webhook received:', {
      type: event.type,
      invoiceId: event.invoiceId,
      storeId: event.storeId,
      timestamp: new Date(event.timestamp * 1000).toISOString(),
      metadata: event.metadata,
    })

    // Handle InvoicePaymentSettled event
    if (event.type === 'InvoicePaymentSettled') {
      const donorName =
        event.metadata?.buyerName ||
        event.metadata?.posData?.buyerName ||
        'Anonymous'
      const donorEmail =
        event.metadata?.buyerEmail ||
        event.metadata?.posData?.buyerEmail ||
        'No email provided'
      const fundName =
        event.metadata?.fund_name ||
        event.metadata?.posData?.fund_name ||
        'Unknown fund'
      const invoiceId = event.invoiceId

      // Extract payment amount from the webhook event
      const paymentAmount =
        event.payment?.amount || event.payment?.value || 'Unknown'
      const paymentCurrency = event.payment?.method === 'BTC' ? 'BTC' : 'BTC' // Default to BTC for BTCPay

      console.log('🎉 Invoice Payment Settled!')
      console.log('📧 Donor Email:', maskEmail(donorEmail))
      console.log('👤 Donor Name:', maskName(donorName))
      console.log('💰 Fund:', fundName)
      console.log('🆔 Invoice ID:', invoiceId)
      console.log('💸 Amount:', paymentAmount, paymentCurrency)
      console.log(
        '⏰ Timestamp:',
        new Date(event.timestamp * 1000).toISOString()
      )

      // Send donation receipt via SendGrid
      if (donorEmail && donorEmail !== 'No email provided') {
        console.log('📧 Sending donation receipt...')
        const receiptSent = await sendDonationReceipt(
          donorEmail,
          donorName,
          fundName,
          invoiceId,
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
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      eventType: event.type,
    })
  } catch (error) {
    console.error('Error processing BTCPay webhook:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
