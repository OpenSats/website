import { AxiosResponse } from 'axios'
import { printfulApi, prisma, strapiApi } from '../services'
import {
  PrintfulEstimateOrderReq,
  PrintfulEstimateOrderRes,
  StrapiGetPointsPopulatedRes,
} from '../types'

export async function getUserPointBalance(userId: string): Promise<number> {
  const {
    data: { data: pointHistory },
  } = await strapiApi.get<StrapiGetPointsPopulatedRes>(
    `/points?filters[userId][$eq]=${userId}&sort=createdAt:desc&populate=*`
  )

  const lastPointHistory = pointHistory[0]
  const currentBalance = lastPointHistory ? Number(lastPointHistory.balance) : 0

  return currentBalance
}

type EstimatePrintfulOrderCostParams = {
  printfulSyncVariantId: number
  address1: string
  address2: string
  city: string
  stateCode: string
  countryCode: string
  zip: string
  name: string
  phone: string
  email: string
  tax_number?: string
}

export async function estimatePrintfulOrderCost({
  printfulSyncVariantId,
  address1,
  address2,
  city,
  stateCode,
  countryCode,
  zip,
  name,
  phone,
  email,
  tax_number,
}: EstimatePrintfulOrderCostParams) {
  const {
    data: { result: costEstimate },
  } = await printfulApi.post<{}, AxiosResponse<PrintfulEstimateOrderRes>, PrintfulEstimateOrderReq>(
    `/orders/estimate-costs`,
    {
      recipient: {
        address1,
        address2,
        city,
        state_code: stateCode,
        country_code: countryCode,
        zip,
        name,
        phone,
        email,
        tax_number,
      },
      items: [{ quantity: 1, sync_variant_id: printfulSyncVariantId }],
    }
  )

  return costEstimate
}
