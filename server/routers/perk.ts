import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import { QueueEvents } from 'bullmq'
import { fundSlugs } from '../../utils/funds'
import { keycloak, printfulApi, prisma, strapiApi } from '../services'
import {
  PrintfulCreateOrderReq,
  PrintfulCreateOrderRes,
  PrintfulEstimateOrderReq,
  PrintfulEstimateOrderRes,
  PrintfulGetCountriesRes,
  PrintfulGetProductRes,
  StrapiCreateOrderBody,
  StrapiCreateOrderRes,
  StrapiCreatePointBody,
  StrapiGetPerkRes,
  StrapiGetPerksPopulatedRes,
  StrapiGetPointsPopulatedRes,
  StrapiPerk,
} from '../types'
import { TRPCError } from '@trpc/server'
import { estimatePrintfulOrderCost, getUserPointBalance } from '../utils/perks'
import { AxiosResponse } from 'axios'
import { POINTS_REDEEM_PRICE_USD } from '../../config'
import { authenticateKeycloakClient } from '../utils/keycloak'
import { perkPurchaseQueue } from '../queues'
import { redisConnection } from '../../config/redis'

export const perkRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.sub
    const balance = getUserPointBalance(userId)
    return balance
  }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.sub

    const { data: pointHistory } = await strapiApi.get<StrapiGetPointsPopulatedRes>(
      `/points?filters[userId][$eq]=${userId}&sort=createdAt:desc&populate=*`
    )

    return pointHistory.data
  }),

  getFundPerks: publicProcedure
    .input(z.object({ fundSlug: z.enum(fundSlugs) }))
    .query(async ({ input }) => {
      const {
        data: { data: perks },
      } = await strapiApi.get<StrapiGetPerksPopulatedRes>('/perks?populate[images][fields]=formats')

      // Filter out whitelisted perks
      const perksFiltered = perks.filter((perk) =>
        perk.fundSlugWhitelist ? perk.fundSlugWhitelist.split(',').includes(input.fundSlug) : true
      )

      return perksFiltered
    }),

  getPrintfulProductVariants: protectedProcedure
    .input(z.object({ printfulProductId: z.string().min(1) }))
    .query(async ({ input }) => {
      const {
        data: { result: printfulProduct },
      } = await printfulApi.get<PrintfulGetProductRes>(`/store/products/${input.printfulProductId}`)

      return printfulProduct.sync_variants
    }),

  getCountries: protectedProcedure.query(async () => {
    const {
      data: { result: countries },
    } = await printfulApi.get<PrintfulGetCountriesRes>('/countries')

    return countries
  }),

  estimatePrintfulOrderCosts: protectedProcedure
    .input(
      z.object({
        printfulSyncVariantId: z.number(),
        shippingAddressLine1: z.string().min(1),
        shippingAddressLine2: z.string(),
        shippingCity: z.string().min(1),
        shippingState: z.string(),
        shippingCountry: z.string().min(1),
        shippingZip: z.string().min(1),
        shippingPhone: z.string().min(1),
        shippingTaxNumber: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await authenticateKeycloakClient()

      const userId = ctx.session.user.sub
      const user = await keycloak.users.findOne({ id: userId })

      if (!user || !user.id || !user.email)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      const costEstimate = await estimatePrintfulOrderCost({
        address1: input.shippingAddressLine1!,
        address2: input.shippingAddressLine2 || '',
        city: input.shippingCity!,
        stateCode: input.shippingState!,
        countryCode: input.shippingCountry!,
        zip: input.shippingZip!,
        name: user.attributes?.name?.[0],
        phone: input.shippingPhone!,
        email: user.email,
        tax_number: input.shippingTaxNumber,
        printfulSyncVariantId: input.printfulSyncVariantId,
      })

      return {
        product: Math.ceil(costEstimate.costs.subtotal / POINTS_REDEEM_PRICE_USD),
        shipping: Math.ceil(costEstimate.costs.shipping / POINTS_REDEEM_PRICE_USD),
        tax: Math.ceil((costEstimate.costs.tax + costEstimate.costs.vat) / POINTS_REDEEM_PRICE_USD),
        total: Math.ceil(costEstimate.costs.total / POINTS_REDEEM_PRICE_USD),
      }
    }),

  purchasePerk: protectedProcedure
    .input(
      z.object({
        perkId: z.string(),
        perkPrintfulSyncVariantId: z.number().optional(),
        fundSlug: z.enum(fundSlugs),
        shippingAddressLine1: z.string().optional(),
        shippingAddressLine2: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingCountry: z.string().optional(),
        shippingZip: z.string().optional(),
        shippingPhone: z.string().optional(),
        shippingTaxNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await authenticateKeycloakClient()
      const userId = ctx.session.user.sub

      const user = await keycloak.users.findOne({ id: userId })

      if (!user || !user.id || !user.email)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
        })

      const {
        data: { data: perk },
      } = await strapiApi.get<StrapiGetPerkRes>(`/perks/${input.perkId}`)

      if (!perk) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Perk not found.' })

      // Check if shipping data is present if required
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

      // Check if user has enough balance
      let deductionAmount = 0

      if (perk.printfulProductId && input.perkPrintfulSyncVariantId) {
        const printfulCostEstimate = await estimatePrintfulOrderCost({
          address1: input.shippingAddressLine1!,
          address2: input.shippingAddressLine2 || '',
          city: input.shippingCity!,
          stateCode: input.shippingState!,
          countryCode: input.shippingCountry!,
          zip: input.shippingZip!,
          name: user.attributes?.name?.[0],
          phone: input.shippingPhone!,
          email: user.email,
          tax_number: input.shippingTaxNumber,
          printfulSyncVariantId: input.perkPrintfulSyncVariantId,
        })

        deductionAmount = Math.ceil(printfulCostEstimate.costs.total / POINTS_REDEEM_PRICE_USD)
      } else {
        deductionAmount = perk.price
      }

      const currentBalance = await getUserPointBalance(userId)
      const balanceAfterPurchase = currentBalance - deductionAmount

      if (balanceAfterPurchase < 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient balance.' })
      }

      const purchaseJob = await perkPurchaseQueue.add('purchase', {
        perk,
        perkPrintfulSyncVariantId: input.perkPrintfulSyncVariantId,
        shippingAddressLine1: input.shippingAddressLine1,
        shippingAddressLine2: input.shippingAddressLine2,
        shippingCountry: input.shippingCountry,
        shippingState: input.shippingState,
        shippingCity: input.shippingCity,
        shippingZip: input.shippingZip,
        shippingPhone: input.shippingPhone,
        shippingTaxNumber: input.shippingTaxNumber,
        userId: user.id,
        userEmail: user.email,
        userFullname: user?.attributes?.name?.[0],
      })

      await purchaseJob.waitUntilFinished(
        new QueueEvents('PerkPurchase', { connection: redisConnection })
      )
    }),
})
