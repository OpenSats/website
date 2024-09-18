import { NextApiRequest, NextApiResponse } from 'next'
import { FundSlug } from '@prisma/client'
import { z } from 'zod'
import axios from 'axios'
import path from 'path'

import { getProjects } from '../../utils/md'
import { env } from '../../env.mjs'
import { btcpayApi, prisma } from '../../server/services'
import { CURRENCY } from '../../config'
import {
  BtcPayCreateInvoiceBody,
  BtcPayCreateInvoiceRes,
  BtcPayGetPaymentMethodsRes,
  BtcPayGetRatesRes,
  DonationMetadata,
} from '../../server/types'

type ResponseBody = {
  title: string
  fund: FundSlug
  date: string
  address_xmr: string
  address_btc: string
  author: string
  url: string
  target_amount_asset: 'BTC' | 'XMR' | 'USD'
  target_amount: number
  raised_amount_percent: number
  contributions: number
}[]

const querySchema = z.object({ target_amount_asset: z.enum(['BTC', 'XMR', 'USD']) })

async function handle(req: NextApiRequest, res: NextApiResponse<ResponseBody>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const query = await querySchema.parseAsync(req.query)

  const projects = await getProjects()
  const notFundedProjects = projects.filter((project) => !project.isFunded)

  let cryptoRate: number | null = null

  // Get exchange rate if target asset is not USD
  if (query.target_amount_asset !== 'USD') {
    const asset = query.target_amount_asset

    const { data: rates } = await btcpayApi.get<BtcPayGetRatesRes>(
      `/rates?currencyPair=${asset}_USD`
    )

    cryptoRate = Number(rates[0].rate)
  }

  const responseBody: ResponseBody = await Promise.all(
    notFundedProjects.map(async (project): Promise<ResponseBody[0]> => {
      const existingAddresses = await prisma.projectAddresses.findFirst({
        where: { projectSlug: project.slug, fundSlug: project.fund },
      })

      let bitcoinAddress = ''
      let moneroAddress = ''

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

      return {
        title: project.title,
        fund: project.fund,
        date: project.date,
        author: project.nym,
        url: path.join(env.APP_URL, project.fund, project.slug),
        target_amount: cryptoRate ? project.goal / cryptoRate : project.goal,
        address_btc: bitcoinAddress,
        address_xmr: moneroAddress,
        raised_amount_percent:
          (project.totaldonationsinfiatxmr +
            project.totaldonationsinfiatbtc +
            project.fiattotaldonationsinfiat) /
          project.goal,
        target_amount_asset: query.target_amount_asset,
        contributions: project.numdonationsbtc + project.numdonationsxmr + project.fiatnumdonations,
      }
    })
  )

  return res.send(responseBody)
}

export default handle
