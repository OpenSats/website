import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import getRawBody from 'raw-body'
import dayjs from 'dayjs'
import crypto from 'crypto'

import { btcpayApi as _btcpayApi, prisma, stripe } from '../../server/services'
import { DonationMetadata } from '../../server/types'

export function getStripeWebhookHandler(secret: string) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let event: Stripe.Event

    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature']

    try {
      event = stripe.monero.webhooks.constructEvent(await getRawBody(req), signature!, secret)
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, (err as any).message)
      res.status(400).end()
      return
    }

    // Store donation data when payment intent is valid
    // Subscriptions are handled on the invoice.paid event instead
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const metadata = paymentIntent.metadata as DonationMetadata

      // Skip this event if intent is still not fully paid
      if (paymentIntent.amount_received !== paymentIntent.amount) return

      // Payment intents for subscriptions will not have metadata
      if (metadata.isSubscription === 'false')
        await prisma.donation.create({
          data: {
            userId: metadata.userId,
            stripePaymentIntentId: paymentIntent.id,
            projectName: metadata.projectName,
            projectSlug: metadata.projectSlug,
            fundSlug: metadata.fundSlug,
            fiatAmount: paymentIntent.amount_received / 100,
            membershipExpiresAt:
              metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
          },
        })
    }

    // Store subscription data when subscription invoice is paid
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object

      if (invoice.subscription) {
        const metadata = event.data.object.subscription_details?.metadata as DonationMetadata
        const invoiceLine = invoice.lines.data.find((line) => line.invoice === invoice.id)

        if (!invoiceLine) return

        await prisma.donation.create({
          data: {
            userId: metadata.userId as string,
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId: invoice.subscription.toString(),
            projectName: metadata.projectName,
            projectSlug: metadata.projectSlug,
            fundSlug: metadata.fundSlug,
            fiatAmount: invoice.total / 100,
            membershipExpiresAt: new Date(invoiceLine.period.end * 1000),
          },
        })
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).end()
  }
}
