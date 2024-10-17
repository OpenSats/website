import { NextApiRequest, NextApiResponse } from 'next'
import { FundSlug } from '@prisma/client'
import Stripe from 'stripe'
import getRawBody from 'raw-body'
import dayjs from 'dayjs'

import { btcpayApi as _btcpayApi, prisma, stripe as _stripe } from '../../server/services'
import { DonationMetadata } from '../../server/types'
import { sendDonationConfirmationEmail } from './mailing'

export function getStripeWebhookHandler(fundSlug: FundSlug, secret: string) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let event: Stripe.Event

    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature']

    try {
      const stripe = _stripe[fundSlug]
      event = stripe.webhooks.constructEvent(await getRawBody(req), signature!, secret)
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
            netFiatAmount: paymentIntent.amount_received / 100,
            grossFiatAmount: paymentIntent.amount_received / 100,
            membershipExpiresAt:
              metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
          },
        })

      if (metadata.donorEmail && metadata.donorName) {
        sendDonationConfirmationEmail({
          to: metadata.donorEmail,
          donorName: metadata.donorName,
          fundSlug: metadata.fundSlug,
          projectName: metadata.projectName,
          isMembership: metadata.isMembership === 'true',
          isSubscription: metadata.isSubscription === 'true',
          stripeUsdAmount: paymentIntent.amount_received / 100,
          pointsReceived: 0,
        })
      }
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
            netFiatAmount: invoice.total / 100,
            grossFiatAmount: invoice.total / 100,
            membershipExpiresAt: new Date(invoiceLine.period.end * 1000),
          },
        })

        if (metadata.donorEmail && metadata.donorName) {
          sendDonationConfirmationEmail({
            to: metadata.donorEmail,
            donorName: metadata.donorName,
            fundSlug: metadata.fundSlug,
            projectName: metadata.projectName,
            isMembership: metadata.isMembership === 'true',
            isSubscription: metadata.isSubscription === 'true',
            stripeUsdAmount: invoice.total / 100,
            pointsReceived: 0,
          })
        }
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).end()
  }
}
