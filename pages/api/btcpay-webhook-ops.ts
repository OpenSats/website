import { NextApiRequest, NextApiResponse } from 'next/types'
import {
  getRawBody,
  verifyWebhookSignature,
  processBTCPayWebhook,
  BTCPayWebhookEvent,
} from '../../utils/btcpay-webhook-helpers'

// Configure Next.js to parse the body as raw bytes for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// BTCPay Server webhook secret for Operations Budget
const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET_OPS

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
      '📨 BTCPay Operations Budget webhook received with signature:',
      signature ? 'present' : 'missing'
    )

    if (!signature) {
      console.error('Missing BTCPay signature header')
      return res.status(400).json({ error: 'Missing signature' })
    }

    if (!WEBHOOK_SECRET) {
      console.error('BTCPay Operations Budget webhook secret not configured')
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
    console.log('BTCPay Operations Budget webhook received:', {
      type: event.type,
      invoiceId: event.invoiceId,
      storeId: event.storeId,
      timestamp: new Date(event.timestamp * 1000).toISOString(),
      metadata: event.metadata,
    })

    // Process the webhook event
    await processBTCPayWebhook(event, 'Operations Budget')

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Operations Budget webhook processed successfully',
      eventType: event.type,
    })
  } catch (error) {
    console.error('Error processing BTCPay Operations Budget webhook:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
