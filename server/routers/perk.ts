import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import { fundSlugs } from '../../utils/funds'
import { prisma, strapiApi } from '../services'
import { StrapiCreateOrderRes, StrapiGetPerkRes, StrapiGetPerksRes, StrapiPerk } from '../types'
import { TRPCError } from '@trpc/server'
import { getUserPointBalance } from '../utils/perks'

export const perkRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.sub
    const balance = getUserPointBalance(userId)
    return balance
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.sub

    const pointHistory = await prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { donation: true },
    })

    return pointHistory
  }),

  getFundPerks: publicProcedure
    .input(z.object({ fundSlug: z.enum(fundSlugs) }))
    .query(async ({ input }) => {
      const {
        data: { data: perks },
      } = await strapiApi.get<StrapiGetPerksRes>('/perks?populate[images][fields]=formats')

      // Filter out whitelisted perks
      const perksFiltered: StrapiPerk[] = perks.filter((perk) =>
        perk.fundSlugWhitelist ? perk.fundSlugWhitelist.split(',').includes(input.fundSlug) : true
      )

      return perksFiltered
    }),

  purchasePerk: protectedProcedure
    .input(
      z.object({
        perkId: z.string(),
        fundSlug: z.enum(fundSlugs),
        shippingAddressLine1: z.string().optional(),
        shippingAddressLine2: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingCountry: z.string().optional(),
        shippingZip: z.string().optional(),
        shippingPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.sub

      const {
        data: { data: perk },
      } = await strapiApi.get<StrapiGetPerkRes>(`/perks/${input.perkId}`)

      if (!perk) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Perk not found.' })

      // Check if shipping data is present if required
      console.log(perk.needsShippingAddress)
      if (perk.needsShippingAddress) {
        const shippingDataIsMissing =
          [
            input.shippingAddressLine1,
            input.shippingCity,
            input.shippingState,
            input.shippingCountry,
            input.shippingZip,
            input.shippingPhone,
          ].filter((data) => !data).length > 0

        if (shippingDataIsMissing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Shipping data is missing.' })
        }
      }

      // Check if perk is available in the fund
      if (perk.fundSlugWhitelist && !perk.fundSlugWhitelist.split(',').includes(input.fundSlug)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Perk not available in this fund.' })
      }

      // Check user's balance
      const currentBalance = await getUserPointBalance(userId)
      const balanceAfterPurchase = currentBalance - perk.price

      if (balanceAfterPurchase < 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient balance.' })
      }

      // Place order
      const {
        data: { data: order },
      } = await strapiApi.post<StrapiCreateOrderRes>('/orders', {
        data: {
          perk: perk.documentId,
          userId,
          userEmail: ctx.session.user.email,
          shippingAddressLine1: input.shippingAddressLine1,
          shippingAddressLine2: input.shippingAddressLine2,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingCountry: input.shippingCountry,
          shippingZip: input.shippingZip,
          shippingPhone: input.shippingPhone,
        },
      })

      try {
        // Deduct points
        await prisma.pointHistory.create({
          data: {
            userId,
            purchaseOrderId: order.documentId,
            pointsDeducted: perk.price,
            pointsBalance: balanceAfterPurchase,
            purchasePerkId: perk.documentId,
            purchasePerkName: perk.name,
          },
        })
      } catch (error) {
        // If it fails, delete order
        await strapiApi.delete(`/orders/${order.documentId}`)
        throw error
      }
    }),
})
