import { NextApiRequest, NextApiResponse } from 'next'
import { FundSlug } from '@prisma/client'
import { z } from 'zod'
import dayjs from 'dayjs'
import path from 'path'

import { getProjects } from '../../utils/md'
import { env } from '../../env.mjs'
import { btcpayApi, prisma } from '../../server/services'
import { CURRENCY } from '../../config'
import {
  BtcPayCreateInvoiceRes,
  BtcPayGetPaymentMethodsRes,
  BtcPayGetRatesRes,
  DonationMetadata,
} from '../../server/types'
import { funds, fundSlugs } from '../../utils/funds'

const ASSETS = ['BTC', 'XMR', 'USD'] as const

type Asset = (typeof ASSETS)[number]

type ResponseBody = {
  title: string
  fund: FundSlug
  date: string
  author: string
  url: string
  is_funded: boolean
  raised_amount_percent: number
  contributions: number
  target_amount_btc: number
  target_amount_xmr: number
  target_amount_usd: number
  address_btc: string | null
  address_xmr: string | null
}[]

type ResponseBodySpecificAsset = {
  title: string
  fund: FundSlug
  date: string
  author: string
  url: string
  is_funded: boolean
  raised_amount_percent: number
  contributions: number
  asset: Asset
  target_amount: number
  address: string | null
}[]

// The cache key should be: fund-asset-project_status
const cachedResponses: Record<
  string,
  { data: ResponseBody | ResponseBodySpecificAsset; expiresAt: Date } | undefined
> = {}

const querySchema = z.object({
  fund: z.enum(fundSlugs).optional(),
  asset: z.enum(ASSETS).optional(),
  project_status: z.enum(['FUNDED', 'NOT_FUNDED', 'ANY']).default('NOT_FUNDED'),
})

async function handle(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody | ResponseBodySpecificAsset>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const query = await querySchema.parseAsync(req.query)

  // Get response from cache
  const cacheKey = `${query.fund}-${query.asset}-${query.project_status}`
  const cachedResponse = cachedResponses[cacheKey]
  if (cachedResponse && cachedResponse.expiresAt > new Date()) {
    return res.send(cachedResponse.data)
  }

  const projects = (await getProjects(query.fund)).filter((project) =>
    query.project_status === 'ANY' || query.project_status === 'FUNDED'
      ? project.isFunded
      : !project.isFunded
  )

  const rates: Record<string, number | undefined> = {}

  // Get exchange rates if target asset is not USD (or if there is no target asset)
  if (query.asset !== 'USD') {
    const assetsWithoutUsd = ASSETS.filter((asset) => asset !== 'USD')
    const params = assetsWithoutUsd.map((asset) => `currencyPair=${asset}_USD`).join('&')
    const { data: _rates } = await btcpayApi.get<BtcPayGetRatesRes>(`/rates?${params}`)
    console.log(params)

    _rates.forEach((rate) => {
      const asset = rate.currencyPair.split('_')[0] as string
      rates[asset] = Number(rate.rate)
    })
  }

  let responseBody: ResponseBody | ResponseBodySpecificAsset = await Promise.all(
    projects.map(async (project): Promise<ResponseBody[0]> => {
      let bitcoinAddress: string | null = null
      let moneroAddress: string | null = null

      if (!project.isFunded) {
        const existingAddresses = await prisma.projectAddresses.findFirst({
          where: { projectSlug: project.slug, fundSlug: project.fund },
        })

        // Create invoice if there's no existing address
        if (!existingAddresses) {
          const metadata: DonationMetadata = {
            userId: null,
            donorName: null,
            donorEmail: null,
            projectSlug: project.slug,
            projectName: project.title,
            fundSlug: project.slug as FundSlug,
            isMembership: 'false',
            isSubscription: 'false',
            isTaxDeductible: 'false',
            staticGeneratedForApi: 'true',
          }

          const invoiceCreateResponse = await btcpayApi.post<BtcPayCreateInvoiceRes>('/invoices', {
            currency: CURRENCY,
            metadata,
          })

          const invoiceId = invoiceCreateResponse.data.id

          const paymentMethodsResponse = await btcpayApi.get<BtcPayGetPaymentMethodsRes>(
            `/invoices/${invoiceId}/payment-methods`
          )

          paymentMethodsResponse.data.forEach((paymentMethod: any) => {
            if (paymentMethod.paymentMethod === 'BTC-OnChain') {
              bitcoinAddress = paymentMethod.destination
            }

            if (paymentMethod.paymentMethod === 'XMR') {
              moneroAddress = paymentMethod.destination
            }
          })
        }

        if (existingAddresses) {
          bitcoinAddress = existingAddresses.bitcoinAddress
          moneroAddress = existingAddresses.moneroAddress
        }
      }

      return {
        title: project.title,
        fund: project.fund,
        date: project.date,
        author: project.nym,
        url: path.join(env.APP_URL, project.fund, project.slug),
        is_funded: !!project.isFunded,
        target_amount_btc: rates.BTC ? project.goal / rates.BTC : 0,
        target_amount_xmr: rates.XMR ? project.goal / rates.XMR : 0,
        target_amount_usd: project.goal,
        address_btc: bitcoinAddress,
        address_xmr: moneroAddress,
        raised_amount_percent:
          ((project.totaldonationsinfiatxmr +
            project.totaldonationsinfiatbtc +
            project.fiattotaldonationsinfiat) /
            project.goal) *
          100,
        contributions: project.numdonationsbtc + project.numdonationsxmr + project.fiatnumdonations,
      }
    })
  )

  if (query.asset) {
    responseBody = responseBody.map<ResponseBodySpecificAsset[0]>((project) => {
      const amounts: Record<Asset, number> = {
        BTC: project.target_amount_btc,
        XMR: project.target_amount_xmr,
        USD: project.target_amount_usd,
      }

      const addresses: Record<Asset, string | null> = {
        BTC: project.address_btc,
        XMR: project.address_xmr,
        USD: null,
      }

      return {
        title: project.title,
        fund: project.fund,
        date: project.date,
        author: project.author,
        url: project.url,
        is_funded: project.is_funded,
        target_amount: amounts[query.asset!],
        address: addresses[query.asset!],
        raised_amount_percent: project.raised_amount_percent,
        contributions: project.contributions,
        asset: query.asset!,
      }
    })
  }

  // Store response in cache
  cachedResponses[cacheKey] = {
    data: responseBody,
    expiresAt: dayjs().add(10, 'minutes').toDate(),
  }

  return res.send(responseBody)
}

export default handle
