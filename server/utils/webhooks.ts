import { NextApiRequest, NextApiResponse } from 'next'
import { FundSlug } from '@prisma/client'
import Stripe from 'stripe'
import getRawBody from 'raw-body'
import dayjs from 'dayjs'

import {
  btcpayApi as _btcpayApi,
  prisma,
  stripe as _stripe,
  strapiApi,
  keycloak,
  privacyGuidesDiscourseApi,
} from '../../server/services'
import { DonationMetadata, StrapiCreatePointBody } from '../../server/types'
import { sendDonationConfirmationEmail } from './mailing'
import { getUserPointBalance } from './perks'
import { POINTS_PER_USD } from '../../config'
import { authenticateKeycloakClient } from './keycloak'
import { env } from '../../env.mjs'

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

      // Payment intents for subscriptions will not have metadata
      if (!metadata) return res.status(200).end()
      if (JSON.stringify(metadata) === '{}') return res.status(200).end()
      if (metadata.isSubscription === 'true') return res.status(200).end()

      // Skip this event if intent is still not fully paid
      if (paymentIntent.amount_received !== paymentIntent.amount) return res.status(200).end()

      const shouldGivePointsBack = metadata.givePointsBack === 'true'
      const grossFiatAmount = paymentIntent.amount_received / 100
      const netFiatAmount = shouldGivePointsBack
        ? Number((grossFiatAmount * 0.9).toFixed(2))
        : grossFiatAmount
      const pointsAdded = shouldGivePointsBack ? Math.floor(grossFiatAmount / POINTS_PER_USD) : 0

      // Add PG forum user to membership group
      if (metadata.isMembership && metadata.fundSlug === 'privacyguides' && metadata.userId) {
        const accountConnection = await prisma.accountConnection.findFirst({
          where: { type: 'privacyGuidesForum', userId: metadata.userId },
        })

        if (
          !accountConnection?.privacyGuidesAccountIsInMemberGroup &&
          accountConnection?.externalId
        ) {
          await privacyGuidesDiscourseApi.put(
            `/groups/${env.PRIVACYGUIDES_DISCOURSE_MEMBERSHIP_GROUP_ID}/members.json`,
            { usernames: accountConnection.externalId }
          )
        }
      }

      const donation = await prisma.donation.create({
        data: {
          userId: metadata.userId,
          stripePaymentIntentId: paymentIntent.id,
          projectName: metadata.projectName,
          projectSlug: metadata.projectSlug,
          fundSlug: metadata.fundSlug,
          grossFiatAmount,
          netFiatAmount,
          pointsAdded,
          membershipExpiresAt:
            metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
          showDonorNameOnLeaderboard: metadata.showDonorNameOnLeaderboard === 'true',
          donorName: metadata.donorName,
        },
      })

      // // Add points
      if (shouldGivePointsBack && metadata.userId) {
        // Get balance for project/fund by finding user's last point history
        const currentBalance = await getUserPointBalance(metadata.userId)

        await strapiApi.post<any, any, StrapiCreatePointBody>('/points', {
          data: {
            balanceChange: pointsAdded.toString(),
            balance: (currentBalance + pointsAdded).toString(),
            userId: metadata.userId,
            donationId: donation.id,
            donationProjectName: donation.projectName,
            donationProjectSlug: donation.projectSlug,
            donationFundSlug: donation.fundSlug,
          },
        })
      }

      if (metadata.donorEmail && metadata.donorName) {
        sendDonationConfirmationEmail({
          to: metadata.donorEmail,
          donorName: metadata.donorName,
          fundSlug: metadata.fundSlug,
          projectName: metadata.projectName,
          isMembership: metadata.isMembership === 'true',
          isSubscription: false,
          stripeUsdAmount: paymentIntent.amount_received / 100,
          pointsReceived: pointsAdded,
        })
      }
    }

    // Store subscription data when subscription invoice is paid
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object

      if (!invoice.subscription) return res.status(200).end()

      const metadata = event.data.object.subscription_details?.metadata as DonationMetadata
      const invoiceLine = invoice.lines.data.find((line) => line.invoice === invoice.id)

      if (!invoiceLine) {
        console.error(
          `[/api/stripe/${metadata.fundSlug}-webhook] Line not fund for invoice ${invoice.id}`
        )
        return res.status(200).end()
      }

      const shouldGivePointsBack = metadata.givePointsBack === 'true'
      const grossFiatAmount = invoice.total / 100
      const netFiatAmount = shouldGivePointsBack
        ? Number((grossFiatAmount * 0.9).toFixed(2))
        : grossFiatAmount
      const pointsAdded = shouldGivePointsBack ? parseInt(String(grossFiatAmount * 100)) : 0

      // Add PG forum user to membership group
      if (metadata.isMembership && metadata.fundSlug === 'privacyguides' && metadata.userId) {
        const accountConnection = await prisma.accountConnection.findFirst({
          where: { type: 'privacyGuidesForum', userId: metadata.userId },
        })

        if (
          !accountConnection?.privacyGuidesAccountIsInMemberGroup &&
          accountConnection?.externalId
        ) {
          await privacyGuidesDiscourseApi.put(
            `/groups/${env.PRIVACYGUIDES_DISCOURSE_MEMBERSHIP_GROUP_ID}/members.json`,
            { usernames: accountConnection.externalId }
          )
        }
      }

      const donation = await prisma.donation.create({
        data: {
          userId: metadata.userId as string,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription.toString(),
          projectName: metadata.projectName,
          projectSlug: metadata.projectSlug,
          fundSlug: metadata.fundSlug,
          grossFiatAmount,
          netFiatAmount,
          pointsAdded,
          membershipExpiresAt: new Date(invoiceLine.period.end * 1000),
          showDonorNameOnLeaderboard: metadata.showDonorNameOnLeaderboard === 'true',
          donorName: metadata.donorName,
        },
      })

      // Add points
      if (shouldGivePointsBack && metadata.userId) {
        // Get balance for project/fund by finding user's last point history
        const currentBalance = await getUserPointBalance(metadata.userId)

        await strapiApi.post('/points', {
          data: {
            balanceChange: pointsAdded,
            pointsBalance: currentBalance + pointsAdded,
            userId: metadata.userId,
            donationId: donation.id,
            donationProjectName: donation.projectName,
            donationProjectSlug: donation.projectSlug,
            donationFundSlug: donation.fundSlug,
          },
        })
      }

      if (metadata.donorEmail && metadata.donorName) {
        sendDonationConfirmationEmail({
          to: metadata.donorEmail,
          donorName: metadata.donorName,
          fundSlug: metadata.fundSlug,
          projectName: metadata.projectName,
          isMembership: metadata.isMembership === 'true',
          isSubscription: metadata.isSubscription === 'true',
          stripeUsdAmount: invoice.total / 100,
          pointsReceived: pointsAdded,
        })
      }
    }

    // Handle subscription end
    if (event.type === 'customer.subscription.deleted') {
      console.log(event.data.object)
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).end()
  }
}
