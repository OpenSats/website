import { NextApiRequest } from 'next/types'
import * as crypto from 'crypto'
import * as sgMail from '@sendgrid/mail'

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_ADDRESS = process.env.SENDGRID_VERIFIED_SENDER
const RECEIPT_TEMPLATE_ID = 'd-7373b3667bea4b2eb1632319e90e1a92'

// Initialize SendGrid with API key
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

// BTCPay Server webhook event types
export interface BTCPayWebhookEvent {
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
  
  return name.split(' ').map(word => word.charAt(0) + '***').join(' ')
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
      `📧 Receipt sent successfully to ${maskEmail(donorEmail)} in ${duration}ms`
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
 * Verify BTCPay Server webhook signature
 */
export function verifyWebhookSignature(
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

/**
 * Process BTCPay webhook event and send donation receipt
 */
export async function processBTCPayWebhook(
  event: BTCPayWebhookEvent,
  fundName: string
): Promise<void> {
  if (event.type === 'InvoicePaymentSettled') {
    const donorName =
      event.metadata?.buyerName ||
      event.metadata?.posData?.buyerName ||
      'Anonymous'
    const donorEmail =
      event.metadata?.buyerEmail ||
      event.metadata?.posData?.buyerEmail ||
      'No email provided'
    const fundDisplayName =
      event.metadata?.fund_name ||
      event.metadata?.posData?.fund_name ||
      fundName
    const invoiceId = event.invoiceId

    // Extract payment amount from the webhook event
    const paymentAmount =
      event.payment?.amount || event.payment?.value || 'Unknown'
    const paymentCurrency = event.payment?.method === 'BTC' ? 'BTC' : 'BTC' // Default to BTC for BTCPay

    console.log(`🎉 ${fundName} Invoice Payment Settled!`)
    console.log('📧 Donor Email:', maskEmail(donorEmail))
    console.log('👤 Donor Name:', maskName(donorName))
    console.log('💰 Fund:', fundDisplayName)
    console.log('🆔 Invoice ID:', invoiceId)
    console.log('💸 Amount:', paymentAmount, paymentCurrency)
    console.log('⏰ Timestamp:', new Date(event.timestamp * 1000).toISOString())

    // Send donation receipt via SendGrid
    if (donorEmail && donorEmail !== 'No email provided') {
      console.log('📧 Sending donation receipt...')
      const receiptSent = await sendDonationReceipt(
        donorEmail,
        donorName,
        fundDisplayName,
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
}
