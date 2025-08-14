import { NextApiRequest, NextApiResponse } from 'next/types'
import crypto from 'crypto'

// Configure Next.js to parse the body as raw bytes for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// BTCPay Server webhook secret from environment variables
const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET

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
    console.log('🔍 Signature verification:', signatureHash === expectedSignature ? '✅ valid' : '❌ invalid')

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
    console.log('📨 BTCPay webhook received with signature:', signature ? 'present' : 'missing')

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

      console.log('🎉 Invoice Payment Settled!')
      console.log('📧 Donor Email:', donorEmail)
      console.log('👤 Donor Name:', donorName)
      console.log('💰 Fund:', fundName)
      console.log('🆔 Invoice ID:', invoiceId)
      console.log(
        '⏰ Timestamp:',
        new Date(event.timestamp * 1000).toISOString()
      )

      // TODO: Implement SendGrid email functionality here
      // This is where you'll add the logic to send receipts via SendGrid
      // using the dynamic templates you mentioned
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
