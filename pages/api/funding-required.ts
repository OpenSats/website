import { NextApiRequest, NextApiResponse } from 'next'
import { FundSlug } from '@prisma/client'
import { z } from 'zod'
import dayjs from 'dayjs'

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
import { fundSlugs } from '../../utils/funds'

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
  remaining_amount_btc: number
  remaining_amount_xmr: number
  remaining_amount_usd: number
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
  remaining_amount: number
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
    query.project_status === 'FUNDED'
      ? project.isFunded
      : query.project_status === 'ANY'
        ? true
        : !project.isFunded
  )

  const rates: Record<string, number | undefined> = {}

  // Get exchange rates if target asset is not USD (or if there is no target asset)
  if (query.asset !== 'USD') {
    const assetsWithoutUsd = ASSETS.filter((asset) => asset !== 'USD')
    const params = assetsWithoutUsd.map((asset) => `currencyPair=${asset}_USD`).join('&')
    const { data: _rates } = await btcpayApi.get<BtcPayGetRatesRes>(`/rates?${params}`)

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
        const existingAddresses = await prisma.projectAddresses.findUnique({
          where: { projectSlug_fundSlug: { projectSlug: project.slug, fundSlug: project.fund } },
        })

        // Create invoice if there's no existing address
        if (!existingAddresses) {
          const metadata: DonationMetadata = {
            userId: null,
            donorName: null,
            donorEmail: null,
            projectSlug: project.slug,
            projectName: project.title,
            fundSlug: project.fund as FundSlug,
            isMembership: 'false',
            isSubscription: 'false',
            isTaxDeductible: 'false',
            staticGeneratedForApi: 'true',
            givePointsBack: 'false',
            showDonorNameOnLeaderboard: 'false',
          }

          const { data: invoice } = await btcpayApi.post<BtcPayCreateInvoiceRes>('/invoices', {
            checkout: { monitoringMinutes: 9999999 },
            currency: CURRENCY,
            metadata,
          })

          const { data: paymentMethods } = await btcpayApi.get<BtcPayGetPaymentMethodsRes>(
            `/invoices/${invoice.id}/payment-methods`
          )

          paymentMethods.forEach((paymentMethod) => {
            if (paymentMethod.paymentMethod === 'BTC-CHAIN') {
              bitcoinAddress = paymentMethod.destination
            }

            if (paymentMethod.paymentMethod === 'XMR-CHAIN') {
              moneroAddress = paymentMethod.destination
            }
          })

          if (!bitcoinAddress && process.env.NODE_ENV !== 'development')
            throw new Error(
              '[/api/funding-required] Could not get bitcoin address from payment methods.'
            )

          if (!moneroAddress)
            throw new Error(
              '[/api/funding-required] Could not get monero address from payment methods.'
            )

          await prisma.projectAddresses.create({
            data: {
              projectSlug: project.slug,
              fundSlug: project.fund,
              btcPayInvoiceId: invoice.id,
              bitcoinAddress: bitcoinAddress || '',
              moneroAddress: moneroAddress,
            },
          })
        }

        if (existingAddresses) {
          bitcoinAddress = existingAddresses.bitcoinAddress
          moneroAddress = existingAddresses.moneroAddress
        }
      }

      const targetAmountBtc = project.goal / (rates.BTC || 0)
      const targetAmountXmr = project.goal / (rates.XMR || 0)
      const targetAmountUsd = project.goal

      const allDonationsSumUsd =
        project.totalDonationsBTCInFiat +
        project.totalDonationsXMRInFiat +
        project.totalDonationsFiat

      const remainingAmountBtc = (project.goal - allDonationsSumUsd) / (rates.BTC || 0)
      const remainingAmountXmr = (project.goal - allDonationsSumUsd) / (rates.XMR || 0)
      const remainingAmountUsd = project.goal - allDonationsSumUsd

      return {
        title: project.title,
        fund: project.fund,
        date: project.date,
        author: project.nym,
        url: `${env.APP_URL}/${project.fund}/${project.slug}`,
        is_funded: !!project.isFunded,
        target_amount_btc: Number(targetAmountBtc.toFixed(8)),
        target_amount_xmr: Number(targetAmountXmr.toFixed(12)),
        target_amount_usd: Number(targetAmountUsd.toFixed(2)),
        remaining_amount_btc: Number((remainingAmountBtc > 0 ? remainingAmountBtc : 0).toFixed(8)),
        remaining_amount_xmr: Number((remainingAmountXmr > 0 ? remainingAmountXmr : 0).toFixed(12)),
        remaining_amount_usd: Number((remainingAmountUsd > 0 ? remainingAmountUsd : 0).toFixed(2)),
        address_btc: bitcoinAddress,
        address_xmr: moneroAddress,
        raised_amount_percent: Math.floor(
          ((project.totalDonationsBTCInFiat +
            project.totalDonationsXMRInFiat +
            project.totalDonationsFiat) /
            project.goal) *
            100
        ),
        contributions: project.numDonationsBTC + project.numDonationsXMR + project.numDonationsFiat,
      }
    })
  )

  if (query.asset) {
    responseBody = responseBody.map<ResponseBodySpecificAsset[0]>((project) => {
      const targetAmounts: Record<Asset, number> = {
        BTC: project.target_amount_btc,
        XMR: project.target_amount_xmr,
        USD: project.target_amount_usd,
      }

      const remainingAmounts: Record<Asset, number> = {
        BTC: project.remaining_amount_btc,
        XMR: project.remaining_amount_xmr,
        USD: project.remaining_amount_usd,
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
        target_amount: targetAmounts[query.asset!],
        remaining_amount: remainingAmounts[query.asset!],
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
