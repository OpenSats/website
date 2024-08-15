import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import getRawBody from 'raw-body'
import dayjs from 'dayjs'
import crypto from 'crypto'

import { btcpayApi as _btcpayApi, prisma, stripe } from '../../server/services'
import { DonationMetadata } from '../../server/types'
import { btcpayStoreIdToFundSlug } from '../../utils/funds'

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

type BtcpayBody = {
  deliveryId: string
  webhookId: string
  originalDeliveryId: string
  isRedelivery: boolean
  type: string
  timestamp: number
  storeId: string
  invoiceId: string
  metadata: DonationMetadata
}

type BtcpayPaymentMethodsResponse = {
  rate: string
  amount: string
  cryptoCode: string
}[]

export function getBtcpayWebhookHandler(secret: string) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      return
    }

    if (typeof req.headers['btcpay-sig'] !== 'string') {
      res.status(400).json({ success: false })
      return
    }

    const rawBody = await getRawBody(req)
    const body: BtcpayBody = JSON.parse(Buffer.from(rawBody).toString('utf8'))
    const fundSlug = btcpayStoreIdToFundSlug[body.storeId]

    const expectedSigHash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    const incomingSigHash = (req.headers['btcpay-sig'] as string).split('=')[1]

    if (expectedSigHash !== incomingSigHash) {
      console.error('Invalid signature')
      res.status(400).json({ success: false })
      return
    }

    if (body.type === 'InvoiceSettled') {
      const btcpayApi = _btcpayApi[fundSlug]

      const { data: paymentMethods } = await btcpayApi.get<BtcpayPaymentMethodsResponse>(
        `/invoices/${body.invoiceId}/payment-methods`
      )

      const cryptoAmount = Number(paymentMethods[0].amount)
      const fiatAmount = Number(paymentMethods[0].amount) * Number(paymentMethods[0].rate)

      await prisma.donation.create({
        data: {
          userId: body.metadata.userId,
          btcPayInvoiceId: body.invoiceId,
          projectName: body.metadata.projectName,
          projectSlug: body.metadata.projectSlug,
          fundSlug: body.metadata.fundSlug,
          cryptoCode: paymentMethods[0].cryptoCode,
          cryptoAmount,
          fiatAmount: Number(fiatAmount.toFixed(2)),
          membershipExpiresAt:
            body.metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
        },
      })
    }

    res.status(200).json({ success: true })
  }
}
