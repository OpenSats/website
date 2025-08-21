import { NextApiRequest, NextApiResponse } from 'next/types'
import {
  getRawBody,
  verifyStripeWebhookSignature,
  processStripeWebhook,
} from '../../utils/stripe-webhook-helpers'

// Configure Next.js to parse the body as raw bytes for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// Stripe webhook secret from environment variables
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

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
    const signature = req.headers['stripe-signature'] as string

    // Log basic webhook info for monitoring
    console.log(
      '📨 Stripe webhook received with signature:',
      signature ? 'present' : 'missing'
    )

    if (!signature) {
      console.error('Missing Stripe signature header')
      return res.status(400).json({ error: 'Missing signature' })
    }

    if (!WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not configured')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    // Verify the webhook signature using Stripe's verification method
    let event
    try {
      event = verifyStripeWebhookSignature(rawBody, signature, WEBHOOK_SECRET)
    } catch (error) {
      console.error('Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // Log the webhook event for debugging
    console.log('Stripe webhook received:', {
      type: event.type,
      id: event.id,
      timestamp: new Date(event.created * 1000).toISOString(),
    })

    // Process the webhook event
    await processStripeWebhook(event)

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Stripe webhook processed successfully',
      eventType: event.type,
    })
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
