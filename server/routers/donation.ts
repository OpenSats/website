import { Stripe } from 'stripe'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import { CURRENCY, MIN_AMOUNT } from '../../config'
import { env } from '../../env.mjs'
import { keycloak } from '../services'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { Donation, DonationMetadata } from '../types'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2024-04-10',
})

export const donationRouter = router({
  donateWithFiat: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        amount: z.number().min(MIN_AMOUNT),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await authenticateKeycloakClient()

      const userSub = ctx.session?.user.sub
      let email = input.email!
      let name = input.name!
      let stripeCustomerId: string | null = null

      if (userSub) {
        const user = await keycloak.users.findOne({ id: userSub })!
        email = user?.email!
        name = (user?.firstName || '') + ' ' + (user?.lastName || '')
        stripeCustomerId = user?.attributes?.stripeCustomerId?.[0] || null
      }

      if (!stripeCustomerId && userSub) {
        const customer = await stripe.customers.create({
          email: input.email,
          name: input.name,
        })

        stripeCustomerId = customer.id

        await keycloak.users.update(
          { id: userSub },
          { email: email, attributes: { stripeCustomerId } }
        )
      }

      const metadata: DonationMetadata = {
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

  donationList: protectedProcedure.query(async ({ ctx }) => {
    await authenticateKeycloakClient()
    const user = await keycloak.users.findOne({ id: ctx.session.user.sub })
    let stripeCustomerId = user?.attributes?.stripeCustomerId?.[0]

    const donations: Donation[] = []

    if (!stripeCustomerId) {
      return donations
    }

    // TODO: Paginate?
    const payments = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
    })

    payments.data
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

    return donations
  }),
})
