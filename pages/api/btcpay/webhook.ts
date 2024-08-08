import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import getRawBody from 'raw-body'

import { env } from '../../../env.mjs'
import { btcpayApi, prisma } from '../../../server/services'
import { DonationMetadata } from '../../../server/types'

type Body = {
  deliveryId: string
  webhookId: string
  originalDeliveryId: string
  isRedelivery: boolean
  type: string
  timestamp: number
  storeId: string
  invoiceId: string
  metadata: Record<string, any> | null
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    await prisma.donation.updateMany({
      where: { btcPayInvoiceId: body.invoiceId },
      data: { status: 'Complete' },
    })
  }

  if (body.type === 'InvoiceExpired') {
    await prisma.donation.updateMany({
      where: { btcPayInvoiceId: body.invoiceId },
      data: { status: 'Expired' },
    })
  }

  if (body.type === 'InvoiceInvalid') {
    await prisma.donation.updateMany({
      where: { btcPayInvoiceId: body.invoiceId },
      data: { status: 'Invalid' },
    })
  }

  res.status(200).json({ success: true })
}
