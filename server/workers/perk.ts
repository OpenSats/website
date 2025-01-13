import { Worker } from 'bullmq'
import { AxiosResponse } from 'axios'
import { TRPCError } from '@trpc/server'

import { redisConnection as connection } from '../../config/redis'
import { estimatePrintfulOrderCost, getUserPointBalance } from '../utils/perks'
import { POINTS_REDEEM_PRICE_USD } from '../../config'
import {
  PrintfulCreateOrderReq,
  PrintfulCreateOrderRes,
  StrapiCreateOrderBody,
  StrapiCreateOrderRes,
  StrapiCreatePointBody,
  StrapiPerk,
} from '../types'
import { printfulApi, strapiApi } from '../services'
import { sendPerkPurchaseConfirmationEmail } from '../utils/mailing'

export type PerkPurchaseWorkerData = {
  perk: StrapiPerk
  perkPrintfulSyncVariantId?: number
  shippingAddressLine1?: string
  shippingAddressLine2?: string
  shippingZip?: string
  shippingCity?: string
  shippingState?: string
  shippingCountry?: string
  shippingPhone?: string
  shippingTaxNumber?: string
  userId: string
  userEmail: string
  userFullname: string
}

const globalForWorker = global as unknown as { hasInitializedWorkers: boolean }

if (!globalForWorker.hasInitializedWorkers)
  new Worker<PerkPurchaseWorkerData>(
    'PerkPurchase',
    async (job) => {
      // Check if user has enough balance
      let deductionAmount = 0

      if (job.data.perk.printfulProductId && job.data.perkPrintfulSyncVariantId) {
        const printfulCostEstimate = await estimatePrintfulOrderCost({
          address1: job.data.shippingAddressLine1!,
          address2: job.data.shippingAddressLine2 || '',
          city: job.data.shippingCity!,
          stateCode: job.data.shippingState!,
          countryCode: job.data.shippingCountry!,
          zip: job.data.shippingZip!,
          phone: job.data.shippingPhone!,
          name: job.data.userFullname,
          email: job.data.userEmail,
          tax_number: job.data.shippingTaxNumber,
          printfulSyncVariantId: job.data.perkPrintfulSyncVariantId,
        })

        deductionAmount = Math.ceil(printfulCostEstimate.costs.total / POINTS_REDEEM_PRICE_USD)
      } else {
        deductionAmount = job.data.perk.price
      }

      const currentBalance = await getUserPointBalance(job.data.userId)
      const balanceAfterPurchase = currentBalance - deductionAmount

      if (balanceAfterPurchase < 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient balance.' })
      }

      // Create printful order (if applicable)
      if (job.data.perk.printfulProductId && job.data.perkPrintfulSyncVariantId) {
        const result = await printfulApi.post<
          {},
          AxiosResponse<PrintfulCreateOrderRes>,
          PrintfulCreateOrderReq
        >(process.env.NODE_ENV === 'production' ? '/orders?confirm=true' : '/orders', {
          recipient: {
            address1: job.data.shippingAddressLine1!,
            address2: job.data.shippingAddressLine2 || '',
            city: job.data.shippingCity!,
            state_code: job.data.shippingState!,
            country_code: job.data.shippingCountry!,
            zip: job.data.shippingZip!,
            phone: job.data.shippingPhone!,
            name: job.data.userFullname,
            email: job.data.userEmail,
            tax_number: job.data.shippingTaxNumber,
          },
          items: [{ quantity: 1, sync_variant_id: job.data.perkPrintfulSyncVariantId }],
        })
      }

      // Create strapi order
      const {
        data: { data: order },
      } = await strapiApi.post<StrapiCreateOrderRes, any, StrapiCreateOrderBody>('/orders', {
        data: {
          perk: job.data.perk.documentId,
          userId: job.data.userId,
          userEmail: job.data.userEmail,
          shippingAddressLine1: job.data.shippingAddressLine1,
          shippingAddressLine2: job.data.shippingAddressLine2,
          shippingCity: job.data.shippingCity,
          shippingState: job.data.shippingState,
          shippingCountry: job.data.shippingCountry,
          shippingZip: job.data.shippingZip,
          shippingPhone: job.data.shippingPhone,
        },
      })

      try {
        // Deduct points
        await strapiApi.post<any, any, StrapiCreatePointBody>('/points', {
          data: {
            balanceChange: (-deductionAmount).toString(),
            balance: balanceAfterPurchase.toString(),
            userId: job.data.userId,
            perk: job.data.perk.documentId,
            order: order.documentId,
          },
        })
      } catch (error) {
        // If it fails, delete order
        await strapiApi.delete(`/orders/${order.documentId}`)
        throw error
      }

      sendPerkPurchaseConfirmationEmail({
        to: job.data.userEmail,
        perkName: job.data.perk.name,
        pointsRedeemed: deductionAmount,
        address: job.data.shippingAddressLine1
          ? {
              address1: job.data.shippingAddressLine1,
              address2: job.data.shippingAddressLine2,
              state: job.data.shippingState,
              city: job.data.shippingCity!,
              country: job.data.shippingCountry!,
              zip: job.data.shippingZip!,
            }
          : undefined,
      })
    },
    { connection, concurrency: 1 }
  )

if (process.env.NODE_ENV !== 'production') globalForWorker.hasInitializedWorkers = true
