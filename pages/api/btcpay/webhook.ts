import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'
import crypto from 'crypto'
import dayjs from 'dayjs'

import {
  BtcPayGetRatesRes,
  BtcPayGetPaymentMethodsRes,
  DonationMetadata,
} from '../../../server/types'
import { btcpayApi as _btcpayApi, btcpayApi, prisma } from '../../../server/services'
import { env } from '../../../env.mjs'
import { sendDonationConfirmationEmail } from '../../../server/utils/mailing'

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
  metadata?: DonationMetadata
  paymentMethod: string
}

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

  if (!body.metadata) {
    return res.status(200).json({ success: true })
  }

  if (body.type === 'InvoicePaymentSettled') {
    // Handle payments to funding required API invoices ONLY
    if (body.metadata.staticGeneratedForApi === 'false') {
      return res.status(200).json({ success: true })
    }

    // Handle payment methods like "BTC-LightningNetwork" if added in the future
    const cryptoCode = body.paymentMethod.includes('-')
      ? body.paymentMethod.split('-')[0]
      : body.paymentMethod

    const { data: rates } = await btcpayApi.get<BtcPayGetRatesRes>(
      `/rates?currencyPair=${cryptoCode}_USD`
    )

    const cryptoRate = Number(rates[0].rate)
    const cryptoAmount = Number(body.payment.value)

    await prisma.donation.create({
      data: {
        userId: null,
        btcPayInvoiceId: body.invoiceId,
        projectName: body.metadata.projectName,
        projectSlug: body.metadata.projectSlug,
        fundSlug: body.metadata.fundSlug,
        cryptoCode,
        netCryptoAmount: cryptoAmount,
        grossCryptoAmount: cryptoAmount,
        netFiatAmount: Number((cryptoAmount * cryptoRate).toFixed(2)),
        grossFiatAmount: Number((cryptoAmount * cryptoRate).toFixed(2)),
      },
    })
  }

  if (body.type === 'InvoiceSettled') {
    // If this is a funding required API invoice, let InvoiceReceivedPayment handle it instead
    if (body.metadata.staticGeneratedForApi === 'true') {
      return res.status(200).json({ success: true })
    }

    const { data: paymentMethods } = await btcpayApi.get<BtcPayGetPaymentMethodsRes>(
      `/invoices/${body.invoiceId}/payment-methods`
    )

    await Promise.all(
      paymentMethods.map(async (paymentMethod) => {
        if (!body.metadata) return

        const cryptoAmount = Number(paymentMethod.paymentMethodPaid)

        if (!cryptoAmount) return

        const fiatAmount = Number(paymentMethod.paymentMethodPaid) * Number(paymentMethod.rate)

        await prisma.donation.create({
          data: {
            userId: body.metadata.userId,
            btcPayInvoiceId: body.invoiceId,
            projectName: body.metadata.projectName,
            projectSlug: body.metadata.projectSlug,
            fundSlug: body.metadata.fundSlug,
            cryptoCode: paymentMethod.cryptoCode,
            netCryptoAmount: cryptoAmount,
            grossCryptoAmount: cryptoAmount,
            netFiatAmount: Number(fiatAmount.toFixed(2)),
            grossFiatAmount: Number(fiatAmount.toFixed(2)),
            membershipExpiresAt:
              body.metadata.isMembership === 'true' ? dayjs().add(1, 'year').toDate() : null,
          },
        })

        if (body.metadata.donorEmail && body.metadata.donorName) {
          sendDonationConfirmationEmail({
            to: body.metadata.donorEmail,
            donorName: body.metadata.donorName,
            fundSlug: body.metadata.fundSlug,
            projectName: body.metadata.projectName,
            isMembership: body.metadata.isMembership === 'true',
            isSubscription: false,
            pointsReceived: 0,
            btcpayAsset: paymentMethod.cryptoCode as 'BTC' | 'XMR',
            btcpayCryptoAmount: cryptoAmount,
          })
        }
      })
    )
  }

  res.status(200).json({ success: true })
}

export default handleBtcpayWebhook
