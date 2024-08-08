import { Stripe } from 'stripe'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import dayjs from 'dayjs'

import { protectedProcedure, publicProcedure, router } from '../trpc'
import { CURRENCY, MAX_AMOUNT, MEMBERSHIP_PRICE, MIN_AMOUNT } from '../../config'
import { env } from '../../env.mjs'
import { btcpayApi, keycloak, prisma, stripe } from '../services'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { DonationMetadata } from '../types'

export const donationRouter = router({
  donateWithFiat: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).nullable(),
        email: z.string().email().nullable(),
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        amount: z.number().min(MIN_AMOUNT).max(MAX_AMOUNT),
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
        name = user?.attributes?.name?.[0]
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
        membershipExpiresAt: null,
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
        amount: z.number().min(MIN_AMOUNT).max(MAX_AMOUNT),
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
        name = user?.attributes?.name?.[0] || null
      }

      const metadata: DonationMetadata = {
        userId,
        donorName: name,
        donorEmail: email,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        membershipExpiresAt: null,
      }

      const response = await btcpayApi.post(`/stores/${env.BTCPAY_STORE_ID}/invoices`, {
        amount: input.amount,
        currency: CURRENCY,
        metadata,
        checkout: { redirectURL: `${env.APP_URL}/thankyou` },
      })

      await prisma.donation.create({
        data: {
          userId: metadata.userId as string,
          btcPayInvoiceId: response.data.id,
          crypto: 'XMR',
          projectName: metadata.projectName,
          projectSlug: metadata.projectSlug,
          fund: 'Monero Fund',
          fiatAmount: input.amount,
          status: 'Waiting',
        },
      })

      return { url: response.data.checkoutLink }
    }),

  payMembershipWithFiat: protectedProcedure
    .input(
      z.object({
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        recurring: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      await authenticateKeycloakClient()
      const user = await keycloak.users.findOne({ id: userId })
      const email = user?.email!
      const name = user?.attributes?.name?.[0]!
      let stripeCustomerId = user?.attributes?.stripeCustomerId?.[0] || null

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email, name })

        stripeCustomerId = customer.id

        await keycloak.users.update(
          { id: userId },
          { email: email, attributes: { stripeCustomerId } }
        )
      }

      const metadata: DonationMetadata = {
        userId,
        donorName: name,
        donorEmail: email,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        membershipExpiresAt: dayjs().add(1, 'year').toISOString(),
      }

      const purchaseParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        submit_type: 'donate',
        customer: stripeCustomerId || undefined,
        currency: CURRENCY,
        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: `MAGIC Grants Annual Membership: ${input.projectName}`,
              },
              unit_amount: MEMBERSHIP_PRICE * 100,
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url: `${env.APP_URL}/thankyou`,
        cancel_url: `${env.APP_URL}/`,
        payment_intent_data: { metadata },
      }

      const subscriptionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        customer: stripeCustomerId || undefined,
        currency: CURRENCY,
        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: `MAGIC Grants Annual Membership: ${input.projectName}`,
              },
              recurring: { interval: 'year' },
              unit_amount: MEMBERSHIP_PRICE * 100,
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url: `${env.APP_URL}/thankyou`,
        cancel_url: `${env.APP_URL}/`,
        subscription_data: { metadata },
      }

      const checkoutSession = await stripe.checkout.sessions.create(
        input.recurring ? subscriptionParams : purchaseParams
      )

      return { url: checkoutSession.url }
    }),

  payMembershipWithCrypto: protectedProcedure
    .input(
      z.object({
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      const userHasMembership = await prisma.donation.findFirst({
        where: {
          userId,
          projectSlug: input.projectSlug,
          membershipExpiresAt: { gt: new Date() },
        },
      })

      if (userHasMembership) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'USER_HAS_ACTIVE_MEMBERSHIP',
        })
      }

      await authenticateKeycloakClient()
      const user = await keycloak.users.findOne({ id: userId })
      const email = user?.email!
      const name = user?.attributes?.name?.[0]!

      const metadata: DonationMetadata = {
        userId,
        donorName: name,
        donorEmail: email,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        membershipExpiresAt: dayjs().add(1, 'year').toISOString(),
      }

      const response = await btcpayApi.post(`/stores/${env.BTCPAY_STORE_ID}/invoices`, {
        amount: MEMBERSHIP_PRICE,
        currency: CURRENCY,
        metadata,
        checkout: { redirectURL: `${env.APP_URL}/thankyou` },
      })

      await prisma.donation.create({
        data: {
          userId,
          btcPayInvoiceId: response.data.id,
          crypto: 'XMR',
          projectName: metadata.projectName,
          projectSlug: metadata.projectSlug,
          fund: 'Monero Fund',
          fiatAmount: MEMBERSHIP_PRICE,
          membershipExpiresAt: metadata.membershipExpiresAt,
          status: 'Waiting',
        },
      })

      return { url: response.data.checkoutLink }
    }),

  donationList: protectedProcedure.query(async ({ ctx }) => {
    await authenticateKeycloakClient()
    const userId = ctx.session.user.sub
    const user = await keycloak.users.findOne({ id: userId })

    // Get all user's donations that are not expired OR are expired AND are less than 1 month old
    const donations = await prisma.donation.findMany({
      where: {
        userId,
        OR: [
          { status: { not: 'Expired' } },
          {
            status: 'Expired',
            createdAt: { gt: dayjs().subtract(1, 'month').toDate() },
          },
        ],
      },
    })

    return donations
  }),
})
