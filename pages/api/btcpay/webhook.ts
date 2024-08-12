import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import getRawBody from 'raw-body'

import { env } from '../../../env.mjs'
import { btcpayApi, prisma } from '../../../server/services'
import { DonationMetadata } from '../../../server/types'
import dayjs from 'dayjs'

type Body = {
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

type PaymentMethodsResponse = {
  rate: string
  amount: string
  cryptoCode: string
}[]

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const body: Body = JSON.parse(Buffer.from(rawBody).toString('utf8'))

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

  if (body.type === 'InvoiceSettled') {
    const { data: paymentMethods } = await btcpayApi.get<PaymentMethodsResponse>(
      `stores/${env.BTCPAY_STORE_ID}/invoices/${body.invoiceId}/payment-methods`
    )

    const fiatAmount = Math.round(
      Number(paymentMethods[0].amount) * Number(paymentMethods[0].rate) * 100
    )

    await prisma.donation.create({
      data: {
        userId: body.metadata.userId,
        btcPayInvoiceId: body.invoiceId,
        projectName: body.metadata.projectName,
        projectSlug: body.metadata.projectSlug,
        fund: 'Monero Fund',
        cryptoCode: paymentMethods[0].cryptoCode,
        fiatAmount,
        membershipExpiresAt:
          body.metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
      },
    })
  }

  res.status(200).json({ success: true })
}
