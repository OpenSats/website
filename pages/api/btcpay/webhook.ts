import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'
import crypto from 'crypto'
import dayjs from 'dayjs'

import { DonationMetadata } from '../../../server/types'
import { btcpayApi as _btcpayApi, btcpayApi, prisma } from '../../../server/services'
import { env } from '../../../env.mjs'

export const config = {
  api: {
    bodyParser: false,
  },
}

type BtcpayBody = {
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

  if (body.type === 'InvoiceSettled') {
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
