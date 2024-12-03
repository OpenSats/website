import { NextApiRequest, NextApiResponse } from 'next'
import { env } from '../../../env.mjs'
import { strapiApi } from '../../../server/services'
import { StrapiGetOrdersPopulatedRes, StrapiUpdateOrderBody } from '../../../server/types'
import { sendPackageTrackingInfo } from '../../../server/utils/mailing'

type Body = {
  type: string
  data: {
    shipment: {
      id: number
      carrier: string
      service: string
      tracking_number: string
      tracking_url: string
      created: number
      ship_date: string
      shipped_at: number
      reshipment: boolean
    }
    order: {
      id: number
      external_id: string
      store: number
      status: string
      shipping: string
      shipping_service_name: string
      created: number
      updated: number
    }
  }
}

async function handlePrintfulWebhook(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return
  }

  const secret = req.query.secret

  if (env.PRINTFUL_WEBHOOK_SECRET !== secret) {
    return res.status(401).end()
  }

  const body: Body = req.body

  if (body.type !== 'package_shipped') {
    return res.end()
  }

  const {
    data: { data: strapiOrders },
  } = await strapiApi.get<StrapiGetOrdersPopulatedRes>(
    `/orders?filters[printfulOrderId][$eq]=${body.data.order.id}&populate=perk`
  )

  const strapiOrder = strapiOrders?.[0]

  if (!strapiOrder) {
    console.log(
      '[/api/printful/webhook] Strapi order for Printful order ID',
      body.data.order.id,
      'not found.'
    )
    return res.status(400).send({ error: 'Strapi order not found.' })
  }

  await strapiApi.put<any, any, StrapiUpdateOrderBody>(`/orders/${strapiOrder.documentId}`, {
    data: {
      printfulCarrier: body.data.shipment.carrier,
      printfulTrackingUrl: body.data.shipment.tracking_url,
      printfulTrackingNumber: body.data.shipment.tracking_number,
    },
  })

  sendPackageTrackingInfo({
    to: strapiOrder.userEmail,
    perkName: strapiOrder.perk.name,
    carrier: body.data.shipment.carrier,
    trackingUrl: body.data.shipment.tracking_url,
    trackingNumber: body.data.shipment.tracking_number,
  })
}

export default handlePrintfulWebhook
