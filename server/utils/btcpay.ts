import { env } from '../../env.mjs'
import { btcpayApi } from '../services'

type InvoiceInput = {
  price: number
  currency: string
  orderId?: string
  itemDesc?: string
  buyerEmail?: string
}

type Invoice = {
  id: string
  url: string
  checkoutLink: string // Add this property to retrieve the payment page URL
}

export async function createInvoice(invoice: InvoiceInput): Promise<Invoice> {
  try {
    const response = await btcpayApi.post(
      `/stores/${env.BTCPAY_STORE_ID}/invoices`,
      invoice
    )

    return response.data
  } catch (error) {
    console.error('Error creating invoice')
    throw error
  }
}
