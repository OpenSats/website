import { Stripe } from 'stripe'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import { CURRENCY, MIN_AMOUNT } from '../../config'
import { env } from '../../env.mjs'
import { btcpayApi, keycloak, prisma } from '../services'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { Donation, DonationMetadata } from '../types'
import { createInvoice } from '../utils/btcpay'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2024-04-10',
})

export const donationRouter = router({
  donateWithFiat: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).nullable(),
        email: z.string().email().nullable(),
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        amount: z.number().min(MIN_AMOUNT),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.sub || null
      let email = input.email
      let name = input.name
      let stripeCustomerId: string | null = null

      if (userId) {
        await authenticateKeycloakClient()
        const user = await keycloak.users.findOne({ id: userId })!
        email = user?.email!
        name = (user?.firstName || '') + ' ' + (user?.lastName || '')
        stripeCustomerId = user?.attributes?.stripeCustomerId?.[0] || null
      }

      if (!stripeCustomerId && userId && email && name) {
        const customer = await stripe.customers.create({
          email,
          name,
        })

        stripeCustomerId = customer.id

        await keycloak.users.update(
          { id: userId },
          { email: email, attributes: { stripeCustomerId } }
        )
      }

      const metadata: DonationMetadata = {
        userId,
        donorEmail: email,
        donorName: name,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
      }

      const params: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        submit_type: 'donate',
        customer: stripeCustomerId || undefined,
        currency: CURRENCY,
        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: `MAGIC Grants donation: ${input.projectName}`,
              },
              unit_amount: input.amount * 100,
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url: `${env.APP_URL}/thankyou`,
        cancel_url: `${env.APP_URL}/`,
        // We need metadata in here for some reason
        payment_intent_data: { metadata },
      }

      const checkoutSession = await stripe.checkout.sessions.create(params)

      return { url: checkoutSession.url }
    }),

  donateWithCrypto: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).nullable(),
        email: z.string().trim().email().nullable(),
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        amount: z.number().min(MIN_AMOUNT),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let email = input.email
      let name = input.name
      const userId = ctx.session?.user.sub || null

      if (userId) {
        await authenticateKeycloakClient()
        const user = await keycloak.users.findOne({ id: userId })
        email = user?.email!
        name = (user?.firstName || '') + ' ' + (user?.lastName || '')
      }

      const metadata: DonationMetadata = {
        userId,
        donorName: name,
        donorEmail: email,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
      }

      const response = await btcpayApi.post(
        `/stores/${env.BTCPAY_STORE_ID}/invoices`,
        {
          amount: input.amount,
          currency: CURRENCY,
          metadata,
          checkout: { redirectURL: `${env.APP_URL}/thankyou` },
        }
      )

      return { url: response.data.checkoutLink }
    }),

  donationList: protectedProcedure.query(async ({ ctx }) => {
    await authenticateKeycloakClient()
    const user = await keycloak.users.findOne({ id: ctx.session.user.sub })
    let stripeCustomerId = user?.attributes?.stripeCustomerId?.[0]

    const donations: Donation[] = []

    if (!stripeCustomerId) {
      return donations
    }

    // TODO: Paginate?
    const stripePayments = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
    })

    stripePayments.data
      .filter((payment) => payment.status === 'succeeded')
      .forEach((payment) => {
        donations.push({
          projectName: payment.metadata.projectName,
          fundName: 'Monero Fund',
          type: 'one_time',
          method: 'fiat',
          amount: Number((payment.amount / 100).toFixed(2)),
          expiresAt: null,
          createdAt: new Date(payment.created * 1000),
        })
      })

    const cryptoDonations = await prisma.cryptoDonation.findMany({
      where: { userId: ctx.session.user.sub },
    })

    cryptoDonations.forEach((donation) => {
      donations.push({
        projectName: donation.projectName,
        fundName: donation.fund,
        type: 'one_time',
        method: 'crypto',
        amount: donation.fiatAmount,
        expiresAt: null,
        createdAt: donation.createdAt,
      })
    })

    const donationsSorted = donations.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return donationsSorted
  }),
})
