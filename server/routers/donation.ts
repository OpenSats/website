import { Stripe } from 'stripe'
import { TRPCError } from '@trpc/server'
import { Donation } from '@prisma/client'
import { z } from 'zod'

import { protectedProcedure, publicProcedure, router } from '../trpc'
import { CURRENCY, MAX_AMOUNT, MEMBERSHIP_PRICE, MIN_AMOUNT } from '../../config'
import { env } from '../../env.mjs'
import { btcpayApi as _btcpayApi, keycloak, prisma, stripe as _stripe } from '../services'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { DonationMetadata } from '../types'
import { fundSlugs } from '../../utils/funds'
import { fundSlugToCustomerIdAttr } from '../utils/funds'

export const donationRouter = router({
  donateWithFiat: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).nullable(),
        email: z.string().email().nullable(),
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        fundSlug: z.enum(fundSlugs),
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
        stripeCustomerId = user?.attributes?.[fundSlugToCustomerIdAttr[input.fundSlug]]?.[0] || null
      }

      const stripe = _stripe[input.fundSlug]

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
        fundSlug: input.fundSlug,
        isMembership: 'false',
        isSubscription: 'false',
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
        success_url: `${env.APP_URL}/${input.fundSlug}/thankyou`,
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
        fundSlug: z.enum(fundSlugs),
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
        fundSlug: input.fundSlug,
        isMembership: 'false',
        isSubscription: 'false',
      }

      const btcpayApi = _btcpayApi[input.fundSlug]

      const response = await btcpayApi.post(`/invoices`, {
        amount: input.amount,
        currency: CURRENCY,
        metadata,
        checkout: { redirectURL: `${env.APP_URL}/${input.fundSlug}/thankyou` },
      })

      return { url: response.data.checkoutLink }
    }),

  payMembershipWithFiat: protectedProcedure
    .input(
      z.object({
        projectName: z.string().min(1),
        projectSlug: z.string().min(1),
        fundSlug: z.enum(fundSlugs),
        recurring: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const stripe = _stripe[input.fundSlug]
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
      let stripeCustomerId =
        user?.attributes?.[fundSlugToCustomerIdAttr[input.fundSlug]]?.[0] || null

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
        fundSlug: input.fundSlug,
        isMembership: 'true',
        isSubscription: input.recurring ? 'true' : 'false',
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
        success_url: `${env.APP_URL}/${input.fundSlug}/thankyou`,
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
        success_url: `${env.APP_URL}/${input.fundSlug}/thankyou`,
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
        fundSlug: z.enum(fundSlugs),
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
        fundSlug: input.fundSlug,
        isMembership: 'true',
        isSubscription: 'false',
      }

      const btcpayApi = _btcpayApi[input.fundSlug]

      const response = await btcpayApi.post(`/invoices`, {
        amount: MEMBERSHIP_PRICE,
        currency: CURRENCY,
        metadata,
        checkout: { redirectURL: `${env.APP_URL}/${input.fundSlug}/thankyou` },
      })

      return { url: response.data.checkoutLink }
    }),

  donationList: protectedProcedure
    .input(z.object({ fundSlug: z.enum(fundSlugs) }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      const donations = await prisma.donation.findMany({
        where: {
          userId,
          membershipExpiresAt: null,
          fundSlug: input.fundSlug,
        },
        orderBy: { createdAt: 'desc' },
      })

      return donations
    }),

  membershipList: protectedProcedure
    .input(z.object({ fundSlug: z.enum(fundSlugs) }))
    .query(async ({ input, ctx }) => {
      const stripe = _stripe[input.fundSlug]
      await authenticateKeycloakClient()
      const userId = ctx.session.user.sub
      const user = await keycloak.users.findOne({ id: userId })
      const stripeCustomerId = user?.attributes?.[fundSlugToCustomerIdAttr[input.fundSlug]]?.[0]
      let billingPortalUrl: string | null = null

      if (stripeCustomerId) {
        const billingPortalSession = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${env.APP_URL}/${input.fundSlug}/account/my-memberships`,
        })

        billingPortalUrl = billingPortalSession.url
      }

      const memberships = await prisma.donation.findMany({
        where: {
          userId,
          membershipExpiresAt: { not: null },
          fundSlug: input.fundSlug,
        },
        orderBy: { createdAt: 'desc' },
      })

      const subscriptionIds = new Set<string>()
      const membershipsUniqueSubsId: Donation[] = []

      memberships.forEach((membership) => {
        if (!membership.stripeSubscriptionId) {
          membershipsUniqueSubsId.push(membership)
          return
        }

        if (subscriptionIds.has(membership.stripeSubscriptionId)) {
          return
        }

        membershipsUniqueSubsId.push(membership)
        subscriptionIds.add(membership.stripeSubscriptionId)
      })

      return { memberships: membershipsUniqueSubsId, billingPortalUrl }
    }),

  userHasMembership: protectedProcedure
    .input(z.object({ projectSlug: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      const membership = await prisma.donation.findFirst({
        where: { projectSlug: input.projectSlug, membershipExpiresAt: { gt: new Date() } },
      })

      return !!membership
    }),
})
