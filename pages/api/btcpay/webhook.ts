import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'
import crypto from 'crypto'
import dayjs from 'dayjs'

import { DonationMetadata } from '../../../server/types'
import { btcpayApi as _btcpayApi, btcpayApi, prisma } from '../../../server/services'
import { env } from '../../../env.mjs'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  },
}

type BtcpayBody = Record<string, any> & {
  deliveryId: string
  webhookId: string
  originalDeliveryId: string
  isRedelivery: boolean
  type: string
  timestamp: number
  storeId: string
  invoiceId: string
  metadata: DonationMetadata
}

type BtcpayPaymentMethodsResponse = {
  rate: string
  amount: string
  cryptoCode: string
}[]

async function handleBtcpayWebhook(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  if (typeof req.headers['btcpay-sig'] !== 'string') {
    res.status(400).json({ success: false })
    return
  }

  const rawBody = await getRawBody(req)
  const body: BtcpayBody = JSON.parse(Buffer.from(rawBody).toString('utf8'))

  const expectedSigHash = crypto
    .createHmac('sha256', env.BTCPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  const incomingSigHash = (req.headers['btcpay-sig'] as string).split('=')[1]

  if (expectedSigHash !== incomingSigHash) {
    console.error('Invalid signature')
    res.status(400).json({ success: false })
    return
  }

  if (body.type === 'InvoicePaymentSettled') {
    // Handle payments to funding required API invoices ONLY
    if (body.metadata.staticGeneratedForApi === 'false') {
      return res.status(200).json({ success: true })
    }

    const cryptoCode = body.paymentMethod === 'BTC-OnChain' ? 'BTC' : 'XMR'

    // Get rate from Kraken
    const pair = cryptoCode === 'BTC' ? 'XBTUSD' : 'XMRUSD'
    const response = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${pair}`)
    const closePrice = Number((Object.values(response.data.result || {})[0] as any)?.c?.[0])

    const cryptoAmount = Number(body.payment.value)

    await prisma.donation.create({
      data: {
        userId: null,
        btcPayInvoiceId: body.invoiceId,
        projectName: body.metadata.projectName,
        projectSlug: body.metadata.projectSlug,
        fundSlug: body.metadata.fundSlug,
        cryptoCode,
        cryptoAmount,
        fiatAmount: Number((cryptoAmount * closePrice).toFixed(2)),
        membershipExpiresAt:
          body.metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
      },
    })
  }

  if (body.type === 'InvoiceSettled') {
    // If this is a funding required API invoice, let InvoiceReceivedPayment handle it instead
    if (body.metadata.staticGeneratedForApi === 'true') {
      return res.status(200).json({ success: true })
    }

    const { data: paymentMethods } = await btcpayApi.get<BtcpayPaymentMethodsResponse>(
      `/invoices/${body.invoiceId}/payment-methods`
    )

    const cryptoAmount = Number(paymentMethods[0].amount)
    const fiatAmount = Number(paymentMethods[0].amount) * Number(paymentMethods[0].rate)

    await prisma.donation.create({
      data: {
        userId: body.metadata.userId,
        btcPayInvoiceId: body.invoiceId,
        projectName: body.metadata.projectName,
        projectSlug: body.metadata.projectSlug,
        fundSlug: body.metadata.fundSlug,
        cryptoCode: paymentMethods[0].cryptoCode,
        cryptoAmount,
        fiatAmount: Number(fiatAmount.toFixed(2)),
        membershipExpiresAt:
          body.metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
      },
    })
  }

  res.status(200).json({ success: true })
}

export default handleBtcpayWebhook
