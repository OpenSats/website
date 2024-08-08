import Stripe from 'stripe'
import getRawBody from 'raw-body'
import { NextApiRequest, NextApiResponse } from 'next'
import { env } from '../../../env.mjs'
import { prisma, stripe } from '../../../server/services'
import { DonationMetadata } from '../../../server/types'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let event: Stripe.Event

  // Get the signature sent by Stripe
  const signature = req.headers['stripe-signature']

  try {
    event = stripe.webhooks.constructEvent(
      await getRawBody(req),
      signature!,
      env.STRIPE_WEBHOOK_SIGNING_SECRET
    )
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, (err as any).message)
    res.status(400).end()
    return
  }

  console.log(event.type)

  // Marks donation as complete when payment intent is succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object

    await prisma.donation.updateMany({
      where: { stripeInvoiceId: paymentIntent.id },
      data: { status: 'Complete' },
    })
  }

  // Marks donation as invalid when payment intent is canceled
  if (event.type === 'payment_intent.canceled') {
    const paymentIntent = event.data.object

    await prisma.donation.updateMany({
      where: { stripeInvoiceId: paymentIntent.id },
      data: { status: 'Invalid' },
    })
  }

  // Marks donation as invalid when payment intent is failed
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object

    await prisma.donation.updateMany({
      where: { stripeInvoiceId: paymentIntent.id },
      data: { status: 'Invalid' },
    })
  }

  // Create subscription when subscription is created
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object
    const metadata = subscription.metadata as DonationMetadata

    await prisma.donation.create({
      data: {
        userId: metadata.userId as string,
        stripeInvoiceId: subscription.id,
        projectName: metadata.projectName,
        projectSlug: metadata.projectSlug,
        fund: 'Monero Fund',
        currency: 'USD',
        fiatAmount: 100,
        status: 'Complete',
        membershipExpiresAt: new Date(subscription.current_period_end * 1000),
      },
    })
  }

  // Update subscription expiration date when subscription is updated
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object

    await prisma.donation.updateMany({
      where: { stripeInvoiceId: subscription.id },
      data: { membershipExpiresAt: new Date(subscription.current_period_end * 1000) },
    })
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).end()
}
