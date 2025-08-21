import { NextApiRequest } from 'next/types'
import * as crypto from 'crypto'
import {
  maskEmail,
  maskName,
  sendDonationReceipt,
  sendDonationNotification,
} from './email-helpers'

// BTCPay Server webhook event types
export interface BTCPayWebhookEvent {
  deliveryId: string
  webhookId: string
  originalDeliveryId: string
  isRedelivery: boolean
  type: string
  timestamp: number
  storeId: string
  invoiceId: string
  payment?: {
    value: string
    network: string
    method: string
    destination: string
    rate: number
    paymentMethodFee: string
    totalPaid: string
    due: string
    amount: string
    networkFee: string
    payments: Array<{
      id: string
      receivedDate: number
      value: string
      fee: string
      networkFee: string
      paymentMethod: string
      paymentMethodFee: string
      rate: number
      destination: string
      network: string
    }>
  }
  metadata?: {
    orderId?: string
    fund_name?: string
    buyerName?: string
    buyerEmail?: string
    posData?: {
      orderId?: string
      zaprite_campaign?: string
      fund_name?: string
      buyerName?: string
      buyerEmail?: string
    }
    zaprite_campaign?: string
    recipient_uuid?: string
  }
}



/**
 * Helper function to get raw body from request
 */
export function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })
}



/**
 * Verify BTCPay Server webhook signature
 */
export function verifyWebhookSignature(
  body: Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    // BTCPay Server sends signature in format: "sha256=hash"
    const signatureHash = signature.replace('sha256=', '')

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    // Log signature verification result
    console.log(
      '🔍 Signature verification:',
      signatureHash === expectedSignature ? '✅ valid' : '❌ invalid'
    )

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Process BTCPay webhook event and send donation receipt
 */
export async function processBTCPayWebhook(
  event: BTCPayWebhookEvent,
  fundName: string
): Promise<void> {
  if (event.type === 'InvoicePaymentSettled') {
    const donorName =
      event.metadata?.buyerName ||
      event.metadata?.posData?.buyerName ||
      'Anonymous'
    const donorEmail =
      event.metadata?.buyerEmail ||
      event.metadata?.posData?.buyerEmail ||
      'No email provided'
    const fundDisplayName =
      event.metadata?.fund_name ||
      event.metadata?.posData?.fund_name ||
      fundName
    const invoiceId = event.invoiceId

    // Extract payment amount from the webhook event
    const paymentAmount =
      event.payment?.amount || event.payment?.value || 'Unknown'
    const paymentCurrency = event.payment?.method === 'BTC' ? 'BTC' : 'BTC' // Default to BTC for BTCPay

    console.log(`🎉 ${fundName} Invoice Payment Settled!`)
    console.log('📧 Donor Email:', maskEmail(donorEmail))
    console.log('👤 Donor Name:', maskName(donorName))
    console.log('💰 Fund:', fundDisplayName)
    console.log('🆔 Invoice ID:', invoiceId)
    console.log('💸 Amount:', paymentAmount, paymentCurrency)
    console.log('⏰ Timestamp:', new Date(event.timestamp * 1000).toISOString())

    // Send donation receipt via SendGrid
    if (donorEmail && donorEmail !== 'No email provided') {
      console.log('📧 Sending donation receipt...')
      const receiptSent = await sendDonationReceipt(
        donorEmail,
        donorName,
        fundDisplayName,
        invoiceId,
        paymentAmount,
        paymentCurrency,
        'bitcoin'
      )

      if (receiptSent) {
        console.log('✅ Donation receipt sent successfully!')
      } else {
        console.log('❌ Failed to send donation receipt')
      }
    } else {
      console.log('⚠️  No valid email address, skipping receipt')
    }

    // Send donation notification to admins
    console.log('📧 Sending donation notification to admins...')
    const notificationSent = await sendDonationNotification(
      donorEmail,
      donorName,
      fundDisplayName,
      invoiceId,
      paymentAmount,
      paymentCurrency,
      'bitcoin'
    )

    if (notificationSent) {
      console.log('✅ Donation notification sent successfully!')
    } else {
      console.log('❌ Failed to send donation notification')
    }
  }
}
